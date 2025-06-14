/**
 * Inworld AI Client Integration
 * Handles communication with AI characters for gamified interactions
 */

const { InworldClient: InworldSDK } = require('@inworld/nodejs-sdk');

class InworldClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.activeSession = null;
        this.apiKey = process.env.INWORLD_API_KEY;
        this.sceneId = process.env.INWORLD_SCENE_ID;
        
        if (!this.apiKey || !this.sceneId) {
            throw new Error('Inworld API key and Scene ID are required. Please check your .env file.');
        }
        
        this.initializeClient();
    }

    /**
     * Initialize the Inworld client
     */
    async initializeClient() {
        try {
            console.log('🌍 Initializing Inworld AI client...');
            
            this.client = new InworldSDK({
                apiKey: this.apiKey,
                sceneId: this.sceneId,
                capabilities: {
                    audio: false,
                    emotions: true,
                    interruptions: true,
                    phonemes: false,
                    silence: true,
                    turnBasedStt: false
                }
            });

            // Set up event listeners
            this.setupEventListeners();
            
            console.log('✅ Inworld client initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Inworld client:', error);
            throw error;
        }
    }

    /**
     * Set up event listeners for Inworld client
     */
    setupEventListeners() {
        if (!this.client) return;

        this.client.on('connected', () => {
            console.log('🔗 Connected to Inworld');
            this.isConnected = true;
        });

        this.client.on('disconnected', () => {
            console.log('🔌 Disconnected from Inworld');
            this.isConnected = false;
        });

        this.client.on('error', (error) => {
            console.error('🚨 Inworld error:', error);
        });

        this.client.on('message', (message) => {
            console.log('📨 Received message from Inworld:', message);
        });
    }

    /**
     * Send a text message to an AI character
     * @param {string} message - The message to send
     * @param {string} userId - User identifier
     * @param {string} characterId - Character identifier (optional)
     * @returns {Promise<Object>} Response from AI character
     */
    async sendMessage(message, userId, characterId = null) {
        try {
            if (!this.client) {
                throw new Error('Inworld client not initialized');
            }

            // Ensure connection
            if (!this.isConnected) {
                await this.connect();
            }

            console.log(`💬 Sending message to Inworld: "${message}" (User: ${userId})`);

            const response = await this.client.sendTextMessage({
                text: message,
                userId: userId,
                characterId: characterId
            });

            return {
                success: true,
                response: response.text,
                emotion: response.emotion,
                characterId: response.characterId,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error sending message to Inworld:', error);
            return {
                success: false,
                error: error.message,
                fallbackResponse: this.generateFallbackResponse(message)
            };
        }
    }

    /**
     * Send a message to guide users through challenges
     * @param {string} challengeType - Type of challenge
     * @param {Object} userContext - User context and history
     * @returns {Promise<Object>} AI guide response
     */
    async sendChallengeGuide(challengeType, userContext) {
        const guideMessage = this.constructChallengeGuideMessage(challengeType, userContext);
        
        try {
            const response = await this.sendMessage(
                guideMessage, 
                userContext.userId, 
                'challenge-guide'
            );

            return {
                ...response,
                challengeType,
                guidance: response.response,
                encouragement: this.generateEncouragement(userContext.level || 1)
            };
        } catch (error) {
            console.error('❌ Error getting challenge guidance:', error);
            return {
                success: false,
                error: error.message,
                fallbackGuidance: this.getFallbackGuidance(challengeType)
            };
        }
    }

    /**
     * Connect to Inworld service
     */
    async connect() {
        try {
            if (!this.client) {
                await this.initializeClient();
            }
            
            await this.client.connect();
            console.log('🔗 Connected to Inworld service');
        } catch (error) {
            console.error('❌ Failed to connect to Inworld:', error);
            throw error;
        }
    }

    /**
     * Generate fallback response when Inworld is unavailable
     * @param {string} message - Original message
     * @returns {string} Fallback response
     */
    generateFallbackResponse(message) {
        const fallbacks = [
            "I understand! Let me help you with that.",
            "That's interesting! Tell me more.",
            "I'm here to guide you through this challenge.",
            "Great question! Here's what I think..."
        ];

        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    /**
     * Construct challenge guide message
     * @param {string} challengeType - Type of challenge
     * @param {Object} userContext - User context
     * @returns {string} Formatted guide message
     */
    constructChallengeGuideMessage(challengeType, userContext) {
        return `Hello! I'm your AI guide. You're about to start a ${challengeType} challenge. 
                Based on your level ${userContext.level || 1} and previous performance, 
                I'll help you succeed. Are you ready to begin?`;
    }

    /**
     * Generate encouragement based on user level
     * @param {number} level - User level
     * @returns {string} Encouragement message
     */
    generateEncouragement(level) {
        const encouragements = [
            "You're doing great! Keep it up!",
            "Excellent progress! You're becoming a pro!",
            "Outstanding! Your skills are really improving!",
            "Incredible work! You're mastering this platform!"
        ];

        const index = Math.min(level - 1, encouragements.length - 1);
        return encouragements[index];
    }

    /**
     * Get fallback guidance when Inworld is unavailable
     * @param {string} challengeType - Challenge type
     * @returns {string} Fallback guidance
     */
    getFallbackGuidance(challengeType) {
        const guidance = {
            'video-rating': 'Watch the video carefully and rate based on your genuine reaction.',
            'content-analysis': 'Analyze the visual and audio elements of the content.',
            'engagement-prediction': 'Predict how engaging this content would be for different audiences.',
            'default': 'Complete the challenge to the best of your ability!'
        };

        return guidance[challengeType] || guidance.default;
    }
}

module.exports = { InworldClient }; 