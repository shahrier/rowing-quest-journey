/**
 * Database verification script
 * 
 * This script checks if the database is properly set up according to the schema
 * and reports any issues that need to be addressed.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';
import dotenv from 'dotenv';
import { exit } from 'process';

// Load environment variables
dotenv.config();

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  exit(1);
}

// Create Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Required tables
const requiredTables = [
  'teams',
  'profiles',
  'activities',
  'badges',
  'user_badges',
  'journey_checkpoints',
  'media'
];

// Required functions
const requiredFunctions = [
  'check_connection',
  'get_db_stats',
  'has_role',
  'update_team_distance',
  'check_badge_requirements'
];

// Required enums
const requiredEnums = [
  'app_role',
  'badge_tier',
  'activity_type',
  'media_type'
];

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...');
  
  try {
    // Check connection
    console.log('\\n📡 Checking database connection...');
    const { data: connectionData, error: connectionError } = await supabase.rpc('check_connection');
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return false;
    }
    
    console.log('✅ Database connection successful:', connectionData);
    
    // Check tables
    console.log('\\n📋 Checking required tables...');
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Failed to fetch tables:', tablesError.message);
      return false;
    }
    
    const existingTables = tablesData?.map(t => t.table_name) || [];
    console.log('📊 Existing tables:', existingTables);
    
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.error('❌ Missing required tables:', missingTables);
    } else {
      console.log('✅ All required tables exist');
    }
    
    // Check functions - using a different approach to avoid type casting issues
    console.log('\\n🔧 Checking required functions...');
    const { data: functionsData, error: functionsError } = await supabase
      .from('pg_catalog.pg_proc')
      .select('proname')
      .contains('pronamespace', { schema: 'public' });
    
    if (functionsError) {
      console.error('❌ Failed to fetch functions:', functionsError.message);
      return false;
    }
    
    const existingFunctions = functionsData?.map(f => f.proname) || [];
    console.log('📊 Existing functions:', existingFunctions);
    
    const missingFunctions = requiredFunctions.filter(f => !existingFunctions.includes(f));
    
    if (missingFunctions.length > 0) {
      console.error('❌ Missing required functions:', missingFunctions);
    } else {
      console.log('✅ All required functions exist');
    }
    
    // Check enums - using a safer approach
    console.log('\\n🔤 Checking required enums...');
    const { data: enumsData, error: enumsError } = await supabase
      .from('pg_catalog.pg_type')
      .select('typname')
      .eq('typtype', 'e');
    
    if (enumsError) {
      console.error('❌ Failed to fetch enums:', enumsError.message);
      return false;
    }
    
    const existingEnums = enumsData?.map(e => e.typname) || [];
    console.log('📊 Existing enums:', existingEnums);
    
    const missingEnums = requiredEnums.filter(e => !existingEnums.includes(e));
    
    if (missingEnums.length > 0) {
      console.error('❌ Missing required enums:', missingEnums);
    } else {
      console.log('✅ All required enums exist');
    }
    
    // Get database stats
    console.log('\\n📊 Fetching database statistics...');
    const { data: statsData, error: statsError } = await supabase.rpc('get_db_stats');
    
    if (statsError) {
      console.error('❌ Failed to fetch database stats:', statsError.message);
    } else {
      console.log('📊 Database statistics:', statsData);
    }
    
    // Summary
    console.log('\\n📝 Verification Summary:');
    console.log(`- Tables: ${missingTables.length === 0 ? '✅ All present' : `❌ Missing ${missingTables.length}`}`);
    console.log(`- Functions: ${missingFunctions.length === 0 ? '✅ All present' : `❌ Missing ${missingFunctions.length}`}`);
    console.log(`- Enums: ${missingEnums.length === 0 ? '✅ All present' : `❌ Missing ${missingEnums.length}`}`);
    
    if (missingTables.length === 0 && missingFunctions.length === 0 && missingEnums.length === 0) {
      console.log('\\n✅ Database setup is complete and valid!');
      return true;
    } else {
      console.log('\\n⚠️ Database setup is incomplete. Please run the setup script.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during verification:', error);
    return false;
  }
}

// Run the verification
verifyDatabase().then(success => {
  if (!success) {
    console.log('\\n📝 To fix issues, run the SQL setup script in database/setup.sql');
    exit(1);
  }
  exit(0);
});