/**
 * ScrollNet MVP Backend Server
 * Phase 1: Core functionality only - NO AI integrations
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use 3001 to avoid conflict with Next.js

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    phase: 'MVP (Phase 1)',
    version: '0.1.0',
    features: {
      auth: 'planned',
      videoFeed: 'planned',
      interactions: 'planned',
      feedback: 'planned',
      aiIntegration: 'disabled (Phase 3+)'
    }
  });
});

// Authentication routes (Phase 1)
app.post('/api/auth/register', (req, res) => {
  // TODO: Implement user registration
  res.status(501).json({
    error: 'Not implemented yet',
    message: 'User registration endpoint - MVP Phase 1 development',
    phase: 'MVP'
  });
});

app.post('/api/auth/login', (req, res) => {
  // TODO: Implement user login
  res.status(501).json({
    error: 'Not implemented yet',
    message: 'User login endpoint - MVP Phase 1 development',
    phase: 'MVP'
  });
});

app.get('/api/auth/me', (req, res) => {
  // TODO: Get current user profile
  res.status(501).json({
    error: 'Not implemented yet',
    message: 'Get user profile endpoint - MVP Phase 1 development',
    phase: 'MVP'
  });
});

// Video feed routes (Phase 1)
app.get('/api/videos/feed', (req, res) => {
  // TODO: Get video feed from database
  res.status(501).json({
    error: 'Not implemented yet',
    message: 'Video feed endpoint - MVP Phase 1 development',
    phase: 'MVP',
    mockData: [
      {
        id: 'video-1',
        title: 'Sample Video 1',
        description: 'This is a sample video for MVP development',
        url: 'https://example.com/video1.mp4',
        duration: 120,
        tags: ['sample', 'mvp']
      }
    ]
  });
});

app.get('/api/videos/:id', (req, res) => {
  // TODO: Get specific video details
  const { id } = req.params;
  res.status(501).json({
    error: 'Not implemented yet',
    message: `Get video ${id} endpoint - MVP Phase 1 development`,
    phase: 'MVP'
  });
});

app.post('/api/videos/:id/view', (req, res) => {
  // TODO: Track video view
  const { id } = req.params;
  res.status(501).json({
    error: 'Not implemented yet',
    message: `Track video ${id} view - MVP Phase 1 development`,
    phase: 'MVP'
  });
});

// User interaction routes (Phase 1)
app.post('/api/interactions/:videoId/react', (req, res) => {
  // TODO: Submit reaction (like/dislike)
  const { videoId } = req.params;
  res.status(501).json({
    error: 'Not implemented yet',
    message: `React to video ${videoId} - MVP Phase 1 development`,
    phase: 'MVP'
  });
});

app.get('/api/interactions/stats', (req, res) => {
  // TODO: Get user interaction statistics
  res.status(501).json({
    error: 'Not implemented yet',
    message: 'Get interaction stats - MVP Phase 1 development',
    phase: 'MVP'
  });
});

// Feedback routes (Phase 1)
app.get('/api/feedback/required', (req, res) => {
  // TODO: Check if feedback is required (every 5 videos)
  res.status(501).json({
    error: 'Not implemented yet',
    message: 'Check feedback requirement - MVP Phase 1 development',
    phase: 'MVP',
    mockData: {
      required: true,
      videosWatched: 5,
      targetVideo: 'video-5'
    }
  });
});

app.post('/api/feedback', (req, res) => {
  // TODO: Submit feedback
  res.status(501).json({
    error: 'Not implemented yet',
    message: 'Submit feedback - MVP Phase 1 development',
    phase: 'MVP'
  });
});

// Disabled AI endpoints (Phase 3+)
app.all('/api/ai/*', (req, res) => {
  res.status(503).json({
    error: 'AI features disabled',
    message: 'AI integrations are planned for Phase 3 (not MVP)',
    phase: 'MVP',
    availableIn: 'Phase 3+'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'This endpoint does not exist or is not implemented in MVP',
    phase: 'MVP',
    availableEndpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/register, POST /api/auth/login, GET /api/auth/me',
      videos: 'GET /api/videos/feed, GET /api/videos/:id, POST /api/videos/:id/view',
      interactions: 'POST /api/interactions/:videoId/react, GET /api/interactions/stats',
      feedback: 'GET /api/feedback/required, POST /api/feedback'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server',
    phase: 'MVP'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 ScrollNet MVP Backend running on port ${PORT}`);
  logger.info(`📋 Phase: MVP (Phase 1) - Core functionality only`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`📖 API Documentation: All endpoints return 501 (Not Implemented) during development`);
  logger.info(`❌ AI features disabled until Phase 3`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 