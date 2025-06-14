const express = require('express');
const multer = require('multer');
const path = require('path');
const GoogleCloudStorageService = require('../services/googleCloudStorage');
const SupabaseService = require('../services/supabaseService');

const router = express.Router();
const gcsService = new GoogleCloudStorageService();
const supabaseService = new SupabaseService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv', 'video/x-m4v'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  },
});

// ============ SINGLE VIDEO UPLOAD ============

/**
 * Upload a single video file
 * POST /api/upload/video
 */
router.post('/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // For MVP, we'll use a mock user ID
    // In production, this would come from JWT token
    const userId = req.body.userId || 'mock-user-id';
    
    const metadata = {
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
    };

    // Upload to Google Cloud Storage
    console.log('Uploading video to GCS...');
    const uploadResult = await gcsService.uploadVideo(req.file, metadata);

    // Create database record
    console.log('Creating database record...');
    const videoRecord = await supabaseService.createVideo({
      ...uploadResult,
      ...metadata,
    }, userId);

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: videoRecord.id,
        title: videoRecord.title,
        url: videoRecord.gcs_url,
        uploadResult,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
});

// ============ BATCH VIDEO UPLOAD ============

/**
 * Upload multiple video files
 * POST /api/upload/batch
 */
router.post('/batch', upload.array('videos', 100), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files provided' });
    }

    const userId = req.body.userId || 'mock-user-id';
    const sessionName = req.body.sessionName || `Batch Upload ${new Date().toISOString()}`;

    // Create upload session
    const uploadSession = await supabaseService.createUploadSession(
      userId,
      sessionName,
      req.files.length
    );

    console.log(`Starting batch upload of ${req.files.length} files...`);

    // Upload files to GCS
    const uploadResults = await gcsService.uploadVideoBatch(req.files, (progress) => {
      console.log(`Upload progress: ${progress.current}/${progress.total} - ${progress.fileName}`);
    });

    // Create database records for successful uploads
    const dbResults = await supabaseService.batchCreateVideos(uploadResults, userId);

    // Update upload session
    await supabaseService.updateUploadSession(uploadSession.id, {
      uploaded_files: dbResults.totalCreated,
      failed_files: dbResults.totalFailed,
      status: dbResults.totalFailed === 0 ? 'completed' : 'completed_with_errors',
      completed_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Batch upload completed',
      session: uploadSession,
      results: {
        totalFiles: req.files.length,
        successful: dbResults.totalCreated,
        failed: dbResults.totalFailed,
        uploadResults: uploadResults,
        dbResults: dbResults,
      },
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({
      error: 'Batch upload failed',
      message: error.message,
    });
  }
});

// ============ DIRECTORY UPLOAD ============

/**
 * Upload videos from a local directory (for development/testing)
 * POST /api/upload/directory
 */
router.post('/directory', async (req, res) => {
  try {
    const { directoryPath, userId = 'mock-user-id', sessionName } = req.body;

    if (!directoryPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }

    console.log(`Starting directory upload from: ${directoryPath}`);

    // Create upload session
    const uploadSession = await supabaseService.createUploadSession(
      userId,
      sessionName || `Directory Upload: ${path.basename(directoryPath)}`,
      0 // Will be updated after counting files
    );

    // Upload from directory
    const uploadResults = await gcsService.uploadFromDirectory(directoryPath, (progress) => {
      console.log(`Upload progress: ${progress.current}/${progress.total} - ${progress.fileName}`);
    });

    // Update session with actual file count
    await supabaseService.updateUploadSession(uploadSession.id, {
      total_files: uploadResults.totalUploaded + uploadResults.totalFailed,
    });

    // Create database records
    const dbResults = await supabaseService.batchCreateVideos(uploadResults, userId);

    // Final session update
    await supabaseService.updateUploadSession(uploadSession.id, {
      uploaded_files: dbResults.totalCreated,
      failed_files: dbResults.totalFailed,
      status: dbResults.totalFailed === 0 ? 'completed' : 'completed_with_errors',
      completed_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Directory upload completed',
      session: uploadSession,
      results: {
        totalFiles: uploadResults.totalUploaded + uploadResults.totalFailed,
        successful: dbResults.totalCreated,
        failed: dbResults.totalFailed,
        uploadResults: uploadResults,
        dbResults: dbResults,
      },
    });
  } catch (error) {
    console.error('Directory upload error:', error);
    res.status(500).json({
      error: 'Directory upload failed',
      message: error.message,
    });
  }
});

// ============ UPLOAD STATUS ============

/**
 * Get upload session status
 * GET /api/upload/session/:sessionId
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await supabaseService.supabase
      .from('upload_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (session.error) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    res.json({
      success: true,
      session: session.data,
    });
  } catch (error) {
    console.error('Error fetching upload session:', error);
    res.status(500).json({
      error: 'Failed to fetch upload session',
      message: error.message,
    });
  }
});

// ============ LIST VIDEOS ============

/**
 * Get uploaded videos
 * GET /api/upload/videos
 */
router.get('/videos', async (req, res) => {
  try {
    const { limit = 20, offset = 0, userId } = req.query;
    
    const videos = await supabaseService.getVideoFeed(userId, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      videos,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: videos.length,
      },
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      error: 'Failed to fetch videos',
      message: error.message,
    });
  }
});

// ============ VIDEO MANAGEMENT ============

/**
 * Update video metadata
 * PUT /api/upload/video/:videoId
 */
router.put('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const updates = req.body;
    
    const updatedVideo = await supabaseService.updateVideo(videoId, updates);
    
    res.json({
      success: true,
      message: 'Video updated successfully',
      video: updatedVideo,
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({
      error: 'Failed to update video',
      message: error.message,
    });
  }
});

/**
 * Delete video
 * DELETE /api/upload/video/:videoId
 */
router.delete('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Get video info first
    const video = await supabaseService.getVideo(videoId);
    
    // Soft delete in database
    await supabaseService.updateVideo(videoId, { is_active: false });
    
    // Optionally delete from GCS (commented out for safety)
    // const fileName = video.metadata?.gcsFileName;
    // if (fileName) {
    //   await gcsService.deleteVideo(fileName);
    // }
    
    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      error: 'Failed to delete video',
      message: error.message,
    });
  }
});

module.exports = router; 