import { AgentInfo, DebateMessage } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { LLMManager } from '../services/llm-manager';

/**
 * Critic Agent - Challenges assumptions and provides alternative perspectives
 */
export class CriticAgent {
  private llmManager: LLMManager;
  public info: AgentInfo;

  constructor() {
    this.llmManager = LLMManager.getInstance();
    this.info = {
      id: uuidv4(),
      name: 'Jordan Rivière',
      role: 'critic',
      avatar: '🤔',
      color: '#F59E0B',
      personality: 'Réfléchi, sceptique et constructivement critique',
      systemPrompt: `Tu es Jordan Rivière, un penseur critique qui remet en question les idées de manière constructive. Ton rôle est de :
1. Questionner les hypothèses et identifier les failles potentielles dans les arguments
2. Offrir des perspectives et des considérations alternatives
3. Jouer l'avocat du diable quand c'est approprié
4. Souligner les risques, limitations ou conséquences non intentionnelles
5. Pousser vers une réflexion plus profonde et une compréhension nuancée

Règles importantes :
- Être sceptique mais pas cynique
- Critiquer les idées, pas les personnes
- Offrir des défis constructifs, pas seulement de la négativité
- Reconnaître quand les arguments sont solides
- Garder les réponses concises (2-3 phrases maximum)
- Maintenir le respect tout en étant direct
- TOUJOURS répondre en FRANÇAIS`
    };
  }

  /**
   * Initialize the critic agent
   */
  async initialize(): Promise<void> {
    try {
      await this.llmManager.initialize();
      console.log(`✅ Critic Agent initialized: ${this.info.name}`);
    } catch (error) {
      console.error('Failed to initialize Critic Agent:', error);
      throw error;
    }
  }

  /**
   * Analyze and challenge the expert's position
   */
  async challengePosition(expertStatement: string, topic: string): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Debate topic: "${topic}"
Expert's position: "${expertStatement}"

Provide a thoughtful critique that:
1. Identifies potential weaknesses or assumptions in the argument
2. Offers an alternative perspective or consideration
3. Raises important questions that need addressing

Be constructive and specific. Keep it to 2-3 sentences.`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'critic',
      content: response,
      timestamp: new Date(),
      type: 'response'
    };
  }

  /**
   * Respond to expert's defense
   */
  async respondToDefense(expertDefense: string, context: string): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Debate context:
${context}

Expert's defense: "${expertDefense}"

Provide a follow-up that:
1. Acknowledges strong points if present
2. Identifies remaining concerns or gaps
3. Pushes for deeper consideration of implications

Maintain a constructive tone while being appropriately skeptical (2-3 sentences).`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'critic',
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

Provide a critical perspective that:
1. Directly addresses the question
2. Highlights important considerations often overlooked
3. Challenges conventional thinking where appropriate

Keep your response focused and concise (2-3 sentences).`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'critic',
      content: response,
      timestamp: new Date(),
      type: 'response'
    };
  }

  /**
   * Provide alternative perspective
   */
  async provideAlternative(topic: string, context: string): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Topic: "${topic}"
Discussion so far:
${context}

Offer an alternative perspective or approach that:
1. Hasn't been fully explored yet
2. Challenges the framing of the debate
3. Introduces important nuance

Be constructive and thought-provoking (2-3 sentences).`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'critic',
      content: response,
      timestamp: new Date(),
      type: 'statement'
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
1. Highlights key questions that remain unanswered
2. Emphasizes important considerations for the audience
3. Encourages continued critical thinking

Keep it to 2 sentences maximum.`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'critic',
      content: response,
      timestamp: new Date(),
      type: 'statement'
    };
  }

  /**
   * Get response from the agent
   */
  private async getResponse(prompt: string): Promise<string> {
    return this.llmManager.generateResponse(prompt, 'critic');
  }
}