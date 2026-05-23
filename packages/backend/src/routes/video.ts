import { Router, Request, Response } from 'express';
import axios from 'axios';
import { env } from '../config/env';

const router = Router();

// POST /api/video/generate
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { concept } = req.body;
    if (!concept || typeof concept !== 'string' || !concept.trim()) {
      res.status(400).json({ error: 'Concept parameter is required and must be a non-empty string.' });
      return;
    }

    // Proxy request to python fast api service
    const response = await axios.post(`${env.AI_ENGINE_URL}/video/generate-video`, {
      concept: concept.trim()
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('[ERROR] Failed to query video generator AI Engine:', error.message);
    res.status(500).json({
      error: 'Failed to communicate with video generation AI Engine',
      details: error.response?.data?.detail || error.message
    });
  }
});

export default router;
