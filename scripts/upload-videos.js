#!/usr/bin/env node

/**
 * Video Upload Script for ScrollNet
 * 
 * This script helps you upload your local videos to Google Cloud Storage
 * and create corresponding records in Supabase.
 * 
 * Usage:
 *   node scripts/upload-videos.js /path/to/your/videos
 * 
 * Prerequisites:
 *   1. Set up your .env file with GCS and Supabase credentials
 *   2. Ensure your GCS service account key is in place
 *   3. Run the Supabase schema setup
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Check if we're running this script directly
if (require.main === module) {
  main().catch(console.error);
}

async function main() {
  console.log('🎬 ScrollNet Video Upload Script');
  console.log('================================\n');

  // Check command line arguments
  const videoDirectory = process.argv[2];
  
  if (!videoDirectory) {
    console.error('❌ Error: Please provide a directory path');
    console.log('\nUsage:');
    console.log('  node scripts/upload-videos.js /path/to/your/videos');
    console.log('\nExample:');
    console.log('  node scripts/upload-videos.js ~/Downloads/my-videos');
    process.exit(1);
  }

  // Check if directory exists
  if (!fs.existsSync(videoDirectory)) {
    console.error(`❌ Error: Directory "${videoDirectory}" does not exist`);
    process.exit(1);
  }

  // Check environment variables
  const requiredEnvVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_STORAGE_BUCKET',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Error: Missing required environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    console.log('\nPlease set these in your .env file');
    process.exit(1);
  }

  // Check if service account key file exists
  if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    console.error(`❌ Error: Google Cloud service account key file not found:`);
    console.error(`  ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
    console.log('\nPlease ensure your service account key file is in the correct location');
    process.exit(1);
  }

  console.log('✅ Environment check passed');
  console.log(`📁 Video directory: ${videoDirectory}`);
  console.log(`☁️  GCS Bucket: ${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}`);
  console.log(`🗄️  Supabase URL: ${process.env.SUPABASE_URL}\n`);

  // Count video files
  const files = fs.readdirSync(videoDirectory);
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
  const videoFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return videoExtensions.includes(ext);
  });

  if (videoFiles.length === 0) {
    console.error('❌ No video files found in the directory');
    console.log('Supported formats: .mp4, .avi, .mov, .wmv, .flv, .webm, .mkv, .m4v');
    process.exit(1);
  }

  console.log(`🎥 Found ${videoFiles.length} video files:`);
  videoFiles.slice(0, 5).forEach(file => console.log(`  - ${file}`));
  if (videoFiles.length > 5) {
    console.log(`  ... and ${videoFiles.length - 5} more`);
  }
  console.log();

  // Confirm upload
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    readline.question(`Do you want to upload ${videoFiles.length} videos? (y/N): `, resolve);
  });
  
  readline.close();

  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('Upload cancelled');
    process.exit(0);
  }

  // Start upload process
  console.log('\n🚀 Starting upload process...\n');

  try {
    const response = await fetch('http://localhost:3001/api/upload/directory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        directoryPath: path.resolve(videoDirectory),
        userId: 'upload-script-user',
        sessionName: `Bulk Upload - ${new Date().toISOString()}`
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Upload completed successfully!');
      console.log('\n📊 Results:');
      console.log(`  Total files: ${result.results.totalFiles}`);
      console.log(`  Successful: ${result.results.successful}`);
      console.log(`  Failed: ${result.results.failed}`);
      
      if (result.results.failed > 0) {
        console.log('\n❌ Failed uploads:');
        result.results.dbResults.failed.forEach(failure => {
          console.log(`  - ${failure.file}: ${failure.error}`);
        });
      }

      console.log(`\n🎉 Your videos are now available in ScrollNet!`);
      console.log(`📱 Open the app to see them in the swipe feed`);
    } else {
      console.error('❌ Upload failed:', result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the ScrollNet server is running (npm run dev)');
    console.log('2. Check your internet connection');
    console.log('3. Verify your GCS and Supabase credentials');
    process.exit(1);
  }
}

module.exports = { main }; 