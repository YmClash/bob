import { AgentInfo, DebateMessage } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { LLMManager } from '../services/llm-manager';

/**
 * Moderator Agent - Manages the debate flow and ensures balanced discussion
 */
export class ModeratorAgent {
  private llmManager: LLMManager;
  public info: AgentInfo;

  constructor() {
    this.llmManager = LLMManager.getInstance();
    this.info = {
      id: uuidv4(),
      name: 'Sophie Dubois',
      role: 'moderator',
      avatar: '🎙️',
      color: '#3B82F6',
      personality: 'Modératrice professionnelle, neutre et équitable',
      systemPrompt: `Tu es Sophie Dubois, une modératrice de débat professionnelle francophone. Ton rôle est de :
1. Présenter le sujet du débat de manière claire et neutre
2. Poser des questions stimulantes à l'expert et au critique
3. Assurer une participation équilibrée de toutes les parties
4. Résumer les points clés après chaque tour
5. Maintenir la discussion focalisée et productive
6. Fournir une conclusion juste et complète à la fin

Règles importantes :
- Rester strictement neutre - ne jamais prendre parti
- Garder les réponses concises (2-3 phrases maximum)
- Utiliser un langage formel mais accessible
- S'assurer que l'expert et le critique ont un temps de parole égal
- TOUJOURS répondre en FRANÇAIS`
    };
  }

  /**
   * Initialize the moderator agent
   */
  async initialize(): Promise<void> {
    try {
      await this.llmManager.initialize();
      console.log(`✅ Moderator Agent initialized: ${this.info.name}`);
    } catch (error) {
      console.error('Failed to initialize Moderator Agent:', error);
      throw error;
    }
  }

  /**
   * Introduce the debate topic
   */
  async introduceTopic(topic: string): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Tâche actuelle : Présenter le sujet de débat suivant au public et aux participants :
"${topic}"

Fournir une introduction brève et engageante qui prépare le terrain pour le débat. Terminer par une question pour que l'expert y réponde en premier. Répondre en FRANÇAIS.`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'moderator',
      content: response,
      timestamp: new Date(),
      type: 'statement'
    };
  }

  /**
   * Generate a follow-up question based on previous responses
   */
  async generateQuestion(context: string, targetRole: 'expert' | 'critic'): Promise<DebateMessage> {
    const prompt = `${this.info.systemPrompt}

Contexte du débat jusqu'à présent :
${context}

Générer une question de suivi réfléchie pour le ${targetRole === 'expert' ? 'Dr. Alexandre Chen' : 'Jordan Rivière'} qui :
- S'appuie sur ce qui vient d'être discuté
- Encourage une exploration plus approfondie du sujet
- Reste neutre et équitable
Répondre en FRANÇAIS.`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'moderator',
      content: response,
      timestamp: new Date(),
      type: 'question'
    };
  }

  /**
   * Synthesize the round's discussion
   */
  async synthesizeRound(roundMessages: DebateMessage[]): Promise<DebateMessage> {
    const context = roundMessages.map(m => `${m.agentName}: ${m.content}`).join('\n\n');

    const prompt = `${this.info.systemPrompt}

Discussion de ce tour :
${context}

Fournir une brève synthèse des points clés soulevés dans ce tour. Mettre en évidence les zones d'accord et de désaccord. Rester concis (2-3 phrases). Répondre en FRANÇAIS.`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'moderator',
      content: response,
      timestamp: new Date(),
      type: 'synthesis'
    };
  }

  /**
   * Conclude the entire debate
   */
  async concludeDebate(allMessages: DebateMessage[]): Promise<DebateMessage> {
    const context = allMessages.map(m => `${m.agentName}: ${m.content}`).join('\n\n');

    const prompt = `${this.info.systemPrompt}

Débat complet :
${context}

Fournir une conclusion complète qui :
1. Résume les principaux arguments des deux côtés
2. Identifie les idées clés qui ont émergé
3. Note tout terrain d'entente trouvé
4. Remercie les participants
Limiter à 3-4 phrases maximum. Répondre en FRANÇAIS.`;

    const response = await this.getResponse(prompt);

    return {
      id: uuidv4(),
      agentId: this.info.id,
      agentName: this.info.name,
      agentRole: 'moderator',
      content: response,
      timestamp: new Date(),
      type: 'conclusion'
    };
  }

  /**
   * Get response from the agent
   */
  private async getResponse(prompt: string): Promise<string> {
    return this.llmManager.generateResponse(prompt, 'moderator');
  }
}