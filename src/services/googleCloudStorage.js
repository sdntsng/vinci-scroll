const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

class GoogleCloudStorageService {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    this.bucket = this.storage.bucket(this.bucketName);
  }

  /**
   * Upload a single video file to Google Cloud Storage
   * @param {Object} file - Multer file object
   * @param {Object} metadata - Additional metadata for the video
   * @returns {Promise<Object>} Upload result with public URL
   */
  async uploadVideo(file, metadata = {}) {
    try {
      const fileName = this.generateFileName(file.originalname);
      const fileUpload = this.bucket.file(fileName);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            ...metadata,
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        },
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Upload error:', error);
          reject(error);
        });

        stream.on('finish', async () => {
          try {
            // Always try to make the file publicly readable
            try {
              await fileUpload.makePublic();
              console.log(`File ${fileName} made public successfully`);
            } catch (error) {
              console.warn('Could not make file public via makePublic():', error.message);
              
              // Try alternative method: set ACL directly
              try {
                await fileUpload.acl.add({
                  entity: 'allUsers',
                  role: 'READER'
                });
                console.log(`File ${fileName} made public via ACL`);
              } catch (aclError) {
                console.warn('Could not set public ACL:', aclError.message);
                console.log('File may still be accessible if bucket has uniform access enabled');
              }
            }
            
            const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
            
            // Get file metadata
            const [fileMetadata] = await fileUpload.getMetadata();
            
            resolve({
              fileName,
              publicUrl,
              size: fileMetadata.size,
              contentType: fileMetadata.contentType,
              timeCreated: fileMetadata.timeCreated,
              metadata: fileMetadata.metadata,
            });
          } catch (error) {
            reject(error);
          }
        });

        // Upload the file
        if (file.buffer) {
          stream.end(file.buffer);
        } else if (file.path) {
          fs.createReadStream(file.path).pipe(stream);
        } else {
          reject(new Error('No file buffer or path provided'));
        }
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  /**
   * Upload multiple videos in batch
   * @param {Array} files - Array of file objects
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadVideoBatch(files, progressCallback = null) {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadVideo(files[i]);
        results.push({
          success: true,
          file: files[i].originalname,
          result,
        });

        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total: files.length,
            fileName: files[i].originalname,
            status: 'completed',
          });
        }
      } catch (error) {
        errors.push({
          success: false,
          file: files[i].originalname,
          error: error.message,
        });

        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total: files.length,
            fileName: files[i].originalname,
            status: 'failed',
            error: error.message,
          });
        }
      }
    }

    return {
      successful: results,
      failed: errors,
      totalUploaded: results.length,
      totalFailed: errors.length,
    };
  }

  /**
   * Upload videos from local directory
   * @param {string} directoryPath - Path to directory containing videos
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<Object>} Upload results
   */
  async uploadFromDirectory(directoryPath, progressCallback = null) {
    try {
      const files = fs.readdirSync(directoryPath);
      const videoFiles = files.filter(file => 
        this.isVideoFile(file)
      );

      const fileObjects = videoFiles.map(fileName => {
        const filePath = path.join(directoryPath, fileName);
        const stats = fs.statSync(filePath);
        
        return {
          originalname: fileName,
          path: filePath,
          size: stats.size,
          mimetype: this.getMimeType(fileName),
        };
      });

      console.log(`Found ${fileObjects.length} video files in directory`);
      
      return await this.uploadVideoBatch(fileObjects, progressCallback);
    } catch (error) {
      console.error('Error uploading from directory:', error);
      throw error;
    }
  }

  /**
   * Generate a unique filename for storage
   * @param {string} originalName - Original filename
   * @returns {string} Generated filename
   */
  generateFileName(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    
    return `videos/${timestamp}_${randomString}_${baseName}${extension}`;
  }

  /**
   * Check if file is a video
   * @param {string} fileName - File name
   * @returns {boolean} Is video file
   */
  isVideoFile(fileName) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
    const extension = path.extname(fileName).toLowerCase();
    return videoExtensions.includes(extension);
  }

  /**
   * Get MIME type for file
   * @param {string} fileName - File name
   * @returns {string} MIME type
   */
  getMimeType(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
      '.m4v': 'video/x-m4v',
    };
    
    return mimeTypes[extension] || 'video/mp4';
  }

  /**
   * Delete a video from storage
   * @param {string} fileName - File name to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteVideo(fileName) {
    try {
      await this.bucket.file(fileName).delete();
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  }

  /**
   * Get signed URL for private video access
   * @param {string} fileName - File name
   * @param {number} expiresIn - Expiration time in minutes
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(fileName, expiresIn = 60) {
    try {
      const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 60 * 1000,
      };

      const [url] = await this.bucket.file(fileName).getSignedUrl(options);
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * List all videos in the bucket
   * @param {string} prefix - Prefix to filter files
   * @returns {Promise<Array>} List of video files
   */
  async listVideos(prefix = 'videos/') {
    try {
      const [files] = await this.bucket.getFiles({ prefix });
      
      return files
        .filter(file => this.isVideoFile(file.name))
        .map(file => ({
          name: file.name,
          publicUrl: `https://storage.googleapis.com/${this.bucketName}/${file.name}`,
          metadata: file.metadata,
        }));
    } catch (error) {
      console.error('Error listing videos:', error);
      throw error;
    }
  }
}

module.exports = GoogleCloudStorageService; 