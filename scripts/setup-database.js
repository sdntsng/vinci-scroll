#!/usr/bin/env node

/**
 * Database Setup Script for ScrollNet
 * This script sets up the required tables in Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🗄️  Setting up ScrollNet Database...\n');

  // Initialize Supabase client with service role key
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`${i + 1}. Executing: ${statement.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          console.log(`   ⚠️  Warning: ${error.message}`);
        } else {
          console.log(`   ✅ Success`);
        }
      } catch (err) {
        console.log(`   ⚠️  Error: ${err.message}`);
      }
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your server: npm run dev');
    console.log('2. Test video upload with curl commands');
    console.log('3. Check your Supabase dashboard for the new tables');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase }; 