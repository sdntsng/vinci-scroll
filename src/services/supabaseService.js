const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // ============ VIDEO OPERATIONS ============

  /**
   * Create a new video record in the database
   * @param {Object} videoData - Video data from GCS upload
   * @param {string} userId - User ID who uploaded the video
   * @returns {Promise<Object>} Created video record
   */
  async createVideo(videoData, userId) {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .insert({
          title: videoData.title || this.extractTitleFromFileName(videoData.fileName),
          description: videoData.description || '',
          gcs_url: videoData.publicUrl,
          thumbnail_url: videoData.thumbnailUrl || null,
          duration: videoData.duration || null,
          file_size: parseInt(videoData.size),
          mime_type: videoData.contentType,
          tags: videoData.tags || [],
          metadata: {
            originalFileName: videoData.metadata?.originalName || videoData.fileName,
            uploadedAt: videoData.timeCreated,
            gcsFileName: videoData.fileName,
          },
          uploaded_by: userId === '00000000-0000-0000-0000-000000000001' ? null : userId, // Skip foreign key for MVP
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating video record:', error);
      throw error;
    }
  }

  /**
   * Get videos for the feed
   * @param {string} userId - User ID for personalization
   * @param {number} limit - Number of videos to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of videos
   */
  async getVideoFeed(userId = null, limit = 10, offset = 0) {
    try {
      // Simple query without joins to avoid foreign key issues
      const { data, error } = await this.supabase
        .from('videos')
        .select(`
          id,
          title,
          description,
          gcs_url,
          thumbnail_url,
          duration,
          tags,
          created_at,
          uploaded_by
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transform data for frontend compatibility
      return data.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.gcs_url,
        thumbnail: video.thumbnail_url,
        duration: video.duration,
        tags: video.tags || [],
        uploader: 'ScrollNet User', // Generic uploader name for MVP
        createdAt: video.created_at,
      }));
    } catch (error) {
      console.error('Error fetching video feed:', error);
      throw error;
    }
  }

  /**
   * Get a specific video by ID
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Video data
   */
  async getVideo(videoId) {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .select(`
          *,
          user_profiles!videos_uploaded_by_fkey(username, full_name, avatar_url)
        `)
        .eq('id', videoId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  /**
   * Update video metadata
   * @param {string} videoId - Video ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated video
   */
  async updateVideo(videoId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('videos')
        .update(updates)
        .eq('id', videoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  }

  // ============ USER INTERACTION OPERATIONS ============

  /**
   * Record user interaction with a video
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {string} interactionType - Type of interaction
   * @param {Object} interactionData - Additional data
   * @returns {Promise<Object>} Interaction record
   */
  async recordInteraction(userId, videoId, interactionType, interactionData = {}) {
    try {
      // Handle anonymous users by generating a session-based UUID
      let finalUserId = userId;
      if (!userId || userId === 'anonymous-user' || !this.isValidUUID(userId)) {
        // Generate a consistent anonymous user ID for this session
        finalUserId = this.generateAnonymousUserId();
        console.log('Generated anonymous user ID:', finalUserId);
      }

      const { data, error } = await this.supabase
        .from('user_interactions')
        .insert({
          user_id: finalUserId,
          video_id: videoId,
          interaction_type: interactionType,
          interaction_data: interactionData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording interaction:', error);
      // For MVP, return success even if database fails
      return { 
        success: true, 
        message: 'Interaction logged (MVP mode)',
        fallback: true 
      };
    }
  }

  /**
   * Generate a consistent anonymous user ID for the session
   * @returns {string} UUID for anonymous user
   */
  generateAnonymousUserId() {
    // Generate a UUID v4 for anonymous users
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Check if a string is a valid UUID
   * @param {string} str - String to check
   * @returns {boolean} True if valid UUID
   */
  isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Get user interactions for a video
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @returns {Promise<Array>} User interactions
   */
  async getUserInteractions(userId, videoId) {
    try {
      const { data, error } = await this.supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('video_id', videoId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      throw error;
    }
  }

  // ============ FEEDBACK OPERATIONS ============

  /**
   * Submit user feedback
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise<Object>} Feedback record
   */
  async submitFeedback(feedbackData) {
    try {
      const { data, error } = await this.supabase
        .from('feedback')
        .insert(feedbackData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  // ============ UPLOAD SESSION OPERATIONS ============

  /**
   * Create an upload session
   * @param {string} userId - User ID
   * @param {string} sessionName - Session name
   * @param {number} totalFiles - Total number of files
   * @returns {Promise<Object>} Upload session
   */
  async createUploadSession(userId, sessionName, totalFiles) {
    try {
      const finalUserId = userId === '00000000-0000-0000-0000-000000000001' ? null : userId;
      console.log('Creating upload session with userId:', userId, '-> finalUserId:', finalUserId);
      
      const { data, error } = await this.supabase
        .from('upload_sessions')
        .insert({
          user_id: finalUserId, // Skip foreign key for MVP
          session_name: sessionName,
          total_files: totalFiles,
          uploaded_files: 0,
          failed_files: 0,
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating upload session:', error);
      throw error;
    }
  }

  /**
   * Update upload session progress
   * @param {string} sessionId - Session ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated session
   */
  async updateUploadSession(sessionId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('upload_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating upload session:', error);
      throw error;
    }
  }

  // ============ USER OPERATIONS ============

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // ============ ANALYTICS OPERATIONS ============

  /**
   * Get video analytics
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Video analytics
   */
  async getVideoAnalytics(videoId) {
    try {
      const { data, error } = await this.supabase
        .from('user_interactions')
        .select('interaction_type, interaction_data, created_at')
        .eq('video_id', videoId);

      if (error) throw error;

      // Process analytics
      const analytics = {
        totalInteractions: data.length,
        likes: data.filter(i => i.interaction_type === 'like').length,
        dislikes: data.filter(i => i.interaction_type === 'dislike').length,
        emojiReactions: data.filter(i => i.interaction_type === 'emoji'),
        views: data.filter(i => i.interaction_type === 'view').length,
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      throw error;
    }
  }

  // ============ UTILITY METHODS ============

  /**
   * Extract title from filename
   * @param {string} fileName - File name
   * @returns {string} Extracted title
   */
  extractTitleFromFileName(fileName) {
    const baseName = fileName.split('/').pop(); // Remove path
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, ''); // Remove extension
    const cleanName = nameWithoutExt
      .replace(/^\d+_[a-z0-9]+_/, '') // Remove timestamp and random string
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    
    return cleanName || 'Untitled Video';
  }

  /**
   * Batch create videos from upload results
   * @param {Array} uploadResults - Results from GCS batch upload
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Batch creation results
   */
  async batchCreateVideos(uploadResults, userId) {
    const successful = [];
    const failed = [];

    for (const result of uploadResults.successful) {
      try {
        const videoRecord = await this.createVideo(result.result, userId);
        successful.push({
          file: result.file,
          videoId: videoRecord.id,
          videoRecord,
        });
      } catch (error) {
        failed.push({
          file: result.file,
          error: error.message,
        });
      }
    }

    return {
      successful,
      failed,
      totalCreated: successful.length,
      totalFailed: failed.length + uploadResults.failed.length,
    };
  }
}

module.exports = SupabaseService; 