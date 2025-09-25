import { TriProtocolSDK } from 'tri-protocol/sdk/src';

async function createAgent() {
  console.log('🤖 Creating a Simple Agent with Tri-Protocol SDK\n');
  console.log('=================================================\n');

  try {
    // Initialize SDK
    const sdk = await TriProtocolSDK.initialize({
      environment: 'development',
      debug: true
    });

    console.log('✅ SDK initialized successfully\n');

    // Create a simple chatbot agent
    console.log('🔧 Building agent: TestBot...');

    const agent = await sdk.createAgent('TestBot')
      .withDescription('A friendly demo agent that can chat and help with tasks')
      .withCapability('chat')
      .withCapability('reasoning')
      .withMemory('short')
      .withSystemPrompt('You are a helpful assistant named TestBot.')
      .build();

    console.log('✅ Agent created successfully!\n');

    // Test agent responses
    console.log('💬 Testing agent conversation:\n');

    const testMessages = [
      'Hello! What is your name?',
      'What capabilities do you have?',
      'Can you help me with programming?'
    ];

    for (const message of testMessages) {
      console.log(`User: ${message}`);
      const response = await agent.respond(message);
      console.log(`TestBot: ${response}`);
      console.log('---');
    }

    // Show agent info
    console.log('\nℹ️ Agent Information:');
    console.log('- Name: TestBot');
    console.log('- Description: A friendly demo agent that can chat and help with tasks');
    console.log('- Capabilities: chat, reasoning');
    console.log('- Memory Type: short');

    console.log('\n✅ Agent test completed successfully!\n');

  } catch (error) {
    console.error('❌ Error creating agent:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Run the agent creation
createAgent().catch(console.error);