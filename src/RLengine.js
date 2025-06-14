/**
 * Reinforcement Learning Engine
 * Adapts and optimizes content delivery based on user engagement and feedback
 */

class RLEngine {
    constructor() {
        this.userProfiles = new Map();
        this.contentPerformance = new Map();
        this.learningRate = 0.1;
        this.explorationRate = 0.2;
        this.decayRate = 0.95;
        
        console.log('🧠 Reinforcement Learning Engine initialized');
    }

    /**
     * Update the model with new feedback data
     * @param {Object} feedbackData - Processed feedback data
     */
    async updateModel(feedbackData) {
        try {
            console.log('📊 Updating RL model with new feedback');
            
            // Update user profile
            this.updateUserProfile(feedbackData.userId, feedbackData);
            
            // Update content performance metrics
            this.updateContentPerformance(feedbackData.contentId, feedbackData);
            
            // Apply reinforcement learning updates
            this.applyRLUpdates(feedbackData);
            
            return { success: true, message: 'Model updated successfully' };
        } catch (error) {
            console.error('❌ Error updating RL model:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user profile with new feedback
     * @param {string} userId - User ID
     * @param {Object} feedbackData - Feedback data
     */
    updateUserProfile(userId, feedbackData) {
        if (!this.userProfiles.has(userId)) {
            this.userProfiles.set(userId, this.createInitialProfile());
        }
        
        const profile = this.userProfiles.get(userId);
        
        // Update preferences based on feedback
        this.updatePreferences(profile, feedbackData);
        
        // Update engagement patterns
        this.updateEngagementPatterns(profile, feedbackData);
        
        // Update performance metrics
        this.updatePerformanceMetrics(profile, feedbackData);
        
        profile.lastUpdated = new Date().toISOString();
        profile.totalInteractions += 1;
    }

    /**
     * Create initial user profile
     * @returns {Object} Initial user profile
     */
    createInitialProfile() {
        return {
            preferences: {
                contentTypes: {},
                topics: {},
                difficulty: 'medium',
                sessionLength: 'medium'
            },
            engagementPatterns: {
                averageSessionTime: 0,
                completionRate: 0,
                accuracyScore: 0,
                responseTime: 0
            },
            performanceMetrics: {
                averageScore: 0,
                improvement: 0,
                streak: 0,
                level: 1
            },
            totalInteractions: 0,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Update user preferences
     * @param {Object} profile - User profile
     * @param {Object} feedbackData - Feedback data
     */
    updatePreferences(profile, feedbackData) {
        const { contentType, rating, engagement } = feedbackData;
        
        // Update content type preferences
        if (contentType) {
            if (!profile.preferences.contentTypes[contentType]) {
                profile.preferences.contentTypes[contentType] = { score: 0, count: 0 };
            }
            
            const typeData = profile.preferences.contentTypes[contentType];
            typeData.score = this.updateScore(typeData.score, rating || engagement, typeData.count);
            typeData.count += 1;
        }
        
        // Update difficulty preference based on performance
        if (feedbackData.challengeCompleted) {
            this.updateDifficultyPreference(profile, feedbackData);
        }
    }

    /**
     * Update engagement patterns
     * @param {Object} profile - User profile
     * @param {Object} feedbackData - Feedback data
     */
    updateEngagementPatterns(profile, feedbackData) {
        const patterns = profile.engagementPatterns;
        
        if (feedbackData.sessionTime) {
            patterns.averageSessionTime = this.updateAverage(
                patterns.averageSessionTime, 
                feedbackData.sessionTime, 
                profile.totalInteractions
            );
        }
        
        if (feedbackData.completed !== undefined) {
            patterns.completionRate = this.updateAverage(
                patterns.completionRate, 
                feedbackData.completed ? 1 : 0, 
                profile.totalInteractions
            );
        }
        
        if (feedbackData.accuracyScore) {
            patterns.accuracyScore = this.updateAverage(
                patterns.accuracyScore, 
                feedbackData.accuracyScore, 
                profile.totalInteractions
            );
        }
    }

    /**
     * Update performance metrics
     * @param {Object} profile - User profile
     * @param {Object} feedbackData - Feedback data
     */
    updatePerformanceMetrics(profile, feedbackData) {
        const metrics = profile.performanceMetrics;
        
        if (feedbackData.score) {
            const oldAverage = metrics.averageScore;
            metrics.averageScore = this.updateAverage(
                oldAverage, 
                feedbackData.score, 
                profile.totalInteractions
            );
            
            // Calculate improvement
            metrics.improvement = metrics.averageScore - oldAverage;
        }
        
        // Update streak
        if (feedbackData.completed && feedbackData.score >= 70) {
            metrics.streak += 1;
        } else if (!feedbackData.completed || feedbackData.score < 50) {
            metrics.streak = 0;
        }
        
        // Update level based on performance
        metrics.level = this.calculateLevel(metrics.averageScore, metrics.streak);
    }

    /**
     * Update content performance metrics
     * @param {string} contentId - Content ID
     * @param {Object} feedbackData - Feedback data
     */
    updateContentPerformance(contentId, feedbackData) {
        if (!this.contentPerformance.has(contentId)) {
            this.contentPerformance.set(contentId, {
                averageRating: 0,
                engagementScore: 0,
                completionRate: 0,
                difficulty: 'medium',
                totalViews: 0,
                totalRatings: 0,
                demographics: {}
            });
        }
        
        const performance = this.contentPerformance.get(contentId);
        
        if (feedbackData.rating) {
            performance.averageRating = this.updateAverage(
                performance.averageRating, 
                feedbackData.rating, 
                performance.totalRatings
            );
            performance.totalRatings += 1;
        }
        
        if (feedbackData.engagement) {
            performance.engagementScore = this.updateAverage(
                performance.engagementScore, 
                feedbackData.engagement, 
                performance.totalViews
            );
        }
        
        performance.totalViews += 1;
    }

    /**
     * Apply reinforcement learning updates
     * @param {Object} feedbackData - Feedback data
     */
    applyRLUpdates(feedbackData) {
        // Update exploration rate (epsilon decay)
        this.explorationRate *= this.decayRate;
        this.explorationRate = Math.max(0.01, this.explorationRate);
        
        // Update learning rate
        this.learningRate *= this.decayRate;
        this.learningRate = Math.max(0.01, this.learningRate);
    }

    /**
     * Generate recommendations for a user
     * @param {Object} userProfile - User profile
     * @returns {Array} Recommended content
     */
    async generateRecommendations(userProfile) {
        try {
            console.log('🎯 Generating RL-based recommendations');
            
            const recommendations = [];
            
            // Get user preferences
            const topContentTypes = this.getTopPreferences(userProfile.preferences.contentTypes);
            const targetDifficulty = userProfile.preferences.difficulty;
            
            // Generate recommendations based on preferences and performance
            for (const contentType of topContentTypes) {
                const recommendation = this.generateRecommendation(contentType, targetDifficulty, userProfile);
                if (recommendation) {
                    recommendations.push(recommendation);
                }
            }
            
            // Add exploration recommendations
            const explorationRecs = this.generateExplorationRecommendations(userProfile);
            recommendations.push(...explorationRecs);
            
            // Sort by predicted engagement
            recommendations.sort((a, b) => b.predictedEngagement - a.predictedEngagement);
            
            return recommendations.slice(0, 10); // Return top 10
        } catch (error) {
            console.error('❌ Error generating recommendations:', error);
            return this.generateFallbackRecommendations();
        }
    }

    /**
     * Get user profile
     * @param {string} userId - User ID
     * @returns {Object} User profile
     */
    getUserProfile(userId) {
        return this.userProfiles.get(userId) || this.createInitialProfile();
    }

    /**
     * Get user statistics
     * @param {string} userId - User ID
     * @returns {Object} User statistics
     */
    getUserStats(userId) {
        const profile = this.getUserProfile(userId);
        
        return {
            level: profile.performanceMetrics.level,
            averageScore: profile.performanceMetrics.averageScore,
            streak: profile.performanceMetrics.streak,
            totalInteractions: profile.totalInteractions,
            completionRate: profile.engagementPatterns.completionRate,
            improvementTrend: profile.performanceMetrics.improvement,
            preferredContentTypes: this.getTopPreferences(profile.preferences.contentTypes, 3),
            avgSessionTime: profile.engagementPatterns.averageSessionTime
        };
    }

    /**
     * Update score using exponential moving average
     * @param {number} oldScore - Previous score
     * @param {number} newScore - New score
     * @param {number} count - Number of observations
     * @returns {number} Updated score
     */
    updateScore(oldScore, newScore, count) {
        if (count === 0) return newScore;
        const weight = Math.min(this.learningRate, 1.0 / count);
        return oldScore * (1 - weight) + newScore * weight;
    }

    /**
     * Update average value
     * @param {number} oldAverage - Previous average
     * @param {number} newValue - New value
     * @param {number} count - Number of observations
     * @returns {number} Updated average
     */
    updateAverage(oldAverage, newValue, count) {
        if (count === 0) return newValue;
        return (oldAverage * count + newValue) / (count + 1);
    }

    /**
     * Calculate user level based on performance
     * @param {number} averageScore - Average score
     * @param {number} streak - Current streak
     * @returns {number} User level
     */
    calculateLevel(averageScore, streak) {
        const baseLevel = Math.floor(averageScore / 10);
        const streakBonus = Math.floor(streak / 5);
        return Math.max(1, baseLevel + streakBonus);
    }

    /**
     * Get top preferences from preferences object
     * @param {Object} preferences - Preferences object
     * @param {number} limit - Number of top preferences to return
     * @returns {Array} Top preferences
     */
    getTopPreferences(preferences, limit = 5) {
        return Object.entries(preferences)
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, limit)
            .map(([key]) => key);
    }

    /**
     * Generate a single recommendation
     * @param {string} contentType - Content type
     * @param {string} difficulty - Target difficulty
     * @param {Object} userProfile - User profile
     * @returns {Object} Recommendation
     */
    generateRecommendation(contentType, difficulty, userProfile) {
        return {
            id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            contentType,
            difficulty,
            predictedEngagement: this.predictEngagement(contentType, difficulty, userProfile),
            reason: `Based on your preference for ${contentType} content`,
            estimatedTime: this.estimateTime(difficulty),
            points: this.estimatePoints(difficulty)
        };
    }

    /**
     * Generate exploration recommendations
     * @param {Object} userProfile - User profile
     * @returns {Array} Exploration recommendations
     */
    generateExplorationRecommendations(userProfile) {
        if (Math.random() > this.explorationRate) return [];
        
        const unexploredTypes = ['video-analysis', 'trend-prediction', 'audience-segmentation'];
        const exploredTypes = Object.keys(userProfile.preferences.contentTypes);
        const newTypes = unexploredTypes.filter(type => !exploredTypes.includes(type));
        
        return newTypes.slice(0, 2).map(type => ({
            id: 'explore_' + Date.now() + '_' + type,
            contentType: type,
            difficulty: 'easy',
            predictedEngagement: 0.6,
            reason: 'Exploring new content type',
            estimatedTime: '5 minutes',
            points: 50,
            exploration: true
        }));
    }

    /**
     * Predict engagement for content
     * @param {string} contentType - Content type
     * @param {string} difficulty - Difficulty level
     * @param {Object} userProfile - User profile
     * @returns {number} Predicted engagement score
     */
    predictEngagement(contentType, difficulty, userProfile) {
        let baseScore = 0.5;
        
        // Adjust based on content type preference
        const typePreference = userProfile.preferences.contentTypes[contentType];
        if (typePreference) {
            baseScore += (typePreference.score - 0.5) * 0.3;
        }
        
        // Adjust based on difficulty match
        const preferredDifficulty = userProfile.preferences.difficulty;
        if (difficulty === preferredDifficulty) {
            baseScore += 0.2;
        }
        
        // Adjust based on recent performance
        const recentPerformance = userProfile.performanceMetrics.averageScore / 100;
        baseScore += recentPerformance * 0.2;
        
        return Math.max(0.1, Math.min(1.0, baseScore));
    }

    /**
     * Estimate time for content
     * @param {string} difficulty - Difficulty level
     * @returns {string} Estimated time
     */
    estimateTime(difficulty) {
        const times = {
            easy: '3-5 minutes',
            medium: '5-10 minutes',
            hard: '10-15 minutes',
            expert: '15-20 minutes'
        };
        return times[difficulty] || times.medium;
    }

    /**
     * Estimate points for content
     * @param {string} difficulty - Difficulty level
     * @returns {number} Estimated points
     */
    estimatePoints(difficulty) {
        const points = {
            easy: 50,
            medium: 100,
            hard: 150,
            expert: 200
        };
        return points[difficulty] || points.medium;
    }

    /**
     * Generate fallback recommendations
     * @returns {Array} Fallback recommendations
     */
    generateFallbackRecommendations() {
        return [
            {
                id: 'fallback_1',
                contentType: 'video-rating',
                difficulty: 'easy',
                predictedEngagement: 0.7,
                reason: 'Recommended for beginners',
                estimatedTime: '5 minutes',
                points: 50
            },
            {
                id: 'fallback_2',
                contentType: 'engagement-prediction',
                difficulty: 'medium',
                predictedEngagement: 0.6,
                reason: 'Popular challenge type',
                estimatedTime: '10 minutes',
                points: 100
            }
        ];
    }
}

module.exports = { RLEngine }; 