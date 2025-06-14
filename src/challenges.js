/**
 * Challenge Generation Logic
 * Manages AI-driven challenges, rewards, and quests for user engagement
 */

class ChallengeManager {
    constructor(mistralClient) {
        this.mistralClient = mistralClient;
        this.activeChallenges = new Map();
        this.challengeTemplates = this.initializeChallengeTemplates();
        this.rewardSystem = this.initializeRewardSystem();
        
        console.log('🎯 Challenge Manager initialized');
    }

    /**
     * Initialize challenge templates
     * @returns {Object} Challenge templates by type
     */
    initializeChallengeTemplates() {
        return {
            'video-rating': {
                name: 'Video Quality Rating',
                description: 'Evaluate video content across multiple dimensions',
                basePoints: 50,
                timeLimit: 300, // 5 minutes
                criteria: ['Visual quality', 'Audio quality', 'Content relevance']
            },
            'engagement-prediction': {
                name: 'Engagement Forecasting',
                description: 'Predict how engaging content will be',
                basePoints: 100,
                timeLimit: 600, // 10 minutes
                criteria: ['Audience appeal', 'Content timing', 'Visual factors']
            },
            'content-analysis': {
                name: 'Content Deep Dive',
                description: 'Comprehensive analysis of video elements',
                basePoints: 150,
                timeLimit: 900, // 15 minutes
                criteria: ['Theme analysis', 'Technical quality', 'Target audience']
            },
            'trend-spotting': {
                name: 'Trend Identification',
                description: 'Identify emerging trends and patterns in content',
                basePoints: 200,
                timeLimit: 1200, // 20 minutes
                criteria: [
                    'Trend pattern recognition',
                    'Future performance prediction',
                    'Market opportunity assessment',
                    'Strategic recommendations'
                ]
            }
        };
    }

    /**
     * Initialize reward system
     * @returns {Object} Reward system configuration
     */
    initializeRewardSystem() {
        return {
            streakMultipliers: {
                5: 1.2,    // 20% bonus for 5-day streak
                10: 1.5,   // 50% bonus for 10-day streak
                20: 2.0,   // 100% bonus for 20-day streak
                30: 2.5    // 150% bonus for 30-day streak
            },
            perfectScoreBonus: 0.5, // 50% bonus for perfect scores
            speedBonus: {
                fast: 0.3,     // 30% bonus for completing under 50% of time limit
                normal: 0.1,   // 10% bonus for completing under 80% of time limit
                slow: 0        // No bonus for taking more than 80% of time limit
            },
            levelMultipliers: {
                1: 1.0,
                5: 1.1,
                10: 1.2,
                20: 1.3,
                50: 1.5
            }
        };
    }

    /**
     * Generate a personalized challenge for a user
     * @param {Object} userHistory - User's interaction history and preferences
     * @returns {Promise<Object>} Generated challenge
     */
    async generateChallenge(userHistory) {
        try {
            console.log(`🎯 Generating challenge for user level ${userHistory.level || 1}`);

            // Determine challenge type based on user level and history
            const challengeType = this.selectChallengeType(userHistory);
            
            // Use Mistral AI to generate personalized challenge content
            const aiChallenge = await this.mistralClient.generateChallenge(userHistory);
            
            // Combine AI generation with template structure
            const challenge = this.combineAIWithTemplate(aiChallenge, challengeType, userHistory);
            
            // Store active challenge
            this.activeChallenges.set(userHistory.userId, challenge);
            
            return challenge;
        } catch (error) {
            console.error('❌ Error generating challenge:', error);
            return this.generateFallbackChallenge(userHistory);
        }
    }

    /**
     * Select appropriate challenge type based on user history
     * @param {Object} userHistory - User history and preferences
     * @returns {string} Challenge type
     */
    selectChallengeType(userHistory) {
        const level = userHistory.level || 1;
        const completedTypes = userHistory.completedChallengeTypes || [];
        
        // Progressive difficulty based on level
        if (level <= 5) {
            return 'video-rating';
        } else if (level <= 15) {
            return completedTypes.includes('video-rating') ? 'engagement-prediction' : 'video-rating';
        } else if (level <= 30) {
            const availableTypes = ['video-rating', 'engagement-prediction', 'content-analysis'];
            return this.selectUnusedOrLeastUsed(availableTypes, completedTypes);
        } else {
            const allTypes = Object.keys(this.challengeTemplates);
            return this.selectUnusedOrLeastUsed(allTypes, completedTypes);
        }
    }

    /**
     * Select unused or least used challenge type
     * @param {Array} availableTypes - Available challenge types
     * @param {Array} completedTypes - Previously completed challenge types
     * @returns {string} Selected challenge type
     */
    selectUnusedOrLeastUsed(availableTypes, completedTypes) {
        // Find unused types first
        const unusedTypes = availableTypes.filter(type => !completedTypes.includes(type));
        
        if (unusedTypes.length > 0) {
            return unusedTypes[Math.floor(Math.random() * unusedTypes.length)];
        }
        
        // If all types have been used, select randomly
        return availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }

    /**
     * Combine AI-generated challenge with template structure
     * @param {Object} aiChallenge - AI-generated challenge data
     * @param {string} challengeType - Challenge type
     * @param {Object} userHistory - User history
     * @returns {Object} Complete challenge
     */
    combineAIWithTemplate(aiChallenge, challengeType, userHistory) {
        const template = this.challengeTemplates[challengeType];
        const aiData = aiChallenge.success ? aiChallenge.challenge : null;
        
        return {
            id: this.generateChallengeId(),
            type: challengeType,
            title: aiData?.title || template.name,
            description: aiData?.description || template.description,
            criteria: aiData?.criteria || template.criteria,
            points: this.calculateBasePoints(template.basePoints, userHistory),
            timeLimit: template.timeLimit,
            difficulty: this.calculateDifficulty(userHistory),
            videoContent: this.selectVideoContent(challengeType, userHistory),
            instructions: this.generateInstructions(challengeType),
            createdAt: new Date().toISOString(),
            userId: userHistory.userId,
            status: 'active'
        };
    }

    /**
     * Calculate base points for challenge
     * @param {number} basePoints - Template base points
     * @param {Object} userHistory - User history
     * @returns {number} Calculated points
     */
    calculateBasePoints(basePoints, userHistory) {
        const level = userHistory.level || 1;
        const levelMultiplier = this.rewardSystem.levelMultipliers[Math.min(level, 50)] || 1.0;
        
        return Math.floor(basePoints * levelMultiplier);
    }

    /**
     * Calculate challenge difficulty
     * @param {Object} userHistory - User history
     * @returns {string} Difficulty level
     */
    calculateDifficulty(userHistory) {
        const level = userHistory.level || 1;
        const averageScore = userHistory.averageScore || 50;
        
        if (level <= 5 || averageScore < 60) return 'easy';
        if (level <= 15 || averageScore < 80) return 'medium';
        if (level <= 30 || averageScore < 90) return 'hard';
        return 'expert';
    }

    /**
     * Select appropriate video content for challenge
     * @param {string} challengeType - Challenge type
     * @param {Object} userHistory - User history
     * @returns {Object} Video content data
     */
    selectVideoContent(challengeType, userHistory) {
        // This would integrate with your video database
        // For now, return mock data
        return {
            id: 'video_' + Date.now(),
            url: '/api/video/sample',
            thumbnail: '/api/video/sample/thumbnail',
            duration: 120,
            type: userHistory.preferences?.[0] || 'general',
            metadata: {
                title: 'Sample Video Content',
                description: 'Video content for evaluation challenge',
                tags: ['sample', 'evaluation', challengeType]
            }
        };
    }

    /**
     * Generate challenge instructions
     * @param {string} challengeType - Challenge type
     * @returns {Array} Array of instruction strings
     */
    generateInstructions(challengeType) {
        const instructions = {
            'video-rating': [
                'Watch the video content carefully',
                'Rate each criteria on a scale of 1-10',
                'Provide brief explanations for your ratings'
            ],
            'engagement-prediction': [
                'Analyze the video for engagement factors',
                'Predict engagement rates for different demographics',
                'Identify key engagement drivers'
            ],
            'content-analysis': [
                'Perform comprehensive content analysis',
                'Identify themes and production elements',
                'Provide improvement recommendations'
            ]
        };

        return instructions[challengeType] || instructions['video-rating'];
    }

    /**
     * Process challenge completion
     * @param {string} challengeId - Challenge ID
     * @param {Object} userResponse - User's response data
     * @returns {Promise<Object>} Challenge completion results
     */
    async processChallengeCompletion(challengeId, userResponse) {
        try {
            const challenge = this.findChallengeById(challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            // Calculate performance metrics
            const performance = this.calculatePerformance(challenge, userResponse);
            
            // Calculate rewards
            const rewards = this.calculateRewards(challenge, performance, userResponse.userHistory);
            
            // Update challenge status
            challenge.status = 'completed';
            challenge.completedAt = new Date().toISOString();
            challenge.userResponse = userResponse;
            challenge.performance = performance;
            challenge.rewards = rewards;

            console.log(`✅ Challenge ${challengeId} completed with score: ${performance.score}%`);

            return {
                success: true,
                challengeId,
                performance,
                rewards,
                feedback: await this.generateCompletionFeedback(challenge, performance)
            };
        } catch (error) {
            console.error('❌ Error processing challenge completion:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Calculate user performance on challenge
     * @param {Object} challenge - Challenge data
     * @param {Object} userResponse - User response
     * @returns {Object} Performance metrics
     */
    calculatePerformance(challenge, userResponse) {
        const timeSpent = userResponse.timeSpent || challenge.timeLimit;
        const timeTaken = Math.min(timeSpent, challenge.timeLimit);
        const timeEfficiency = (challenge.timeLimit - timeTaken) / challenge.timeLimit;
        
        // Calculate base score (this would be more sophisticated in real implementation)
        let baseScore = userResponse.score || 70;
        
        // Apply time efficiency bonus
        if (timeEfficiency > 0.5) {
            baseScore += 10; // Fast completion bonus
        } else if (timeEfficiency > 0.2) {
            baseScore += 5;  // Moderate speed bonus
        }

        // Ensure score is within bounds
        const finalScore = Math.max(0, Math.min(100, baseScore));

        return {
            score: finalScore,
            timeSpent: timeTaken,
            timeEfficiency,
            accuracy: userResponse.accuracy || 0.8,
            completeness: userResponse.completeness || 0.9,
            qualityMetrics: userResponse.qualityMetrics || {}
        };
    }

    /**
     * Calculate rewards for challenge completion
     * @param {Object} challenge - Challenge data
     * @param {Object} performance - Performance metrics
     * @param {Object} userHistory - User history
     * @returns {Object} Reward breakdown
     */
    calculateRewards(challenge, performance, userHistory) {
        let totalPoints = challenge.points;
        const bonuses = [];

        // Performance bonus
        if (performance.score >= 90) {
            const perfectBonus = Math.floor(totalPoints * this.rewardSystem.perfectScoreBonus);
            totalPoints += perfectBonus;
            bonuses.push({ type: 'perfect_score', points: perfectBonus });
        }

        // Speed bonus
        if (performance.timeEfficiency > 0.5) {
            const speedBonus = Math.floor(totalPoints * this.rewardSystem.speedBonus.fast);
            totalPoints += speedBonus;
            bonuses.push({ type: 'speed_fast', points: speedBonus });
        } else if (performance.timeEfficiency > 0.2) {
            const speedBonus = Math.floor(totalPoints * this.rewardSystem.speedBonus.normal);
            totalPoints += speedBonus;
            bonuses.push({ type: 'speed_normal', points: speedBonus });
        }

        // Streak bonus
        const streak = userHistory.currentStreak || 0;
        const streakMultiplier = Object.keys(this.rewardSystem.streakMultipliers)
            .reverse()
            .find(days => streak >= parseInt(days));
        
        if (streakMultiplier) {
            const multiplier = this.rewardSystem.streakMultipliers[streakMultiplier];
            const streakBonus = Math.floor(totalPoints * (multiplier - 1));
            totalPoints += streakBonus;
            bonuses.push({ type: 'streak', days: streakMultiplier, points: streakBonus });
        }

        return {
            basePoints: challenge.points,
            bonuses,
            totalPoints,
            experience: Math.floor(totalPoints * 0.1),
            achievements: this.checkAchievements(challenge, performance, userHistory)
        };
    }

    /**
     * Check for achievements unlocked
     * @param {Object} challenge - Challenge data
     * @param {Object} performance - Performance metrics
     * @param {Object} userHistory - User history
     * @returns {Array} Unlocked achievements
     */
    checkAchievements(challenge, performance, userHistory) {
        const achievements = [];

        // First perfect score
        if (performance.score === 100 && !userHistory.achievements?.includes('first_perfect')) {
            achievements.push({
                id: 'first_perfect',
                name: 'Perfect Score',
                description: 'Achieved your first perfect score!',
                points: 100
            });
        }

        // Speed demon
        if (performance.timeEfficiency > 0.7 && !userHistory.achievements?.includes('speed_demon')) {
            achievements.push({
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Completed a challenge in record time!',
                points: 50
            });
        }

        // Challenge variety
        const completedTypes = userHistory.completedChallengeTypes || [];
        if (completedTypes.length >= 3 && !userHistory.achievements?.includes('variety_master')) {
            achievements.push({
                id: 'variety_master',
                name: 'Variety Master',
                description: 'Completed challenges of multiple types!',
                points: 150
            });
        }

        return achievements;
    }

    /**
     * Generate completion feedback
     * @param {Object} challenge - Challenge data
     * @param {Object} performance - Performance metrics
     * @returns {Promise<Object>} Feedback data
     */
    async generateCompletionFeedback(challenge, performance) {
        try {
            const feedbackData = {
                challengeType: challenge.type,
                score: performance.score,
                timeSpent: performance.timeSpent,
                strengths: this.identifyStrengths(performance),
                improvements: this.identifyImprovements(performance)
            };

            return await this.mistralClient.generatePersonalizedFeedback(feedbackData);
        } catch (error) {
            console.error('❌ Error generating completion feedback:', error);
            return this.generateFallbackFeedback(performance);
        }
    }

    /**
     * Identify user strengths from performance
     * @param {Object} performance - Performance metrics
     * @returns {Array} Strength areas
     */
    identifyStrengths(performance) {
        const strengths = [];
        
        if (performance.score >= 90) strengths.push('Excellent evaluation skills');
        if (performance.timeEfficiency > 0.5) strengths.push('Efficient task completion');
        if (performance.accuracy > 0.85) strengths.push('High accuracy in assessments');
        if (performance.completeness > 0.9) strengths.push('Thorough analysis approach');
        
        return strengths;
    }

    /**
     * Identify areas for improvement
     * @param {Object} performance - Performance metrics
     * @returns {Array} Improvement areas
     */
    identifyImprovements(performance) {
        const improvements = [];
        
        if (performance.score < 70) improvements.push('Focus on evaluation criteria');
        if (performance.timeEfficiency < 0.2) improvements.push('Work on time management');
        if (performance.accuracy < 0.7) improvements.push('Improve assessment accuracy');
        if (performance.completeness < 0.8) improvements.push('Provide more comprehensive analysis');
        
        return improvements;
    }

    /**
     * Generate fallback challenge when AI fails
     * @param {Object} userHistory - User history
     * @returns {Object} Fallback challenge
     */
    generateFallbackChallenge(userHistory) {
        const challengeType = 'video-rating';
        const template = this.challengeTemplates[challengeType];
        
        return {
            id: this.generateChallengeId(),
            type: challengeType,
            title: template.name,
            description: template.description,
            criteria: template.criteria,
            points: this.calculateBasePoints(template.basePoints, userHistory),
            timeLimit: template.timeLimit,
            difficulty: this.calculateDifficulty(userHistory),
            videoContent: this.selectVideoContent(challengeType, userHistory),
            instructions: this.generateInstructions(challengeType),
            createdAt: new Date().toISOString(),
            userId: userHistory.userId,
            status: 'active',
            fallback: true
        };
    }

    /**
     * Generate fallback feedback
     * @param {Object} performance - Performance metrics
     * @returns {Object} Fallback feedback
     */
    generateFallbackFeedback(performance) {
        return {
            success: true,
            feedback: {
                message: `Great job! You scored ${performance.score}% on this challenge.`,
                encouragement: 'Keep up the excellent work!',
                tips: [
                    'Continue practicing to improve your skills',
                    'Pay attention to all evaluation criteria',
                    'Take your time to provide thoughtful responses'
                ],
                nextSteps: [
                    'Try a more challenging task',
                    'Explore different content types',
                    'Share feedback with other users'
                ]
            }
        };
    }

    /**
     * Find challenge by ID
     * @param {string} challengeId - Challenge ID
     * @returns {Object|null} Challenge data or null
     */
    findChallengeById(challengeId) {
        for (const [userId, challenge] of this.activeChallenges) {
            if (challenge.id === challengeId) {
                return challenge;
            }
        }
        return null;
    }

    /**
     * Generate unique challenge ID
     * @returns {string} Unique challenge ID
     */
    generateChallengeId() {
        return 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get active challenges for a user
     * @param {string} userId - User ID
     * @returns {Array} Active challenges
     */
    getUserActiveChallenges(userId) {
        return this.activeChallenges.has(userId) ? [this.activeChallenges.get(userId)] : [];
    }

    /**
     * Get challenge statistics
     * @returns {Object} Challenge statistics
     */
    getStatistics() {
        const stats = {
            totalActive: this.activeChallenges.size,
            byType: {},
            byDifficulty: {}
        };

        for (const [userId, challenge] of this.activeChallenges) {
            // Count by type
            stats.byType[challenge.type] = (stats.byType[challenge.type] || 0) + 1;
            
            // Count by difficulty
            stats.byDifficulty[challenge.difficulty] = (stats.byDifficulty[challenge.difficulty] || 0) + 1;
        }

        return stats;
    }
}

module.exports = { ChallengeManager }; 