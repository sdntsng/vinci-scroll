/**
 * ScrollNet MVP Backend Server
 * Phase 1: Core functionality only - NO AI integrations
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const SupabaseService = require('./services/supabaseService');

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

// Initialize services
const supabaseService = new SupabaseService();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/upload', require('./routes/upload'));

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
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'supabase',
      storage: 'google-cloud-storage',
      auth: 'supabase-auth'
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For MVP, we'll use mock authentication
    // In production, this would use Supabase Auth
    if (email && password) {
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        name: 'Test User',
        token: 'mock-jwt-token'
      };
      
      res.json({
        success: true,
        user: mockUser,
        message: 'Login successful (MVP mode)'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
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
app.get('/api/videos', async (req, res) => {
  const { limit = 10, offset = 0, userId } = req.query;
  
  try {
    // Get videos from Supabase
    const videos = await supabaseService.getVideoFeed(
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      videos: videos,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: videos.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    
    // Fallback to mock data if database is not available
    const mockVideos = [
      {
        id: 'video-1',
        title: 'Product Demo Video',
        description: 'A demonstration of our latest product features',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 596,
        tags: ['demo', 'product'],
        uploader: 'Demo User',
        createdAt: new Date().toISOString()
      },
      {
        id: 'video-2',
        title: 'Tutorial: Getting Started',
        description: 'Learn how to get started with our platform',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 653,
        tags: ['tutorial', 'beginner'],
        uploader: 'Tutorial Team',
        createdAt: new Date().toISOString()
      },
      {
        id: 'video-3',
        title: 'Advanced Features Overview',
        description: 'Explore advanced features and capabilities',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 15,
        tags: ['advanced', 'features'],
        uploader: 'Expert User',
        createdAt: new Date().toISOString()
      },
      {
        id: 'video-4',
        title: 'User Success Stories',
        description: 'Real stories from our community',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: 15,
        tags: ['success', 'community'],
        uploader: 'Community Team',
        createdAt: new Date().toISOString()
      },
      {
        id: 'video-5',
        title: 'Platform Updates',
        description: 'Latest updates and improvements',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        duration: 60,
        tags: ['updates', 'news'],
        uploader: 'Development Team',
        createdAt: new Date().toISOString()
      }
    ];
    
    const offsetNum = parseInt(offset) || 0;
    const limitNum = parseInt(limit) || 10;
    
    res.json({
      success: true,
      videos: mockVideos.slice(offsetNum, offsetNum + limitNum),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        hasMore: false
      },
      fallback: true,
      message: 'Using mock data - database not available'
    });
  }
});

app.get('/api/videos/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await supabaseService.getVideo(videoId);
    
    res.json({
      success: true,
      video: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }
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
app.post('/api/interactions', async (req, res) => {
  try {
    const { userId, videoId, type, data } = req.body;
    
    if (!userId || !videoId || !type) {
      return res.status(400).json({
        success: false,
        message: 'userId, videoId, and type are required'
      });
    }
    
    // Record interaction in Supabase
    const interaction = await supabaseService.recordInteraction(
      userId, 
      videoId, 
      type, 
      data || {}
    );
    
    res.json({
      success: true,
      interaction: interaction,
      message: 'Interaction recorded successfully'
    });
  } catch (error) {
    console.error('Error recording interaction:', error);
    
    // For MVP, still return success even if database fails
    res.json({
      success: true,
      message: 'Interaction recorded (MVP mode)',
      fallback: true
    });
  }
});

app.get('/api/interactions/:userId/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    
    const interactions = await supabaseService.getUserInteractions(userId, videoId);
    
    res.json({
      success: true,
      interactions: interactions
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.json({
      success: true,
      interactions: [],
      fallback: true
    });
  }
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

app.post('/api/feedback', async (req, res) => {
  try {
    const { videoId, whatDidYouSee, whyDidYouReact, timestamp } = req.body;
    
    if (!whatDidYouSee || !whyDidYouReact) {
      return res.status(400).json({
        success: false,
        message: 'Both questions must be answered'
      });
    }
    
    // Prepare feedback data for database
    const feedbackData = {
      video_id: videoId,
      user_id: 'anonymous-user', // For MVP, all feedback is anonymous
      what_did_you_see: whatDidYouSee,
      why_did_you_react: whyDidYouReact,
      created_at: timestamp || new Date().toISOString()
    };
    
    // Submit feedback to Supabase
    const feedback = await supabaseService.submitFeedback(feedbackData);
    
    res.json({
      success: true,
      feedback: feedback,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    // For MVP, still return success
    res.json({
      success: true,
      message: 'Feedback submitted (MVP mode)',
      fallback: true
    });
  }
});

// ============ ANALYTICS ENDPOINTS ============

app.get('/api/analytics/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const analytics = await supabaseService.getVideoAnalytics(videoId);
    
    res.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.json({
      success: true,
      analytics: {
        totalInteractions: 0,
        likes: 0,
        dislikes: 0,
        emojiReactions: [],
        views: 0
      },
      fallback: true
    });
  }
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
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Server error:', error);
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the maximum size limit'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 ScrollNet MVP Backend running on port ${PORT}`);
  logger.info(`📋 Phase: MVP (Phase 1) - Core functionality only`);
  logger.info(`🗄️  Database: Supabase`);
  logger.info(`☁️  Storage: Google Cloud Storage`);
  logger.info(`�� Health check: ${process.env.SERVER_URL || `http://localhost:${PORT}`}/api/health`);
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