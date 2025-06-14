#!/usr/bin/env node

const { Storage } = require('@google-cloud/storage');
require('dotenv').config({ path: './env.local' });

async function fixGCSPermissions() {
  console.log('🔧 Fixing Google Cloud Storage permissions...');
  
  try {
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './gcs-service-account.json',
    });
    
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    const bucket = storage.bucket(bucketName);
    
    console.log(`📦 Working with bucket: ${bucketName}`);
    
    // Check if bucket exists
    const [exists] = await bucket.exists();
    if (!exists) {
      console.error(`❌ Bucket ${bucketName} does not exist`);
      return;
    }
    
    // Get current bucket metadata
    const [metadata] = await bucket.getMetadata();
    console.log('📋 Current bucket configuration:');
    console.log('- Uniform bucket-level access:', metadata.iamConfiguration?.uniformBucketLevelAccess?.enabled);
    console.log('- Public access prevention:', metadata.iamConfiguration?.publicAccessPrevention);
    
    // Method 1: Try to set bucket-level public access (if uniform access is enabled)
    if (metadata.iamConfiguration?.uniformBucketLevelAccess?.enabled) {
      console.log('🔄 Uniform bucket-level access is enabled, setting bucket-level permissions...');
      
      try {
        await bucket.iam.setPolicy({
          bindings: [
            {
              role: 'roles/storage.objectViewer',
              members: ['allUsers'],
            },
          ],
        });
        console.log('✅ Bucket-level public read access granted');
      } catch (error) {
        console.warn('⚠️  Could not set bucket-level permissions:', error.message);
        
        // Check if public access prevention is blocking this
        if (error.message.includes('public access prevention')) {
          console.log('🔧 Attempting to disable public access prevention...');
          try {
            await bucket.setMetadata({
              iamConfiguration: {
                publicAccessPrevention: 'inherited'
              }
            });
            console.log('✅ Public access prevention disabled');
            
            // Retry setting permissions
            await bucket.iam.setPolicy({
              bindings: [
                {
                  role: 'roles/storage.objectViewer',
                  members: ['allUsers'],
                },
              ],
            });
            console.log('✅ Bucket-level public read access granted after fixing prevention');
          } catch (preventionError) {
            console.error('❌ Could not disable public access prevention:', preventionError.message);
          }
        }
      }
    } else {
      console.log('🔄 Fine-grained access control is enabled, will set per-object permissions');
    }
    
    // Method 2: Make existing video files public
    console.log('🔄 Making existing video files public...');
    const [files] = await bucket.getFiles({ prefix: 'videos/' });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        if (metadata.iamConfiguration?.uniformBucketLevelAccess?.enabled) {
          // Skip individual file permissions if uniform access is enabled
          console.log(`⏭️  Skipping ${file.name} (uniform access handles this)`);
          continue;
        }
        
        await file.makePublic();
        console.log(`✅ Made public: ${file.name}`);
        successCount++;
      } catch (error) {
        console.warn(`⚠️  Could not make public: ${file.name} - ${error.message}`);
        
        // Try ACL method as fallback
        try {
          await file.acl.add({
            entity: 'allUsers',
            role: 'READER'
          });
          console.log(`✅ Made public via ACL: ${file.name}`);
          successCount++;
        } catch (aclError) {
          console.error(`❌ Failed to make public: ${file.name} - ${aclError.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`- Files processed: ${files.length}`);
    console.log(`- Successfully made public: ${successCount}`);
    console.log(`- Errors: ${errorCount}`);
    
    // Test access to a sample file
    if (files.length > 0) {
      const testFile = files[0];
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${testFile.name}`;
      console.log(`\n🧪 Test URL: ${publicUrl}`);
      console.log('Try accessing this URL in your browser to verify public access');
    }
    
    console.log('\n✅ Google Cloud Storage permissions fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing GCS permissions:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  fixGCSPermissions();
}

module.exports = { fixGCSPermissions }; 