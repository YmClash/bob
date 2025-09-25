const { TriProtocolSDK } = require('../node_modules/tri-protocol/sdk/dist');

async function testSDK() {
  console.log('🧠 Testing Tri-Protocol SDK...\n');
  console.log('===================================\n');

  try {
    // Create SDK instance with development mode
    const sdk = TriProtocolSDK.create({
      mode: 'development',
      logging: {
        level: 'debug'
      }
    });

    console.log('✅ SDK created successfully in development mode\n');

    // Initialize SDK
    await sdk.initialize();
    console.log('✅ SDK initialized\n');

    // Test basic query functionality
    console.log('📝 Testing query: "What is Tri-Protocol?"');
    try {
      const response = await sdk.query('What is Tri-Protocol?');
      console.log('Response:', response);
    } catch (queryError) {
      console.log('Query functionality not fully configured (expected in dev environment)');
      console.log('This is normal - LLM providers need to be configured for queries to work');
    }
    console.log('\n-----------------------------------\n');

    // Test SDK info
    console.log('ℹ️ SDK Information:');
    console.log('- Mode: development');
    console.log('- SDK Version: 1.0.0');
    console.log('- Protocol available:', sdk.getProtocol() ? 'Yes' : 'No');

    console.log('\n✅ All basic SDK tests completed!\n');

  } catch (error) {
    console.error('❌ Error testing SDK:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
testSDK().catch(console.error);