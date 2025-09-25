#!/usr/bin/env node

/**
 * Test script for the Debate System Backend
 */

const axios = require('axios').default;
const io = require('socket.io-client');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:3001';

// Test API endpoints
async function testAPI() {
  console.log(chalk.bold.blue('\n📝 Testing API Endpoints\n'));

  try {
    // Test health check
    console.log(chalk.cyan('1. Testing /health endpoint...'));
    const health = await axios.get(`${BASE_URL}/health`);
    console.log(chalk.green('✅ Health check:'), health.data);

    // Test status
    console.log(chalk.cyan('\n2. Testing /api/status endpoint...'));
    const status = await axios.get(`${BASE_URL}/api/status`);
    console.log(chalk.green('✅ API Status:'), status.data);

    // Test topic suggestions
    console.log(chalk.cyan('\n3. Testing /api/topics/suggestions endpoint...'));
    const topics = await axios.get(`${BASE_URL}/api/topics/suggestions`);
    console.log(chalk.green(`✅ Found ${topics.data.length} suggested topics`));
    console.log(chalk.gray('First topic:'), topics.data[0]);

    // Test validation
    console.log(chalk.cyan('\n4. Testing /api/debate/validate endpoint...'));
    const validation = await axios.post(`${BASE_URL}/api/debate/validate`, {
      topic: 'Will AI replace human developers?',
      rounds: 3,
      llmProvider: 'gemini'
    });
    console.log(chalk.green('✅ Validation result:'), validation.data);

    // Test Gemini health
    console.log(chalk.cyan('\n5. Testing /api/health/gemini endpoint...'));
    try {
      const gemini = await axios.get(`${BASE_URL}/api/health/gemini`);
      console.log(chalk.green('✅ Gemini status:'), gemini.data);
    } catch (error) {
      console.log(chalk.yellow('⚠️  Gemini connection failed (expected if API key not set)'));
    }

  } catch (error) {
    console.error(chalk.red('❌ API Test failed:'), error.message);
  }
}

// Test WebSocket connection
async function testWebSocket() {
  console.log(chalk.bold.blue('\n🔌 Testing WebSocket Connection\n'));

  const socket = io(BASE_URL, {
    transports: ['websocket'],
    upgrade: false
  });

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log(chalk.green('✅ WebSocket connected!'));
      console.log(chalk.gray('   Socket ID:'), socket.id);

      // Test basic debate start (will fail without proper Gemini key)
      console.log(chalk.cyan('\n6. Testing debate:start event...'));

      socket.emit('debate:start', {
        topic: 'Test debate topic',
        rounds: 1,
        llmProvider: 'gemini'
      });

      // Listen for responses
      socket.on('debate:status', (status) => {
        console.log(chalk.green('✅ Received debate:status:'), status);
      });

      socket.on('debate:error', (error) => {
        console.log(chalk.yellow('⚠️  Debate error (expected without Gemini key):'), error.message);
      });

      socket.on('agent:thinking', (agent) => {
        console.log(chalk.blue('🤔 Agent thinking:'), agent.name);
      });

      socket.on('agent:speaking', (data) => {
        console.log(chalk.magenta('💬 Agent speaking:'), data.agent.name);
      });

      // Disconnect after 5 seconds
      setTimeout(() => {
        console.log(chalk.cyan('\n7. Testing disconnect...'));
        socket.disconnect();
        console.log(chalk.green('✅ WebSocket disconnected cleanly'));
        resolve();
      }, 5000);
    });

    socket.on('connect_error', (error) => {
      console.error(chalk.red('❌ WebSocket connection failed:'), error.message);
      resolve();
    });
  });
}

// Main test runner
async function runTests() {
  console.log(chalk.bold.yellow(`
╔═══════════════════════════════════════════════════════╗
║        🧪 Backend Test Suite for Debate System        ║
╚═══════════════════════════════════════════════════════╝
  `));

  console.log(chalk.gray('Target server:'), chalk.cyan(BASE_URL));
  console.log(chalk.gray('Time:'), new Date().toLocaleString());
  console.log(chalk.gray('─'.repeat(50)));

  // Run API tests
  await testAPI();

  // Run WebSocket tests
  await testWebSocket();

  console.log(chalk.bold.green(`
╔═══════════════════════════════════════════════════════╗
║                   ✅ Tests Completed                   ║
╚═══════════════════════════════════════════════════════╝
  `));

  console.log(chalk.yellow('\n📝 Notes:'));
  console.log(chalk.gray('- If Gemini API key is not set, LLM features will not work'));
  console.log(chalk.gray('- The server must be running on port 3001'));
  console.log(chalk.gray('- WebSocket tests include a 5-second connection test'));

  process.exit(0);
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    console.error(chalk.red(`\n❌ Server not running on ${BASE_URL}`));
    console.log(chalk.yellow('Please start the server with: npm start'));
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
})();