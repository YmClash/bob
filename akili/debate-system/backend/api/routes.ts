import { Router, Request, Response } from 'express';
import { DebateOrchestrator } from '../orchestrator/debate';
import { DebateConfig } from '../../shared/types';

/**
 * Create API routes for the debate system
 */
export function createAPIRoutes(orchestrator: DebateOrchestrator): Router {
  const router = Router();

  /**
   * Get system status
   */
  router.get('/status', (req: Request, res: Response) => {
    res.json({
      status: 'operational',
      activeDebates: orchestrator.getActiveDebatesCount(),
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Get suggested debate topics
   */
  router.get('/topics/suggestions', (req: Request, res: Response) => {
    const topics = [
      {
        id: 1,
        topic: "Will AI replace human developers in the next decade?",
        category: "Technology",
        difficulty: "medium"
      },
      {
        id: 2,
        topic: "Are microservices always better than monolithic architectures?",
        category: "Software Engineering",
        difficulty: "hard"
      },
      {
        id: 3,
        topic: "Is Web3 the future of the internet or just hype?",
        category: "Blockchain",
        difficulty: "medium"
      },
      {
        id: 4,
        topic: "Should companies prioritize remote work over office culture?",
        category: "Work Culture",
        difficulty: "easy"
      },
      {
        id: 5,
        topic: "Is quantum computing a practical reality or still theoretical?",
        category: "Technology",
        difficulty: "hard"
      },
      {
        id: 6,
        topic: "Are electric vehicles truly better for the environment?",
        category: "Environment",
        difficulty: "medium"
      },
      {
        id: 7,
        topic: "Should social media platforms be regulated like utilities?",
        category: "Policy",
        difficulty: "medium"
      },
      {
        id: 8,
        topic: "Is the metaverse the next evolution of the internet?",
        category: "Technology",
        difficulty: "medium"
      },
      {
        id: 9,
        topic: "Will cryptocurrencies replace traditional banking?",
        category: "Finance",
        difficulty: "hard"
      },
      {
        id: 10,
        topic: "Is nuclear energy the solution to climate change?",
        category: "Energy",
        difficulty: "hard"
      }
    ];

    res.json(topics);
  });

  /**
   * Validate debate configuration
   */
  router.post('/debate/validate', (req: Request, res: Response) => {
    const config: DebateConfig = req.body;

    const errors: string[] = [];

    if (!config.topic || config.topic.length < 10) {
      errors.push('Topic must be at least 10 characters long');
    }

    if (!config.rounds || config.rounds < 1 || config.rounds > 10) {
      errors.push('Rounds must be between 1 and 10');
    }

    if (!config.llmProvider) {
      config.llmProvider = 'gemini';
    }

    if (!['gemini', 'openai', 'ollama'].includes(config.llmProvider)) {
      errors.push('Invalid LLM provider');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        valid: false,
        errors
      });
    }

    res.json({
      valid: true,
      config: {
        ...config,
        temperature: config.temperature || 0.8,
        maxTokens: config.maxTokens || 2048
      }
    });
  });

  /**
   * Get debate history (placeholder for future implementation)
   */
  router.get('/debates/history', (req: Request, res: Response) => {
    // This would typically fetch from a database
    res.json({
      debates: [],
      total: 0
    });
  });

  /**
   * Export debate (placeholder for future implementation)
   */
  router.post('/debate/export/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { format } = req.body;

    // This would typically generate a PDF or JSON export
    res.json({
      message: 'Export functionality coming soon',
      debateId: id,
      format: format || 'json'
    });
  });

  /**
   * Health check for Gemini connection
   */
  router.get('/health/gemini', async (req: Request, res: Response) => {
    try {
      const { SDKConfiguration } = await import('../config/sdk-config');
      const isConnected = await SDKConfiguration.testConnection();

      res.json({
        connected: isConnected,
        provider: 'gemini',
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
      });
    } catch (error) {
      res.status(500).json({
        connected: false,
        error: 'Failed to test Gemini connection'
      });
    }
  });

  return router;
}