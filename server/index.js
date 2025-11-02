import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchWithNaturalLanguage, getRecommendations } from './ai-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from 'public' directory (built frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'StreamHub AI API is running' });
});

// Natural Language Search
app.post('/api/search', async (req, res) => {
  try {
    const { query, services } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await searchWithNaturalLanguage(query, services);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to process search',
      message: error.message
    });
  }
});

// Smart Recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const { watchHistory, preferences, services } = req.body;

    const result = await getRecommendations(watchHistory, preferences, services);
    res.json(result);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
});

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 StreamHub AI running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🎬 Frontend: http://localhost:${PORT}`);
  console.log(`🤖 API: http://localhost:${PORT}/api/*`);
});
