import path from 'path';

// Import SDK
const sdkPath = path.resolve(__dirname, '../../../../node_modules/tri-protocol/sdk/dist');
const { TriProtocolSDK } = require(sdkPath);

async function testSDKWithLLM() {
  try {
    console.log('🔧 Initializing SDK with Gemini...');

    const config = {
      mode: 'development',
      llm: {
        provider: 'gemini',
        apiKey: process.env.GEMINI_API_KEY || 'test-key',
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
        temperature: 0.8,
        maxTokens: 2048
      },
      protocols: {
        a2a: { enabled: true },
        mcp: false,
        langgraph: false
      },
      logging: {
        level: 'debug',
        enabled: true
      }
    };

    // Create and initialize SDK
    const sdk = TriProtocolSDK.create(config);
    await sdk.initialize();

    console.log('✅ SDK initialized');

    // Try to access the client's llm
    const client = sdk.getClient();
    console.log('Client available:', !!client);
    console.log('Client.llm available:', !!client.llm);

    if (client.llm) {
      console.log('Client.llm methods:', Object.keys(client.llm));

      // Try a simple completion
      try {
        const response = await client.llm.complete('Say hello', {
          temperature: 0.7,
          maxTokens: 50
        });
        console.log('✅ LLM Response:', response);
      } catch (error) {
        console.error('❌ LLM call failed:', error);
      }
    }

    // Also try the query method
    try {
      const queryResponse = await sdk.query('What is 2+2?');
      console.log('✅ Query Response:', queryResponse);
    } catch (error) {
      console.error('❌ Query failed:', error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testSDKWithLLM();