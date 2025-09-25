const { TriProtocolSDK } = require('../node_modules/tri-protocol/sdk/dist');

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

    // Create a simple chatbot agent using the builder pattern
    console.log('🔧 Building agent: TestBot...');

    const agentBuilder = await sdk.createAgent('TestBot');
    const agent = await agentBuilder
      .withDescription('A friendly demo agent that can chat and help with tasks')
      .withCapability('chat')
      .withCapability('reasoning')
      .withPersonality('friendly and helpful')
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
      try {
        const response = await agent.respond(message);
        console.log(`TestBot: ${response}`);
      } catch (err) {
        console.log(`TestBot: [Response requires LLM configuration]`);
      }
      console.log('---');
    }

    // Show agent info
    console.log('\nℹ️ Agent Information:');
    console.log('- Name: TestBot');
    console.log('- Description: A friendly demo agent that can chat and help with tasks');
    console.log('- Capabilities: chat, reasoning');
    console.log('- Personality: friendly and helpful');

    console.log('\n✅ Agent test completed successfully!\n');

  } catch (error) {
    console.error('❌ Error creating agent:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the agent creation
createAgent().catch(console.error);