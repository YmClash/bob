import path from 'path';

// Import LLMService and GeminiProvider from the SDK
const corePath = path.resolve(__dirname, '../../../../node_modules/tri-protocol/core/dist');
const { LLMService, GeminiProvider } = require(path.join(corePath, 'services/llm'));

let llmServiceInstance: any = null;

/**
 * Initialize LLM Service with Gemini provider
 */
export async function initializeLLMService() {
  if (llmServiceInstance) {
    return llmServiceInstance;
  }

  try {
    console.log('🔧 Initializing LLM Service with Gemini...');

    const config = {
      providers: [
        {
          type: 'gemini',
          enabled: true,
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
          endpoint: 'https://generativelanguage.googleapis.com/v1beta',
          priority: 1,
          timeout: 30000
        }
      ],
      defaultProvider: 'gemini',
      fallbackStrategy: 'none',
      enableCache: true,
      cacheConfig: {
        ttl: 60000,
        maxSize: 1048576
      }
    };

    llmServiceInstance = new LLMService(config);
    console.log('✅ LLM Service initialized with Gemini');

    return llmServiceInstance;
  } catch (error) {
    console.error('❌ Failed to initialize LLM Service:', error);
    throw error;
  }
}

/**
 * Get LLM Service instance
 */
export function getLLMService() {
  if (!llmServiceInstance) {
    throw new Error('LLM Service not initialized. Call initializeLLMService() first.');
  }
  return llmServiceInstance;
}

/**
 * Test LLM Service
 */
export async function testLLMService() {
  try {
    const service = getLLMService();
    const response = await service.complete('Say hello', {
      temperature: 0.7,
      maxTokens: 50
    });
    console.log('✅ LLM Service test successful:', response);
    return true;
  } catch (error) {
    console.error('❌ LLM Service test failed:', error);
    return false;
  }
}