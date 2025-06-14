require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create a test user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        username: 'test_user',
        full_name: 'Test User'
      })
      .select();
    
    if (error) {
      if (error.code === '23505') {
        console.log('✅ Test user already exists');
      } else {
        console.log('❌ Error creating user:', error.message);
      }
    } else {
      console.log('✅ Test user created successfully:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser(); 