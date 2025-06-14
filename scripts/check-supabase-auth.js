#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.local' });

async function checkSupabaseAuth() {
  console.log('🔍 Checking Supabase authentication configuration...');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase configuration in environment variables');
      console.log('Required variables:');
      console.log('- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
      console.log('- SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }
    
    console.log(`📡 Supabase URL: ${supabaseUrl}`);
    console.log(`🔑 Using anon key: ${supabaseKey.substring(0, 20)}...`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    console.log('\n🧪 Testing basic connection...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('⚠️  Auth session error:', error.message);
      } else {
        console.log('✅ Basic auth connection successful');
      }
    } catch (error) {
      console.error('❌ Basic connection failed:', error.message);
    }
    
    // Test email/password signup (this will help us understand if basic auth works)
    console.log('\n🧪 Testing email/password authentication...');
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'testpassword123';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          console.log('✅ Email/password auth is working (user already exists)');
        } else {
          console.warn('⚠️  Email/password auth error:', error.message);
        }
      } else {
        console.log('✅ Email/password auth is working');
        // Clean up test user if created
        if (data.user) {
          console.log('🧹 Test user created, you may want to delete it from Supabase dashboard');
        }
      }
    } catch (error) {
      console.error('❌ Email/password auth test failed:', error.message);
    }
    
    // Test OAuth providers
    console.log('\n🧪 Testing OAuth providers...');
    
    const providers = ['google', 'github', 'facebook', 'twitter'];
    
    for (const provider of providers) {
      try {
        // This will fail if the provider is not configured, but won't actually redirect
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: 'http://localhost:3004/auth/callback',
            skipBrowserRedirect: true, // Prevent actual redirect during testing
          },
        });
        
        if (error) {
          if (error.message.includes('provider is not enabled')) {
            console.log(`❌ ${provider.toUpperCase()} OAuth: Not enabled`);
          } else {
            console.log(`⚠️  ${provider.toUpperCase()} OAuth: ${error.message}`);
          }
        } else {
          console.log(`✅ ${provider.toUpperCase()} OAuth: Configured`);
        }
      } catch (error) {
        console.log(`❌ ${provider.toUpperCase()} OAuth: ${error.message}`);
      }
    }
    
    console.log('\n📋 Configuration Instructions:');
    console.log('To enable OAuth providers in Supabase:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Authentication > Providers');
    console.log('4. Enable the providers you want to use');
    console.log('5. Configure OAuth credentials for each provider:');
    console.log('   - Google: Get credentials from Google Cloud Console');
    console.log('   - GitHub: Get credentials from GitHub Developer Settings');
    console.log('   - Facebook: Get credentials from Facebook Developers');
    console.log('   - Twitter: Get credentials from Twitter Developer Portal');
    
    console.log('\n🔧 For Google OAuth specifically:');
    console.log('1. Go to Google Cloud Console > APIs & Services > Credentials');
    console.log('2. Create OAuth 2.0 Client ID');
    console.log('3. Add authorized redirect URIs:');
    console.log(`   - ${supabaseUrl}/auth/v1/callback`);
    console.log('4. Copy Client ID and Client Secret to Supabase');
    
    console.log('\n✅ Supabase authentication check completed!');
    
  } catch (error) {
    console.error('❌ Error checking Supabase auth:', error);
  }
}

if (require.main === module) {
  checkSupabaseAuth();
}

module.exports = { checkSupabaseAuth }; 