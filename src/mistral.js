/**
 * Mistral AI Client Integration
 * Handles content generation and AI-powered challenge creation
 */

class MistralClient {
    constructor() {
        this.apiKey = process.env.MISTRAL_API_KEY;
        this.baseUrl = process.env.MISTRAL_BASE_URL || 'https://api.mistral.ai/v1';
        this.model = process.env.MISTRAL_MODEL || 'mistral-large-latest';
        
        if (!this.apiKey) {
            console.warn('⚠️ Mistral API key not found. Using mock responses.');
        }

        console.log('🧠 Mistral client initialized');
    }

    /**
     * Generate a challenge based on user history
     * @param {Object} userHistory - User's interaction history
     * @returns {Promise<Object>} Generated challenge
     */
    async generateChallenge(userHistory) {
        try {
            const prompt = this.constructChallengePrompt(userHistory);
            
            if (!this.apiKey) {
                return this.generateMockChallenge(userHistory);
            }

            const response = await this.makeRequest('chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a creative AI that generates engaging video challenges for users based on their preferences and history.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            });

            return this.parseGeneratedChallenge(response);
        } catch (error) {
            console.error('❌ Error generating challenge:', error);
            return this.generateMockChallenge(userHistory);
        }
    }

    /**
     * Generate content optimization suggestions
     * @param {Object} contentData - Video content data and metrics
     * @returns {Promise<Object>} Optimization suggestions
     */
    async generateOptimizations(contentData) {
        try {
            const prompt = this.constructOptimizationPrompt(contentData);
            
            if (!this.apiKey) {
                return this.generateMockOptimizations(contentData);
            }

            const response = await this.makeRequest('chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert content analyst who provides actionable optimization suggestions for video content based on performance data.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.6
            });

            return this.parseOptimizationSuggestions(response);
        } catch (error) {
            console.error('❌ Error generating optimizations:', error);
            return this.generateMockOptimizations(contentData);
        }
    }

    /**
     * Generate personalized feedback for users
     * @param {Object} feedbackData - User feedback and performance data
     * @returns {Promise<Object>} Personalized feedback
     */
    async generatePersonalizedFeedback(feedbackData) {
        try {
            const prompt = this.constructFeedbackPrompt(feedbackData);
            
            if (!this.apiKey) {
                return this.generateMockFeedback(feedbackData);
            }

            const response = await this.makeRequest('chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a supportive AI coach who provides encouraging and constructive feedback to help users improve their content evaluation skills.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 400,
                temperature: 0.8
            });

            return this.parsePersonalizedFeedback(response);
        } catch (error) {
            console.error('❌ Error generating personalized feedback:', error);
            return this.generateMockFeedback(feedbackData);
        }
    }

    /**
     * Make HTTP request to Mistral API
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise<Object>} API response
     */
    async makeRequest(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Mistral API request failed:', error);
            throw error;
        }
    }

    /**
     * Construct challenge generation prompt
     * @param {Object} userHistory - User history data
     * @returns {string} Formatted prompt
     */
    constructChallengePrompt(userHistory) {
        return `Create an engaging video challenge for a user with the following profile:
        - Level: ${userHistory.level || 1}
        - Preferred content types: ${userHistory.preferences?.join(', ') || 'various'}
        - Recent performance: ${userHistory.averageScore || 'new user'}%
        - Interests: ${userHistory.interests?.join(', ') || 'general'}
        
        Generate a specific, actionable challenge that will help them improve their video evaluation skills.
        Include: challenge type, description, success criteria, and estimated time.
        Format as JSON with keys: type, title, description, criteria, timeEstimate, difficulty, points.`;
    }

    /**
     * Construct optimization prompt
     * @param {Object} contentData - Content performance data
     * @returns {string} Formatted prompt
     */
    constructOptimizationPrompt(contentData) {
        return `Analyze this video content performance and provide optimization suggestions:
        - Content type: ${contentData.type || 'video'}
        - Engagement rate: ${contentData.engagement || 'unknown'}%
        - Average view time: ${contentData.viewTime || 'unknown'} seconds
        - User ratings: ${contentData.ratings || 'no ratings'}
        - Demographics: ${contentData.demographics || 'mixed audience'}
        
        Provide specific, actionable recommendations to improve performance.
        Format as JSON with keys: summary, recommendations (array), priorityActions, expectedImpact.`;
    }

    /**
     * Construct feedback prompt
     * @param {Object} feedbackData - User feedback data
     * @returns {string} Formatted prompt
     */
    constructFeedbackPrompt(feedbackData) {
        return `Provide encouraging feedback for a user who completed a challenge:
        - Challenge type: ${feedbackData.challengeType || 'general'}
        - Score achieved: ${feedbackData.score || 0}%
        - Time taken: ${feedbackData.timeSpent || 'unknown'} seconds
        - Areas of strength: ${feedbackData.strengths?.join(', ') || 'to be determined'}
        - Areas for improvement: ${feedbackData.improvements?.join(', ') || 'to be determined'}
        
        Generate supportive, constructive feedback that motivates continued engagement.
        Format as JSON with keys: message, encouragement, tips, nextSteps.`;
    }

    /**
     * Parse generated challenge response
     * @param {Object} response - Mistral API response
     * @returns {Object} Parsed challenge data
     */
    parseGeneratedChallenge(response) {
        try {
            const content = response.choices[0].message.content;
            const challengeData = JSON.parse(content);
            
            return {
                success: true,
                challenge: {
                    id: this.generateId(),
                    type: challengeData.type || 'general',
                    title: challengeData.title || 'Video Challenge',
                    description: challengeData.description || 'Complete this challenge to earn points.',
                    criteria: challengeData.criteria || ['Complete the task'],
                    timeEstimate: challengeData.timeEstimate || '5 minutes',
                    difficulty: challengeData.difficulty || 'medium',
                    points: challengeData.points || 100,
                    createdAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('❌ Error parsing challenge response:', error);
            return this.generateMockChallenge({});
        }
    }

    /**
     * Parse optimization suggestions response
     * @param {Object} response - Mistral API response
     * @returns {Object} Parsed optimization data
     */
    parseOptimizationSuggestions(response) {
        try {
            const content = response.choices[0].message.content;
            const optimizationData = JSON.parse(content);
            
            return {
                success: true,
                optimizations: {
                    summary: optimizationData.summary || 'Content analysis completed',
                    recommendations: optimizationData.recommendations || [],
                    priorityActions: optimizationData.priorityActions || [],
                    expectedImpact: optimizationData.expectedImpact || 'Moderate improvement expected',
                    generatedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('❌ Error parsing optimization response:', error);
            return this.generateMockOptimizations({});
        }
    }

    /**
     * Parse personalized feedback response
     * @param {Object} response - Mistral API response
     * @returns {Object} Parsed feedback data
     */
    parsePersonalizedFeedback(response) {
        try {
            const content = response.choices[0].message.content;
            const feedbackData = JSON.parse(content);
            
            return {
                success: true,
                feedback: {
                    message: feedbackData.message || 'Great job on completing the challenge!',
                    encouragement: feedbackData.encouragement || 'Keep up the good work!',
                    tips: feedbackData.tips || ['Practice regularly', 'Focus on improvement'],
                    nextSteps: feedbackData.nextSteps || ['Try a new challenge'],
                    generatedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('❌ Error parsing feedback response:', error);
            return this.generateMockFeedback({});
        }
    }

    /**
     * Generate mock challenge when API is unavailable
     * @param {Object} userHistory - User history data
     * @returns {Object} Mock challenge data
     */
    generateMockChallenge(userHistory) {
        const challenges = [
            {
                type: 'video-rating',
                title: 'Video Quality Assessment',
                description: 'Rate the overall quality of this video content',
                criteria: ['Visual quality', 'Audio quality', 'Content relevance'],
                difficulty: 'easy',
                points: 50
            },
            {
                type: 'engagement-prediction',
                title: 'Engagement Forecasting',
                description: 'Predict how engaging this content will be',
                criteria: ['Audience appeal', 'Content timing', 'Visual appeal'],
                difficulty: 'medium',
                points: 100
            }
        ];

        const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
        
        return {
            success: true,
            challenge: {
                id: this.generateId(),
                ...randomChallenge,
                timeEstimate: '3-5 minutes',
                createdAt: new Date().toISOString()
            }
        };
    }

    /**
     * Generate mock optimizations when API is unavailable
     * @param {Object} contentData - Content data
     * @returns {Object} Mock optimization data
     */
    generateMockOptimizations(contentData) {
        return {
            success: true,
            optimizations: {
                summary: 'Content analysis completed with standard recommendations',
                recommendations: [
                    'Improve video thumbnail for better click-through rates',
                    'Optimize video length for target audience',
                    'Enhance audio quality for better engagement'
                ],
                priorityActions: [
                    'Update thumbnail design',
                    'Adjust video pacing'
                ],
                expectedImpact: 'Moderate improvement expected (10-20% increase in engagement)',
                generatedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Generate mock feedback when API is unavailable
     * @param {Object} feedbackData - Feedback data
     * @returns {Object} Mock feedback data
     */
    generateMockFeedback(feedbackData) {
        const score = feedbackData.score || 70;
        let message = 'Great job completing the challenge!';
        let encouragement = 'Keep up the excellent work!';
        
        if (score >= 90) {
            message = 'Outstanding performance! You\'re really excelling.';
            encouragement = 'You\'re becoming an expert at this!';
        } else if (score >= 70) {
            message = 'Good work! You\'re making solid progress.';
            encouragement = 'You\'re improving with each challenge!';
        } else if (score < 50) {
            message = 'Nice effort! Every challenge is a learning opportunity.';
            encouragement = 'Keep practicing - you\'re on the right track!';
        }

        return {
            success: true,
            feedback: {
                message,
                encouragement,
                tips: [
                    'Practice regularly to improve your skills',
                    'Pay attention to details in the content',
                    'Consider different audience perspectives'
                ],
                nextSteps: [
                    'Try a more challenging task',
                    'Review feedback guidelines',
                    'Explore different content types'
                ],
                generatedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Get client status
     * @returns {Object} Client status information
     */
    getStatus() {
        return {
            hasApiKey: !!this.apiKey,
            baseUrl: this.baseUrl,
            model: this.model,
            ready: true
        };
    }
}

module.exports = { MistralClient }; 