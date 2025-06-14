/**
 * ScrollNet - Main Application Entry Point
 * Gamified Video Feedback and Evaluation Platform
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { InworldClient } = require('./inworld');
const { MistralClient } = require('./mistral');
const { ChallengeManager } = require('./challenges');
const { RLEngine } = require('./RLengine');
const { UserFeedbackProcessor } = require('./userFeedback');
const { VisionAIProcessor } = require('./visionAI');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize core components
let inworldClient;
let mistralClient;
let challengeManager;
let rlEngine;
let feedbackProcessor;
let visionAIProcessor;

/**
 * Initialize all AI and game components
 */
async function initializeComponents() {
    try {
        console.log('🚀 Initializing ScrollNet components...');
        
        // Initialize AI clients
        inworldClient = new InworldClient();
        mistralClient = new MistralClient();
        
        // Initialize game systems
        challengeManager = new ChallengeManager(mistralClient);
        rlEngine = new RLEngine();
        feedbackProcessor = new UserFeedbackProcessor();
        visionAIProcessor = new VisionAIProcessor();
        
        console.log('✅ All components initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize components:', error);
        process.exit(1);
    }
}

// API Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * Get current user challenge
 */
app.get('/api/challenge/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userHistory = await feedbackProcessor.getUserHistory(userId);
        const challenge = await challengeManager.generateChallenge(userHistory);
        
        res.json({
            success: true,
            challenge
        });
    } catch (error) {
        console.error('Error generating challenge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate challenge'
        });
    }
});

/**
 * Submit user feedback for video content
 */
app.post('/api/feedback', async (req, res) => {
    try {
        const feedbackData = req.body;
        
        // Process feedback through multiple systems
        const processedFeedback = await feedbackProcessor.processFeedback(feedbackData);
        
        // Update reinforcement learning model
        await rlEngine.updateModel(processedFeedback);
        
        // Process through vision AI if applicable
        if (feedbackData.visualElements) {
            await visionAIProcessor.processVisualFeedback(feedbackData);
        }
        
        res.json({
            success: true,
            message: 'Feedback processed successfully',
            reward: processedFeedback.reward
        });
    } catch (error) {
        console.error('Error processing feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process feedback'
        });
    }
});

/**
 * Get AI-generated response from Inworld character
 */
app.post('/api/npc/interact', async (req, res) => {
    try {
        const { message, userId } = req.body;
        
        if (!message || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Message and userId are required'
            });
        }
        
        const response = await inworldClient.sendMessage(message, userId);
        
        res.json({
            success: true,
            response
        });
    } catch (error) {
        console.error('Error interacting with NPC:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to interact with NPC'
        });
    }
});

/**
 * Get user progress and statistics
 */
app.get('/api/user/:userId/progress', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const progress = await feedbackProcessor.getUserProgress(userId);
        const rlStats = await rlEngine.getUserStats(userId);
        
        res.json({
            success: true,
            progress: {
                ...progress,
                rlStats
            }
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user progress'
        });
    }
});

/**
 * Get optimized content recommendations
 */
app.get('/api/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userProfile = await rlEngine.getUserProfile(userId);
        const recommendations = await rlEngine.generateRecommendations(userProfile);
        
        res.json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

/**
 * Start the server
 */
async function startServer() {
    try {
        await initializeComponents();
        
        app.listen(PORT, () => {
            console.log(`🎮 ScrollNet server running on port ${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
            console.log('🔗 Visit http://localhost:${PORT}/api/health for health check');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('📴 Shutting down ScrollNet server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('📴 Shutting down ScrollNet server...');
    process.exit(0);
});

// Start the application
if (require.main === module) {
    startServer();
}

module.exports = app; 