export interface AgentInfo {
  id?: string;
  name: string;
  role: 'moderator' | 'expert' | 'critic';
  avatar?: string;
  color?: string;
  personality?: string;
}

export interface DebateMessage {
  id: string;
  agentId?: string;
  agentName: string;
  agentRole: string;
  content: string;
  timestamp?: string | Date;
  type?: 'statement' | 'question' | 'response' | 'synthesis' | 'conclusion';
}

export interface DebateStatus {
  id: string;
  topic: string;
  status: 'idle' | 'starting' | 'active' | 'paused' | 'ended';
  currentRound: number;
  totalRounds: number;
  messages: DebateMessage[];
  startTime?: Date;
  endTime?: Date;
  summary?: string;
}

export interface DebateConfig {
  topic: string;
  rounds: number;
  llmProvider?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DebateSummary {
  topic: string;
  duration: number;
  rounds: number;
  totalMessages: number;
  keyPoints: string[];
  conclusion: string;
}

export type SocketEvents = {
  'debate:start': (config: DebateConfig) => void;
  'debate:pause': () => void;
  'debate:resume': () => void;
  'debate:stop': () => void;
  'debate:status': (status: DebateStatus) => void;
  'agent:thinking': (agent: AgentInfo) => void;
  'agent:speaking': (message: DebateMessage) => void;
  'debate:update': (update: any) => void;
  'debate:ended': (summary: DebateSummary) => void;
  'debate:error': (error: any) => void;
};