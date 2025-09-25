import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';

import { DebateOrchestrator } from './orchestrator/debate';
import { createAPIRoutes } from './api/routes';
import { DebateConfig, SocketEvents } from '../shared/types';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize Express
const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS and typed events
const io = new SocketIOServer<SocketEvents>(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:4000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build (if exists)
const frontendBuildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendBuildPath));

// Initialize Debate Orchestrator
const orchestrator = new DebateOrchestrator(io);

// API Routes
app.use('/api', createAPIRoutes(orchestrator));

// Socket.io Connection Handler
io.on('connection', (socket: Socket) => {
  const clientId = socket.id;
  console.log(chalk.green('🔌 New client connected:'), chalk.cyan(clientId));

  // Handle debate start
  socket.on('debate:start', async (config: DebateConfig) => {
    try {
      console.log(chalk.blue('🎭 Starting debate:'), chalk.yellow(`"${config.topic}"`));
      console.log(chalk.gray(`   Rounds: ${config.rounds}, Provider: ${config.llmProvider}`));

      socket.emit('debate:status', {
        id: clientId,
        topic: config.topic,
        status: 'starting',
        currentRound: 0,
        totalRounds: config.rounds,
        messages: []
      });

      await orchestrator.startDebate(clientId, config, socket);
    } catch (error) {
      console.error(chalk.red('❌ Error starting debate:'), error);
      socket.emit('debate:error', {
        message: 'Failed to start debate',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Handle debate pause
  socket.on('debate:pause', () => {
    console.log(chalk.yellow('⏸️  Pausing debate:'), clientId);
    orchestrator.pauseDebate(clientId);

    socket.emit('debate:update', {
      status: 'paused'
    });
  });

  // Handle debate resume
  socket.on('debate:resume', () => {
    console.log(chalk.green('▶️  Resuming debate:'), clientId);
    orchestrator.resumeDebate(clientId);

    socket.emit('debate:update', {
      status: 'active'
    });
  });

  // Handle debate stop
  socket.on('debate:stop', () => {
    console.log(chalk.red('⏹️  Stopping debate:'), clientId);
    orchestrator.stopDebate(clientId);

    socket.emit('debate:update', {
      status: 'ended',
      endTime: new Date()
    });
  });

  // Handle user intervention
  socket.on('user:message', async (message: string) => {
    try {
      console.log(chalk.magenta('💬 User message:'), message);
      await orchestrator.handleUserMessage(clientId, message);
    } catch (error) {
      socket.emit('debate:error', {
        message: 'Failed to process user message',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(chalk.red('❌ Client disconnected:'), clientId);
    orchestrator.cleanupDebate(clientId);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      gemini: !!process.env.GEMINI_API_KEY,
      port: process.env.PORT || 3001
    }
  });
});

// Catch all route - serve React app
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ message: 'Frontend not built yet. Run npm run build:frontend' });
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(chalk.red('Server error:'), err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(chalk.bold.blue(`
╔═══════════════════════════════════════════════════════╗
║      🎭 Tri-Protocol Multi-Agent Debate System 🎭     ║
╚═══════════════════════════════════════════════════════╝`));

  console.log(chalk.white(`
  📍 Server:     ${chalk.cyan(`http://localhost:${PORT}`)}
  🔌 WebSocket:  ${chalk.green('Ready for connections')}
  🤖 Gemini AI:  ${process.env.GEMINI_API_KEY ? chalk.green('Configured ✅') : chalk.red('Not configured ❌')}
  📂 Frontend:   ${chalk.yellow('http://localhost:4000')}
  `));

  console.log(chalk.gray('  Press CTRL+C to stop the server\n'));
});