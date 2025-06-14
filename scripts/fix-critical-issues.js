#!/usr/bin/env node

const { fixGCSPermissions } = require('./fix-gcs-permissions');
const { checkSupabaseAuth } = require('./check-supabase-auth');

async function fixCriticalIssues() {
  console.log('🚨 ScrollNet Critical Issues Fix');
  console.log('================================\n');
  
  console.log('Issue #1: Google Cloud Storage Access Denied');
  console.log('Issue #2: Supabase OAuth Provider Not Enabled\n');
  
  // Fix Issue #1: Google Cloud Storage permissions
  console.log('🔧 FIXING ISSUE #1: Google Cloud Storage Access...\n');
  try {
    await fixGCSPermissions();
    console.log('\n✅ Issue #1 fix completed!\n');
  } catch (error) {
    console.error('❌ Issue #1 fix failed:', error.message);
    console.log('Manual steps required for Google Cloud Storage:');
    console.log('1. Go to Google Cloud Console > Storage');
    console.log('2. Select your bucket: vinci-scroll-stream');
    console.log('3. Go to Permissions tab');
    console.log('4. Add principal: allUsers');
    console.log('5. Assign role: Storage Object Viewer');
    console.log('6. Save changes\n');
  }
  
  // Check Issue #2: Supabase OAuth configuration
  console.log('🔍 CHECKING ISSUE #2: Supabase OAuth Configuration...\n');
  try {
    await checkSupabaseAuth();
    console.log('\n✅ Issue #2 check completed!\n');
  } catch (error) {
    console.error('❌ Issue #2 check failed:', error.message);
  }
  
  console.log('📋 NEXT STEPS:');
  console.log('==============');
  console.log('1. For Google Cloud Storage:');
  console.log('   - If the script succeeded, test video playback');
  console.log('   - If it failed, follow the manual steps above');
  console.log('');
  console.log('2. For Supabase OAuth:');
  console.log('   - Go to https://supabase.com/dashboard');
  console.log('   - Select your project');
  console.log('   - Go to Authentication > Providers');
  console.log('   - Enable Google OAuth provider');
  console.log('   - Configure with Google OAuth credentials');
  console.log('');
  console.log('3. Test the application:');
  console.log('   - npm run dev:backend');
  console.log('   - cd frontend && npm run dev');
  console.log('   - Visit http://localhost:3004');
  console.log('');
  console.log('🎯 Once both issues are fixed, the app should work perfectly!');
}

if (require.main === module) {
  fixCriticalIssues();
}

module.exports = { fixCriticalIssues }; 