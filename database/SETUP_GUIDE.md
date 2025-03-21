# Database Setup Guide for Rowing Quest Journey

This guide provides step-by-step instructions for setting up the database for the Rowing Quest Journey application.

## Prerequisites

- A Supabase account
- Access to the Supabase dashboard
- Admin privileges for your Supabase project

## Step 1: Create a New Supabase Project

1. Log in to your Supabase account at [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter a name for your project (e.g., "rowing-quest-journey")
4. Choose a database password (save this securely)
5. Select a region closest to your users
6. Click "Create new project"

## Step 2: Get Your API Credentials

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on "Settings" (gear icon)
3. Click on "API" in the settings menu
4. You'll find your API URL and anon/public key here
5. Copy these values for use in your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 3: Run the Database Setup Script

1. In the Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the `database/setup.sql` file from this project
4. Copy the entire contents of the file
5. Paste the SQL into the Supabase SQL editor
6. Click "Run" to execute the script

The script will:
- Create all necessary tables (teams, profiles, activities, etc.)
- Set up enums for roles, badge tiers, etc.
- Create functions for updating team distance and checking badge requirements
- Set up triggers for automatic updates
- Configure Row Level Security policies

## Step 4: Verify the Database Setup

Run the verification script to ensure everything is set up correctly:

```bash
# First, set your environment variables
export VITE_SUPABASE_URL=your_supabase_url
export VITE_SUPABASE_ANON_KEY=your_anon_key

# Run the verification script
npx tsx scripts/verifyDatabaseSetup.ts
```

The script will check that all required tables, functions, and enums exist in your database.

## Step 5: Set Up Authentication

1. In the Supabase dashboard, go to "Authentication" in the left sidebar
2. Under "Providers", enable Email provider
3. Configure any additional providers you want (Google, GitHub, etc.)
4. Optionally, customize email templates under "Email Templates"

## Step 6: Set Up the Admin User

After a user has registered through your application, you can make them an admin:

```bash
# Set environment variables
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Found in API settings
export ADMIN_EMAIL=the_user_email_to_make_admin

# Run the admin setup script
npx tsx src/scripts/setupAdmin.ts
```

## Database Schema Overview

### Tables

- **teams**: Rowing teams competing in the challenge
- **profiles**: User profiles with roles and team membership
- **activities**: Rowing sessions logged by users
- **badges**: Achievements that can be earned
- **user_badges**: Tracks which users have earned which badges
- **journey_checkpoints**: Notable locations along the virtual route
- **media**: Photos and videos shared by team members

### Enums

- **app_role**: User roles (admin, user, team_manager)
- **badge_tier**: Badge levels (bronze, silver, gold)
- **activity_type**: Types of activities (rowing, strength)
- **media_type**: Types of media (photo, video)

### Functions

- **update_team_distance**: Updates a team's total distance
- **check_badge_requirements**: Checks if a user qualifies for badges
- **has_role**: Checks if a user has a specific role
- **check_connection**: Verifies database connectivity
- **get_db_stats**: Returns statistics about the database

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**:
   - The setup script may not have run completely
   - Run the verification script to check what's missing
   - Re-run the setup script or manually create the missing tables

2. **Permission denied errors**:
   - Check that Row Level Security policies are set up correctly
   - Verify the user has the appropriate role

3. **Function not found errors**:
   - Some functions may not have been created
   - Run the verification script to check what's missing
   - Re-run the setup script or manually create the missing functions

### Getting Help

If you encounter issues with the database setup:

1. Check the Supabase logs in the dashboard
2. Run the verification script for detailed diagnostics
3. Use the application's built-in debug panel (add `?debug=true` to the URL)