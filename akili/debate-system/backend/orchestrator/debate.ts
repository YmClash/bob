import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

import { ModeratorAgent } from '../agents/ModeratorAgent';
import { ExpertAgent } from '../agents/ExpertAgent';
import { CriticAgent } from '../agents/CriticAgent';
import { messageQueue } from '../utils/MessageQueue';
import {
  DebateConfig,
  DebateStatus,
  DebateMessage,
  DebateSummary,
  AgentRole
} from '../../shared/types';

/**
 * Orchestrates the debate between agents
 */
export class DebateOrchestrator {
  private io: SocketIOServer;
  private debates: Map<string, DebateSession> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Start a new debate
   */
  async startDebate(clientId: string, config: DebateConfig, socket: Socket): Promise<void> {
    // Clean up any existing debate for this client
    this.cleanupDebate(clientId);

    // Create new debate session
    const session = new DebateSession(clientId, config, socket, this.io);
    this.debates.set(clientId, session);

    // Start the debate
    await session.start();
  }

  /**
   * Pause an ongoing debate
   */
  pauseDebate(clientId: string): void {
    const session = this.debates.get(clientId);
    if (session) {
      session.pause();
    }
  }

  /**
   * Resume a paused debate
   */
  resumeDebate(clientId: string): void {
    const session = this.debates.get(clientId);
    if (session) {
      session.resume();
    }
  }

  /**
   * Stop a debate
   */
  stopDebate(clientId: string): void {
    const session = this.debates.get(clientId);
    if (session) {
      session.stop();
      this.debates.delete(clientId);
    }
  }

  /**
   * Handle user message during debate
   */
  async handleUserMessage(clientId: string, message: string): Promise<void> {
    const session = this.debates.get(clientId);
    if (session) {
      await session.handleUserMessage(message);
    }
  }

  /**
   * Clean up debate session
   */
  cleanupDebate(clientId: string): void {
    const session = this.debates.get(clientId);
    if (session) {
      session.cleanup();
      this.debates.delete(clientId);
    }
  }

  /**
   * Get active debates count
   */
  getActiveDebatesCount(): number {
    return this.debates.size;
  }
}

/**
 * Individual debate session
 */
class DebateSession {
  private id: string;
  private config: DebateConfig;
  private socket: Socket;
  private io: SocketIOServer;
  private status: DebateStatus;
  private moderator: ModeratorAgent | null = null;
  private expert: ExpertAgent | null = null;
  private critic: CriticAgent | null = null;
  private isPaused = false;
  private isStopped = false;

  constructor(id: string, config: DebateConfig, socket: Socket, io: SocketIOServer) {
    this.id = id;
    this.config = config;
    this.socket = socket;
    this.io = io;
    this.status = {
      id,
      topic: config.topic,
      status: 'idle',
      currentRound: 0,
      totalRounds: config.rounds,
      messages: [],
      startTime: new Date()
    };
  }

  /**
   * Start the debate
   */
  async start(): Promise<void> {
    try {
      this.status.status = 'starting';
      this.updateStatus();

      // Initialize agents
      await this.initializeAgents();

      // Start the debate flow
      this.status.status = 'active';
      this.updateStatus();

      await this.runDebateFlow();

    } catch (error) {
      console.error(chalk.red('Debate error:'), error);
      this.socket.emit('debate:error', {
        message: 'Debate failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Initialize all agents
   */
  private async initializeAgents(): Promise<void> {
    // Emit initialization status
    this.socket.emit('debate:update', {
      status: 'starting',
      currentSpeaker: 'moderator'
    });

    // Initialize moderator
    this.moderator = new ModeratorAgent();
    await this.moderator.initialize();
    // Removed emitAgentThinking - will be called when agent actually speaks

    // Initialize expert
    this.expert = new ExpertAgent();
    await this.expert.initialize();
    // Removed emitAgentThinking - will be called when agent actually speaks

    // Initialize critic
    this.critic = new CriticAgent();
    await this.critic.initialize();
    // Removed emitAgentThinking - will be called when agent actually speaks

    console.log(chalk.green('✅ All agents initialized'));
  }

  /**
   * Run the main debate flow
   */
  private async runDebateFlow(): Promise<void> {
    if (!this.moderator || !this.expert || !this.critic) {
      throw new Error('Agents not initialized');
    }

    // Introduction by moderator
    await this.delay(1000);
    const intro = await this.moderator.introduceTopic(this.config.topic);
    await this.addMessage(intro);

    // Run debate rounds
    for (let round = 1; round <= this.config.rounds; round++) {
      if (this.isStopped) break;

      while (this.isPaused) {
        await this.delay(500);
      }

      this.status.currentRound = round;
      this.updateStatus();

      await this.runDebateRound(round, intro.content);
    }

    // Conclusion
    if (!this.isStopped) {
      await this.concludeDebate();
    }
  }

  /**
   * Run a single debate round
   */
  private async runDebateRound(round: number, context: string): Promise<void> {
    const roundMessages: DebateMessage[] = [];

    // Expert's initial position or response - AVEC QUEUE
    const expertStatement = round === 1
      ? await this.expert!.provideInitialPosition(this.config.topic, context)
      : await this.expert!.answerQuestion(
          `What additional evidence supports your position?`,
          this.getRecentContext()
        );

    await messageQueue.enqueue(async () => {
      await this.addMessage(expertStatement);
    }, expertStatement.agentName);
    roundMessages.push(expertStatement);

    // Critic's challenge - AVEC QUEUE
    const criticChallenge = await this.critic!.challengePosition(
      expertStatement.content,
      this.config.topic
    );

    await messageQueue.enqueue(async () => {
      await this.addMessage(criticChallenge);
    }, criticChallenge.agentName);
    roundMessages.push(criticChallenge);

    // Expert's defense - AVEC QUEUE
    const expertDefense = await this.expert!.respondToCriticism(
      criticChallenge.content,
      this.getRecentContext()
    );

    await messageQueue.enqueue(async () => {
      await this.addMessage(expertDefense);
    }, expertDefense.agentName);
    roundMessages.push(expertDefense);

    // Critic's follow-up - AVEC QUEUE
    const criticFollowup = await this.critic!.respondToDefense(
      expertDefense.content,
      this.getRecentContext()
    );

    await messageQueue.enqueue(async () => {
      await this.addMessage(criticFollowup);
    }, criticFollowup.agentName);
    roundMessages.push(criticFollowup);

    // Moderator synthesis - AVEC QUEUE
    const synthesis = await this.moderator!.synthesizeRound(roundMessages);

    await messageQueue.enqueue(async () => {
      await this.addMessage(synthesis);
    }, synthesis.agentName);

    // Attendre que tous les messages soient envoyés
    await messageQueue.waitForEmpty();
  }

  /**
   * Conclude the debate
   */
  private async concludeDebate(): Promise<void> {
    // Closing statements
    const expertClosing = await this.expert!.provideClosingStatement(this.getFullContext());
    await this.addMessage(expertClosing);

    const criticClosing = await this.critic!.provideClosingStatement(this.getFullContext());
    await this.addMessage(criticClosing);

    // Final conclusion by moderator
    const conclusion = await this.moderator!.concludeDebate(this.status.messages);
    await this.addMessage(conclusion);

    // Generate summary
    const summary = this.generateSummary();
    this.status.status = 'ended';
    this.status.endTime = new Date();
    this.updateStatus();

    this.socket.emit('debate:ended', summary);
  }

  /**
   * Add message and emit to client
   */
  private async addMessage(message: DebateMessage): Promise<void> {
    this.status.messages.push(message);

    const agentInfo = this.getAgentInfo(message.agentRole);
    if (agentInfo) {
      console.log(chalk.cyan(`[${new Date().toISOString()}] ${agentInfo.name} commence à réfléchir...`));

      // Emit thinking state first
      this.socket.emit('agent:thinking', agentInfo);

      // Add realistic delay (3-4 seconds for thinking)
      await this.delay(3000 + Math.random() * 1000);

      // Send message with proper format for frontend
      const formattedMessage = {
        id: message.id,
        agentName: message.agentName,
        agentRole: message.agentRole,
        content: message.content,
        timestamp: message.timestamp || new Date().toISOString()
      };

      console.log(chalk.green(`[${new Date().toISOString()}] ${agentInfo.name} parle maintenant`));
      this.socket.emit('agent:speaking', formattedMessage);

      // Longer delay after speaking (2 seconds minimum)
      await this.delay(2000);
      console.log(chalk.gray(`[${new Date().toISOString()}] ${agentInfo.name} a fini de parler`));
    }

    this.updateStatus();
  }

  /**
   * Get agent info by role
   */
  private getAgentInfo(role: AgentRole) {
    switch (role) {
      case 'moderator':
        return this.moderator?.info;
      case 'expert':
        return this.expert?.info;
      case 'critic':
        return this.critic?.info;
      default:
        return null;
    }
  }

  /**
   * Emit agent thinking status
   */
  private emitAgentThinking(agent: any): void {
    this.socket.emit('agent:thinking', agent);
  }

  /**
   * Update debate status
   */
  private updateStatus(): void {
    this.socket.emit('debate:status', this.status);
  }

  /**
   * Get recent context (last 5 messages)
   */
  private getRecentContext(): string {
    const recent = this.status.messages.slice(-5);
    return recent.map(m => `${m.agentName}: ${m.content}`).join('\n\n');
  }

  /**
   * Get full context
   */
  private getFullContext(): string {
    return this.status.messages.map(m => `${m.agentName}: ${m.content}`).join('\n\n');
  }

  /**
   * Generate debate summary
   */
  private generateSummary(): DebateSummary {
    const duration = this.status.endTime
      ? (this.status.endTime.getTime() - this.status.startTime!.getTime()) / 1000
      : 0;

    const keyPoints = this.extractKeyPoints();

    return {
      topic: this.config.topic,
      duration,
      rounds: this.status.currentRound,
      totalMessages: this.status.messages.length,
      keyPoints,
      conclusion: this.status.messages[this.status.messages.length - 1]?.content || ''
    };
  }

  /**
   * Extract key points from debate
   */
  private extractKeyPoints(): string[] {
    const points: string[] = [];

    // Get synthesis messages
    const syntheses = this.status.messages.filter(m => m.type === 'synthesis');
    syntheses.forEach(s => points.push(s.content));

    // Get key statements
    const statements = this.status.messages.filter(m => m.type === 'statement');
    statements.slice(0, 3).forEach(s => {
      const short = s.content.substring(0, 100) + '...';
      points.push(short);
    });

    return points.slice(0, 5);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle user message
   */
  async handleUserMessage(message: string): Promise<void> {
    // This could be implemented to allow user to ask questions during the debate
    console.log('User message received:', message);
  }

  /**
   * Pause the debate
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume the debate
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Stop the debate
   */
  stop(): void {
    this.isStopped = true;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.isStopped = true;
    // Additional cleanup if needed
  }
}