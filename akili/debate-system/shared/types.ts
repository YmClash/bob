/**
 * Shared types for the Debate System
 */

export type AgentRole = 'moderator' | 'expert' | 'critic';

export interface AgentInfo {
  id: string;
  name: string;
  role: AgentRole;
  avatar: string;
  color: string;
  personality: string;
  systemPrompt: string;
}

export interface DebateMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: AgentRole;
  content: string;
  timestamp: Date;
  round?: number;
  type: 'statement' | 'question' | 'response' | 'synthesis' | 'conclusion';
}

export interface DebateStatus {
  id: string;
  topic: string;
  status: 'idle' | 'starting' | 'active' | 'paused' | 'ended';
  currentRound: number;
  totalRounds: number;
  currentSpeaker?: AgentRole;
  messages: DebateMessage[];
  startTime?: Date;
  endTime?: Date;
}

export interface DebateConfig {
  topic: string;
  rounds: number;
  llmProvider: 'gemini' | 'openai' | 'ollama';
  llmModel?: string;
  temperature?: number;
  maxTokens?: number;
  timeLimit?: number;
}

export interface SocketEvents {
  // Client to Server
  'debate:start': (config: DebateConfig) => void;
  'debate:pause': () => void;
  'debate:resume': () => void;
  'debate:stop': () => void;
  'user:message': (message: string) => void;

  // Server to Client
  'debate:status': (status: DebateStatus) => void;
  'agent:thinking': (agent: AgentInfo) => void;
  'agent:speaking': (data: { agent: AgentInfo; message: DebateMessage }) => void;
  'debate:update': (status: Partial<DebateStatus>) => void;
  'debate:ended': (summary: DebateSummary) => void;
  'debate:error': (error: DebateError) => void;
}

export interface DebateSummary {
  topic: string;
  duration: number;
  rounds: number;
  totalMessages: number;
  keyPoints: string[];
  conclusion: string;
  winner?: AgentRole;
}

export interface DebateError {
  message: string;
  error?: string;
  code?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}