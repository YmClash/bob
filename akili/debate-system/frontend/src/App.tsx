import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Play, Pause, StopCircle, Sparkles, Bot, Users, MessageSquare, ChevronDown } from 'lucide-react';
import { DebateMessage, DebateStatus, DebateConfig, AgentInfo } from './types';
import { TypingMessage } from './components/TypingMessage';

const SUGGESTED_TOPICS = [
  "L'IA devrait-elle remplacer les développeurs humains dans la prochaine décennie ?",
  "Le Web3 est-il l'avenir d'Internet ou juste un effet de mode ?",
  "Les véhicules électriques sont-ils vraiment meilleurs pour l'environnement ?",
  "Les cryptomonnaies remplaceront-elles le système bancaire traditionnel ?",
  "Le télétravail est-il meilleur que la culture de bureau ?"
];

const AGENTS = [
  {
    name: 'Sophie Dubois',
    role: 'Modératrice',
    avatar: '🎙️',
    color: 'from-blue-500 to-blue-600',
    description: 'Modératrice professionnelle qui assure un débat équilibré et productif',
    skills: ['Neutralité', 'Synthèse', 'Questionnement']
  },
  {
    name: 'Dr. Alexandre Chen',
    role: 'Expert',
    avatar: '👨‍🔬',
    color: 'from-green-500 to-green-600',
    description: 'Expert en technologie avec une approche basée sur les preuves',
    skills: ['Analyse', 'Données', 'Innovation']
  },
  {
    name: 'Jordan Rivière',
    role: 'Critique',
    avatar: '🤔',
    color: 'from-orange-500 to-orange-600',
    description: 'Penseur critique qui remet en question les idées constructivement',
    skills: ['Scepticisme', 'Alternative', 'Défi']
  }
];

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [debateStatus, setDebateStatus] = useState<DebateStatus | null>(null);
  const [topic, setTopic] = useState('');
  const [rounds, setRounds] = useState(3);
  const [isConnected, setIsConnected] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [thinkingAgent, setThinkingAgent] = useState<AgentInfo | null>(null);
  const [typingMessages, setTypingMessages] = useState<{[key: string]: boolean}>({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('debate:status', (status: DebateStatus) => {
      setDebateStatus(status);
      setIsDebating(status.status === 'active');
    });

    newSocket.on('agent:thinking', (agent: AgentInfo) => {
      setThinkingAgent(agent);
    });

    newSocket.on('agent:speaking', (message: DebateMessage) => {
      const newMessage = {...message, id: message.id || Date.now().toString()};
      setMessages(prev => [...prev, newMessage]);
      setTypingMessages(prev => ({...prev, [newMessage.id]: true}));
      setThinkingAgent(null);
      // Removed auto-scroll to allow manual reading
    });

    newSocket.on('debate:ended', (summary: any) => {
      setIsDebating(false);
      console.log('Debate ended:', summary);
    });

    newSocket.on('debate:error', (error: any) => {
      console.error('Debate error:', error);
      setIsDebating(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);


  const startDebate = () => {
    if (!socket || !topic.trim()) return;

    const config: DebateConfig = {
      topic,
      rounds,
      llmProvider: 'gemini'
    };

    socket.emit('debate:start', config);
    setIsDebating(true);
    setMessages([]);
  };

  const pauseDebate = () => {
    if (socket) socket.emit('debate:pause');
  };

  const resumeDebate = () => {
    if (socket) socket.emit('debate:resume');
  };

  const stopDebate = () => {
    if (socket) socket.emit('debate:stop');
    setIsDebating(false);
    setMessages([]);
  };

  const selectTopic = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10" />
            Système de Débat IA
            <Sparkles className="w-10 h-10" />
          </h1>
          <p className="text-white/80 text-lg">Propulsé par Tri-Protocol SDK & Gemini AI</p>
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`} />
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Configuration du Débat
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Sujet du Débat
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                    rows={3}
                    placeholder="Entrez le sujet du débat..."
                    disabled={isDebating}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Sujets Suggérés
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {SUGGESTED_TOPICS.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => selectTopic(t)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors"
                        disabled={isDebating}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Nombre de Tours: {rounds}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    className="w-full"
                    disabled={isDebating}
                  />
                </div>

                <div className="flex gap-2">
                  {!isDebating ? (
                    <button
                      onClick={startDebate}
                      disabled={!topic.trim() || !isConnected}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      Démarrer le Débat
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={pauseDebate}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </button>
                      <button
                        onClick={stopDebate}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <StopCircle className="w-5 h-5" />
                        Stop
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            {debateStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-semibold text-white mb-3">Status</h3>
                <div className="space-y-2 text-white/80 text-sm">
                  <div>Status: <span className="font-medium">{debateStatus.status}</span></div>
                  <div>Round: <span className="font-medium">{debateStatus.currentRound} / {debateStatus.totalRounds}</span></div>
                  <div>Messages: <span className="font-medium">{messages.length}</span></div>
                </div>
              </motion.div>
            )}

            {/* Agent Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <h3 className="text-lg font-semibold text-white mb-3">Participants</h3>
              <div className="space-y-3">
                {AGENTS.map((agent, i) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-r ${agent.color} p-4 rounded-xl border border-white/20`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{agent.avatar}</span>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{agent.name}</h4>
                        <p className="text-white/80 text-sm">{agent.role}</p>
                        <p className="text-white/70 text-xs mt-1">{agent.description}</p>
                        <div className="flex gap-2 mt-2">
                          {agent.skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-white/20 rounded text-white/90 text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-[600px] flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Debate Arena
                </h2>
              </div>

              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 relative"
                style={{ scrollBehavior: 'auto' }}>
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      layout={false}
                      className={`flex gap-3 ${
                        msg.agentRole === 'moderator' ? 'justify-center' : 
                        msg.agentRole === 'expert' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div className={`max-w-[80%] ${
                        msg.agentRole === 'moderator' ? 'w-full' : ''
                      }`}>
                        <div className={`rounded-2xl p-4 ${
                          msg.agentRole === 'moderator' 
                            ? 'bg-blue-500/20 border border-blue-400/30'
                            : msg.agentRole === 'expert'
                            ? 'bg-green-500/20 border border-green-400/30'
                            : 'bg-orange-500/20 border border-orange-400/30'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{
                              msg.agentRole === 'moderator' ? '🎙️' :
                              msg.agentRole === 'expert' ? '👨‍🔬' : '🤔'
                            }</span>
                            <span className="font-semibold text-white">
                              {msg.agentName}
                            </span>
                            <span className="text-xs text-white/60">
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Just now'}
                            </span>
                          </div>
                          <div className="text-white/90">
                            {typingMessages[msg.id] ? (
                              <TypingMessage
                                content={msg.content}
                                speed={25}
                                onComplete={() => {
                                  setTypingMessages(prev => ({...prev, [msg.id]: false}));
                                }}
                              />
                            ) : (
                              <p>{msg.content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {thinkingAgent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <div className="bg-white/10 rounded-full px-4 py-2 flex items-center gap-2 thinking-indicator">
                      <Bot className="w-5 h-5 text-white/80" />
                      <span className="text-white/80">{thinkingAgent.name} is thinking...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default App;
