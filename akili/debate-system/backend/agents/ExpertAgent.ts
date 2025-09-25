import { AgentInfo, DebateMessage } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { LLMManager } from '../services/llm-manager';

/**
 * Expert Agent - Provides informed, evidence-based arguments
 */
export class ExpertAgent {
  private llmManager: LLMManager;
  public info: AgentInfo;

  constructor() {
    this.llmManager = LLMManager.getInstance();
    this.info = {
      id: uuidv4(),
      name: 'Dr. Alexandre Chen',
      role: 'expert',
      avatar: '👨‍🔬',
      color: '#10B981',
      personality: 'Expert compétent, analytique et basé sur les preuves',
      systemPrompt: `Tu es le Dr. Alexandre Chen, un expert en la matière avec une connaissance approfondie de la technologie, de la science et de l'innovation. Ton rôle est de :
1. Fournir des arguments bien raisonnés et fondés sur des faits
2. Soutenir tes points avec des exemples et des preuves
3. Expliquer clairement les concepts complexes
4. Reconnaître les forces des points de vue opposés lorsqu'ils sont valides
5. Se concentrer sur les implications pratiques et les applications réelles

Règles importantes :
- Être confiant mais pas arrogant
- Utiliser des exemples spécifiques et des données quand possible
- Garder les réponses focalisées et concises (2-3 phrases maximum)
- Maintenir un ton professionnel mais accessible
- Toujours argumenter de bonne foi
- TOUJOURS répondre en FRANÇAIS`
    };
  }

  /**
   * Initialize the expert agent
   */
  async initialize(): Promise<void> {
    try {
      await this.llmManager.initialize();
      console.log(`✅ Expert Agent initialized: ${this.info.name}`);
    } catch (error) {
      console.error('Failed to initialize Expert Agent:', error);
      throw error;
    }
  }

  /**
   * Provide initial position on the topic
   */
  async provideInitialPosition(topic: string, moderatorIntro: string): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Debate topic: "${topic}"
Moderator introduction: "${moderatorIntro}"

Provide your initial expert position on this topic. Include:
1. Your main argument or thesis
2. One or two key supporting points
3. Why this perspective matters

Keep it concise and impactful (2-3 sentences).`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'expert',
      content: response,
      timestamp: new Date(),
      type: 'statement'
    };
  }

  /**
   * Respond to criticism
   */
  async respondToCriticism(criticism: string, context: string): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Context of the debate:
${context}

Critic's challenge: "${criticism}"

Respond to this criticism by:
1. Acknowledging valid points if any
2. Clarifying misunderstandings if present
3. Providing counter-evidence or refined arguments
4. Maintaining a respectful, professional tone

Keep your response focused and concise (2-3 sentences).`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'expert',
      content: response,
      timestamp: new Date(),
      type: 'response'
    };
  }

  /**
   * Answer a question from the moderator
   */
  async answerQuestion(question: string, context: string): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Debate context:
${context}

Moderator's question: "${question}"

Provide a clear, evidence-based answer that:
1. Directly addresses the question
2. Supports your position with facts or examples
3. Remains concise and accessible

Limit your response to 2-3 sentences.`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'expert',
      content: response,
      timestamp: new Date(),
      type: 'response'
    };
  }

  /**
   * Provide a closing statement
   */
  async provideClosingStatement(context: string): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Full debate context:
${context}

Provide a brief closing statement that:
1. Reinforces your key argument
2. Acknowledges the debate's complexity
3. Offers a forward-looking perspective

Keep it to 2 sentences maximum.`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'expert',
      content: response,
      timestamp: new Date(),
      type: 'statement'
    };
  }

  /**
   * Get response from the agent
   */
  private async getResponse(prompt: string): Promise<string> {
    return this.llmManager.generateResponse(prompt, 'expert');
  }
}