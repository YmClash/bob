import { GeminiService } from './gemini-service';

/**
 * LLM Manager for the debate system
 * Uses LLMService directly from tri-protocol core
 */
export class LLMManager {
  private static instance: LLMManager | null = null;
  private geminiService: GeminiService | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): LLMManager {
    if (!LLMManager.instance) {
      LLMManager.instance = new LLMManager();
    }
    return LLMManager.instance;
  }

  /**
   * Initialize the LLM service with Gemini
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🔧 Initializing LLM Manager with Gemini...');

      // Create our custom Gemini service
      this.geminiService = new GeminiService();

      // Test the connection
      const isConnected = await this.testConnection();

      if (isConnected) {
        console.log('✅ Gemini API connected and working!');
      } else {
        console.warn('⚠️ Gemini API test failed, will use fallback responses');
      }

      this.isInitialized = true;
      console.log('✅ LLM Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize LLM Manager:', error);
      this.isInitialized = true; // Still mark as initialized to use fallback
    }
  }

  /**
   * Test LLM connection
   */
  private async testConnection(): Promise<boolean> {
    if (!this.geminiService) {
      return false;
    }

    try {
      return await this.geminiService.testConnection();
    } catch (error) {
      console.warn('⚠️ LLM connection test failed:', error);
      return false;
    }
  }

  /**
   * Generate completion with system prompt for specific role
   */
  async generateResponse(prompt: string, role: 'moderator' | 'expert' | 'critic'): Promise<string> {
    const systemPrompt = this.getSystemPrompt(role);

    // Try to use Gemini service if available
    if (this.geminiService) {
      try {
        const response = await this.geminiService.generateContent(prompt, systemPrompt);
        return this.formatResponse(response);
      } catch (error) {
        console.error(`Gemini response error for ${role}:`, error);
      }
    }

    // Fallback to context-aware responses
    return this.getFallbackResponse(prompt, role);
  }

  /**
   * Direct completion method
   */
  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('LLM Manager not initialized');
    }

    if (this.geminiService) {
      try {
        return await this.geminiService.generateContent(prompt, systemPrompt);
      } catch (error) {
        console.error('Gemini completion error:', error);
      }
    }

    // Return a fallback response
    return "I'm currently unable to process this request. Please try again later.";
  }

  /**
   * Get system prompt for role
   */
  private getSystemPrompt(role: 'moderator' | 'expert' | 'critic'): string {
    const prompts = {
      moderator: `You are Sophia, a professional debate moderator. Your role is to:
1. Remain strictly neutral - never take sides
2. Ask thought-provoking questions to both parties
3. Ensure balanced participation
4. Keep responses concise (2-3 sentences max)
5. Use formal but accessible language`,

      expert: `You are Dr. Alex Chen, a subject matter expert. Your role is to:
1. Provide well-reasoned, fact-based arguments
2. Support points with examples and evidence
3. Explain complex concepts clearly
4. Be confident but not arrogant
5. Keep responses focused and concise (2-3 sentences max)`,

      critic: `You are Jordan Rivers, a critical thinker. Your role is to:
1. Question assumptions and identify flaws
2. Offer alternative perspectives
3. Play devil's advocate constructively
4. Be skeptical but not cynical
5. Keep responses concise (2-3 sentences max)`
    };

    return prompts[role];
  }

  /**
   * Get temperature setting for role
   */
  private getTemperature(role: 'moderator' | 'expert' | 'critic'): number {
    const temperatures = {
      moderator: 0.7,  // Balanced
      expert: 0.8,      // Slightly creative
      critic: 0.75      // Analytical
    };
    return temperatures[role];
  }

  /**
   * Format response to ensure proper length
   */
  private formatResponse(response: string): string {
    // Remove extra whitespace
    response = response.trim();

    // Ensure response is not too long
    const sentences = response.match(/[^.!?]+[.!?]+/g) || [response];
    if (sentences.length > 3) {
      return sentences.slice(0, 3).join(' ').trim();
    }

    return response;
  }

  /**
   * Get fallback response based on context
   */
  private getFallbackResponse(prompt: string, role: 'moderator' | 'expert' | 'critic'): string {
    const fallbacks = {
      moderator: {
        introduce: "Welcome to today's debate. We'll explore this topic from multiple perspectives. Let's begin with our expert's opening statement.",
        question: "That's an interesting point. Could you elaborate on the practical implications of your position?",
        synthesis: "Both sides have raised compelling arguments. The expert emphasizes evidence while the critic highlights important concerns.",
        conclude: "This debate has illuminated the complexity of the issue. Thank you to both participants for their thoughtful contributions.",
        default: "Let's continue exploring this topic with thoughtful analysis and respectful dialogue."
      },
      expert: {
        initial: "Based on extensive research, this topic presents significant opportunities for innovation and measurable improvements in efficiency.",
        respond: "While I acknowledge those concerns, empirical evidence shows that proper implementation yields benefits that outweigh the risks.",
        answer: "The data points to a nuanced reality where innovation and responsibility must be carefully balanced.",
        closing: "The evidence supports a thoughtful approach that embraces progress while addressing legitimate concerns.",
        default: "Based on current evidence and analysis, this topic deserves careful consideration from multiple angles."
      },
      critic: {
        challenge: "While that sounds promising, we must examine the assumptions and potential unintended consequences more carefully.",
        respond: "I appreciate the clarification, but fundamental concerns remain about scalability and long-term impacts.",
        alternative: "Consider a more gradual approach that allows for course correction as we learn from early implementations.",
        closing: "Critical thinking demands we remain vigilant about risks even as we explore new possibilities.",
        default: "The argument raises valid points, but critical analysis reveals significant challenges that warrant careful consideration."
      }
    };

    // Determine prompt type and return appropriate fallback
    const promptLower = prompt.toLowerCase();

    if (role === 'moderator') {
      if (promptLower.includes('introduce') || promptLower.includes('topic')) {
        return fallbacks.moderator.introduce;
      } else if (promptLower.includes('question')) {
        return fallbacks.moderator.question;
      } else if (promptLower.includes('synthesis') || promptLower.includes('summarize')) {
        return fallbacks.moderator.synthesis;
      } else if (promptLower.includes('conclude') || promptLower.includes('closing')) {
        return fallbacks.moderator.conclude;
      }
      return fallbacks.moderator.default;
    } else if (role === 'expert') {
      if (promptLower.includes('initial') || promptLower.includes('position')) {
        return fallbacks.expert.initial;
      } else if (promptLower.includes('respond') || promptLower.includes('defense')) {
        return fallbacks.expert.respond;
      } else if (promptLower.includes('answer') || promptLower.includes('question')) {
        return fallbacks.expert.answer;
      } else if (promptLower.includes('closing')) {
        return fallbacks.expert.closing;
      }
      return fallbacks.expert.default;
    } else { // critic
      if (promptLower.includes('challenge') || promptLower.includes('position')) {
        return fallbacks.critic.challenge;
      } else if (promptLower.includes('respond') || promptLower.includes('defense')) {
        return fallbacks.critic.respond;
      } else if (promptLower.includes('alternative') || promptLower.includes('perspective')) {
        return fallbacks.critic.alternative;
      } else if (promptLower.includes('closing')) {
        return fallbacks.critic.closing;
      }
      return fallbacks.critic.default;
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    this.geminiService = null;
    this.isInitialized = false;
    LLMManager.instance = null;
    console.log('LLM Manager shutdown complete');
  }
}