/**
 * User Feedback Processing System
 * Handles collection, processing, and analysis of user feedback on video content
 */

class UserFeedbackProcessor {
    constructor() {
        this.feedbackStore = new Map();
        this.userHistories = new Map();
        this.feedbackMetrics = new Map();
        
        console.log('📊 User Feedback Processor initialized');
    }

    /**
     * Process incoming user feedback
     * @param {Object} feedbackData - Raw feedback data from user
     * @returns {Promise<Object>} Processed feedback with analytics
     */
    async processFeedback(feedbackData) {
        try {
            console.log(`📝 Processing feedback from user: ${feedbackData.userId}`);
            
            // Validate feedback data
            const validation = this.validateFeedback(feedbackData);
            if (!validation.isValid) {
                throw new Error(`Invalid feedback: ${validation.errors.join(', ')}`);
            }

            // Clean and normalize feedback data
            const cleanedFeedback = this.cleanFeedbackData(feedbackData);
            
            // Extract insights and metrics
            const insights = this.extractInsights(cleanedFeedback);
            
            // Calculate reward based on feedback quality
            const reward = this.calculateFeedbackReward(cleanedFeedback, insights);
            
            // Store processed feedback
            const processedFeedback = {
                id: this.generateFeedbackId(),
                ...cleanedFeedback,
                insights,
                reward,
                processedAt: new Date().toISOString(),
                status: 'processed'
            };

            this.storeFeedback(processedFeedback);
            this.updateUserHistory(feedbackData.userId, processedFeedback);
            this.updateMetrics(processedFeedback);

            console.log(`✅ Feedback processed. Reward: ${reward.points} points`);

            return {
                success: true,
                feedbackId: processedFeedback.id,
                insights,
                reward,
                qualityScore: insights.qualityScore
            };

        } catch (error) {
            console.error('❌ Error processing feedback:', error);
            return {
                success: false,
                error: error.message,
                fallbackReward: { points: 10, reason: 'Basic participation' }
            };
        }
    }

    /**
     * Validate feedback data structure and content
     * @param {Object} feedbackData - Raw feedback data
     * @returns {Object} Validation result
     */
    validateFeedback(feedbackData) {
        const errors = [];
        
        // Required fields
        if (!feedbackData.userId) errors.push('User ID is required');
        if (!feedbackData.contentId) errors.push('Content ID is required');
        if (!feedbackData.rating && !feedbackData.textFeedback) {
            errors.push('Rating or text feedback is required');
        }
        
        // Rating validation
        if (feedbackData.rating && (feedbackData.rating < 1 || feedbackData.rating > 10)) {
            errors.push('Rating must be between 1 and 10');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Clean and normalize feedback data
     * @param {Object} feedbackData - Raw feedback data
     * @returns {Object} Cleaned feedback data
     */
    cleanFeedbackData(feedbackData) {
        return {
            userId: feedbackData.userId.trim(),
            contentId: feedbackData.contentId.trim(),
            rating: feedbackData.rating,
            textFeedback: feedbackData.textFeedback?.trim() || null,
            metadata: {
                viewTime: feedbackData.viewTime || 0,
                completionPercentage: feedbackData.completionPercentage || 0
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Extract insights from feedback data
     * @param {Object} feedbackData - Cleaned feedback data
     * @returns {Object} Extracted insights
     */
    extractInsights(feedbackData) {
        const insights = {
            qualityScore: this.calculateQualityScore(feedbackData),
            sentimentScore: 0,
            engagementScore: this.calculateEngagementScore(feedbackData.metadata),
            categories: ['general']
        };

        // Analyze text feedback if present
        if (feedbackData.textFeedback) {
            insights.sentimentScore = this.analyzeSentiment(feedbackData.textFeedback);
            insights.categories = this.categorizeTextFeedback(feedbackData.textFeedback);
        }
        
        return insights;
    }

    /**
     * Calculate quality score for feedback
     * @param {Object} feedbackData - Feedback data
     * @returns {number} Quality score (0-100)
     */
    calculateQualityScore(feedbackData) {
        let score = 20; // Base score
        
        // Rating provided
        if (feedbackData.rating !== undefined) {
            score += 25;
        }
        
        // Text feedback provided
        if (feedbackData.textFeedback) {
            const wordCount = feedbackData.textFeedback.split(' ').length;
            if (wordCount >= 10) score += 30;
            else if (wordCount >= 5) score += 20;
            else score += 10;
        }
        
        // Completion percentage
        const completion = feedbackData.metadata.completionPercentage || 0;
        score += Math.min(25, completion / 4);
        
        return Math.min(100, score);
    }

    /**
     * Analyze sentiment in text feedback
     * @param {string} text - Text to analyze
     * @returns {number} Sentiment score (-1 to 1)
     */
    analyzeSentiment(text) {
        // Simple sentiment analysis (in real implementation, use proper NLP)
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor'];
        
        const words = text.toLowerCase().split(/\W+/);
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) positiveCount++;
            if (negativeWords.includes(word)) negativeCount++;
        });
        
        const total = positiveCount + negativeCount;
        return total === 0 ? 0 : (positiveCount - negativeCount) / total;
    }

    /**
     * Categorize text feedback
     * @param {string} text - Text to categorize
     * @returns {Array} Categories
     */
    categorizeTextFeedback(text) {
        const categories = [];
        const lowerText = text.toLowerCase();
        
        const categoryKeywords = {
            'video-quality': ['quality', 'resolution', 'clarity'],
            'audio-quality': ['sound', 'audio', 'music'],
            'content': ['story', 'message', 'information'],
            'engagement': ['boring', 'interesting', 'engaging']
        };
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                categories.push(category);
            }
        }
        
        return categories.length > 0 ? categories : ['general'];
    }

    /**
     * Calculate engagement score from metadata
     * @param {Object} metadata - Interaction metadata
     * @returns {number} Engagement score (0-100)
     */
    calculateEngagementScore(metadata) {
        let score = 0;
        
        // Completion percentage
        score += (metadata.completionPercentage || 0) * 0.6;
        
        // View time relative to content length (assuming 2 minutes average)
        const expectedViewTime = 120; // 2 minutes in seconds
        const viewTimeScore = Math.min(40, (metadata.viewTime / expectedViewTime) * 40);
        score += viewTimeScore;
        
        return Math.min(100, score);
    }

    /**
     * Calculate reward for feedback submission
     * @param {Object} feedbackData - Feedback data
     * @param {Object} insights - Extracted insights
     * @returns {Object} Reward details
     */
    calculateFeedbackReward(feedbackData, insights) {
        let basePoints = 10; // Base participation points
        const bonuses = [];
        
        // Quality bonus
        const qualityBonus = Math.floor(insights.qualityScore / 20) * 5;
        basePoints += qualityBonus;
        if (qualityBonus > 0) {
            bonuses.push({ type: 'quality', points: qualityBonus });
        }
        
        // Engagement bonus
        if (insights.engagementScore > 70) {
            basePoints += 15;
            bonuses.push({ type: 'engagement', points: 15 });
        }
        
        return {
            points: basePoints,
            bonuses,
            reason: 'Feedback contribution',
            qualityScore: insights.qualityScore
        };
    }

    /**
     * Get user feedback history
     * @param {string} userId - User ID
     * @returns {Object} User feedback history
     */
    async getUserHistory(userId) {
        if (!this.userHistories.has(userId)) {
            return this.createInitialUserHistory(userId);
        }
        
        return this.userHistories.get(userId);
    }

    /**
     * Get user progress statistics
     * @param {string} userId - User ID
     * @returns {Object} User progress data
     */
    async getUserProgress(userId) {
        const history = await this.getUserHistory(userId);
        
        return {
            totalFeedback: history.totalFeedback,
            averageQuality: history.averageQualityScore,
            totalPoints: history.totalPointsEarned,
            level: this.calculateUserLevel(history),
            recentActivity: history.recentFeedback.slice(-5)
        };
    }

    /**
     * Store processed feedback
     * @param {Object} processedFeedback - Processed feedback data
     */
    storeFeedback(processedFeedback) {
        this.feedbackStore.set(processedFeedback.id, processedFeedback);
    }

    /**
     * Update user history with new feedback
     * @param {string} userId - User ID
     * @param {Object} processedFeedback - Processed feedback
     */
    updateUserHistory(userId, processedFeedback) {
        if (!this.userHistories.has(userId)) {
            this.userHistories.set(userId, this.createInitialUserHistory(userId));
        }
        
        const history = this.userHistories.get(userId);
        
        // Update counters
        history.totalFeedback += 1;
        history.totalPointsEarned += processedFeedback.reward.points;
        
        // Update averages
        history.averageQualityScore = this.updateAverage(
            history.averageQualityScore,
            processedFeedback.insights.qualityScore,
            history.totalFeedback
        );
        
        // Add to recent feedback
        history.recentFeedback.push({
            id: processedFeedback.id,
            contentId: processedFeedback.contentId,
            qualityScore: processedFeedback.insights.qualityScore,
            points: processedFeedback.reward.points,
            timestamp: processedFeedback.processedAt
        });
        
        // Keep only last 10 recent feedback entries
        if (history.recentFeedback.length > 10) {
            history.recentFeedback = history.recentFeedback.slice(-10);
        }
        
        history.lastUpdated = new Date().toISOString();
    }

    /**
     * Create initial user history
     * @param {string} userId - User ID
     * @returns {Object} Initial user history
     */
    createInitialUserHistory(userId) {
        return {
            userId,
            totalFeedback: 0,
            averageQualityScore: 0,
            totalPointsEarned: 0,
            level: 1,
            preferences: ['general'],
            completedChallengeTypes: [],
            recentFeedback: [],
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Update average value
     * @param {number} currentAverage - Current average
     * @param {number} newValue - New value
     * @param {number} count - Total count
     * @returns {number} Updated average
     */
    updateAverage(currentAverage, newValue, count) {
        if (count === 1) return newValue;
        return ((currentAverage * (count - 1)) + newValue) / count;
    }

    /**
     * Calculate user level based on history
     * @param {Object} history - User history
     * @returns {number} User level
     */
    calculateUserLevel(history) {
        return Math.max(1, Math.floor(history.totalPointsEarned / 500) + 1);
    }

    /**
     * Update overall metrics
     * @param {Object} processedFeedback - Processed feedback
     */
    updateMetrics(processedFeedback) {
        const contentId = processedFeedback.contentId;
        
        if (!this.feedbackMetrics.has(contentId)) {
            this.feedbackMetrics.set(contentId, {
                totalFeedback: 0,
                averageRating: 0,
                averageQuality: 0,
                sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
                categories: {},
                lastUpdated: new Date().toISOString()
            });
        }
        
        const metrics = this.feedbackMetrics.get(contentId);
        metrics.totalFeedback += 1;
        
        if (processedFeedback.rating) {
            metrics.averageRating = this.updateAverage(
                metrics.averageRating,
                processedFeedback.rating,
                metrics.totalFeedback
            );
        }
        
        metrics.averageQuality = this.updateAverage(
            metrics.averageQuality,
            processedFeedback.insights.qualityScore,
            metrics.totalFeedback
        );
        
        // Update sentiment distribution
        const sentiment = processedFeedback.insights.sentimentScore;
        if (sentiment > 0.1) metrics.sentimentDistribution.positive++;
        else if (sentiment < -0.1) metrics.sentimentDistribution.negative++;
        else metrics.sentimentDistribution.neutral++;
        
        metrics.lastUpdated = new Date().toISOString();
    }

    /**
     * Generate unique feedback ID
     * @returns {string} Unique feedback ID
     */
    generateFeedbackId() {
        return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }
}

module.exports = { UserFeedbackProcessor }; 