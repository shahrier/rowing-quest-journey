-- This SQL script sets up the database schema for the Rowing Quest Journey app
-- Run this in your Supabase SQL editor to create all required tables

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create enums
CREATE TYPE app_role AS ENUM ('admin', 'user', 'team_manager');
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE activity_type AS ENUM ('rowing', 'strength');
CREATE TYPE media_type AS ENUM ('photo', 'video');

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  goal_distance NUMERIC,
  current_distance NUMERIC DEFAULT 0,
  
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role app_role DEFAULT 'user'::app_role,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  distance NUMERIC,
  duration INTEGER, -- in seconds
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value NUMERIC NOT NULL,
  tier badge_tier NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create journey_checkpoints table
CREATE TABLE IF NOT EXISTS journey_checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  distance_from_start NUMERIC NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  is_reached BOOLEAN DEFAULT FALSE,
  reached_at TIMESTAMP WITH TIME ZONE
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type media_type NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create functions
CREATE OR REPLACE FUNCTION update_team_distance(team_id UUID, distance_to_add NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE teams
  SET 
    current_distance = current_distance + distance_to_add,
    updated_at = NOW()
  WHERE id = team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role app_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_role app_role;
BEGIN
  SELECT p.role INTO user_role
  FROM profiles p
  WHERE p.user_id = has_role.user_id;
  
  RETURN user_role = role;
END;
$$ LANGUAGE plpgsql;

-- Function to check badge requirements
CREATE OR REPLACE FUNCTION check_badge_requirements()
RETURNS TRIGGER AS $$
DECLARE
  badge_record RECORD;
  user_total NUMERIC;
BEGIN
  -- Only proceed for rowing activities with distance
  IF NEW.activity_type = 'rowing' AND NEW.distance IS NOT NULL THEN
    -- Get all badges for this team that are distance-based
    FOR badge_record IN 
      SELECT b.id, b.requirement_type, b.requirement_value
      FROM badges b
      WHERE b.team_id = NEW.team_id AND b.requirement_type = 'distance'
    LOOP
      -- Calculate user's total distance
      SELECT COALESCE(SUM(distance), 0) INTO user_total
      FROM activities
      WHERE user_id = NEW.user_id AND team_id = NEW.team_id AND activity_type = 'rowing';
      
      -- Check if user meets the badge requirement
      IF user_total >= badge_record.requirement_value THEN
        -- Check if user already has this badge
        IF NOT EXISTS (
          SELECT 1 FROM user_badges
          WHERE user_id = NEW.user_id AND badge_id = badge_record.id
        ) THEN
          -- Award the badge
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (NEW.user_id, badge_record.id);
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for badge checking
CREATE TRIGGER check_badges_after_activity
AFTER INSERT OR UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION check_badge_requirements();

-- Create trigger for updating team distance
CREATE OR REPLACE FUNCTION update_team_distance_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.activity_type = 'rowing' AND NEW.distance IS NOT NULL THEN
    PERFORM update_team_distance(NEW.team_id, NEW.distance);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_distance_trigger
AFTER INSERT ON activities
FOR EACH ROW
EXECUTE FUNCTION update_team_distance_on_activity();

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Teams policies
CREATE POLICY "Teams are viewable by everyone" 
ON teams FOR SELECT USING (true);

CREATE POLICY "Team creators can update their teams" 
ON teams FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can create teams" 
ON teams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Activities policies
CREATE POLICY "Activities are viewable by team members" 
ON activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND team_id = activities.team_id)
);

CREATE POLICY "Users can create their own activities" 
ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
ON activities FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to check database connection
CREATE OR REPLACE FUNCTION check_connection()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'connected', true,
    'timestamp', now(),
    'database', current_database(),
    'version', version()
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to get database stats
CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profiles_count', (SELECT COUNT(*) FROM profiles),
    'teams_count', (SELECT COUNT(*) FROM teams),
    'activities_count', (SELECT COUNT(*) FROM activities),
    'badges_count', (SELECT COUNT(*) FROM badges),
    'checkpoints_count', (SELECT COUNT(*) FROM journey_checkpoints),
    'media_count', (SELECT COUNT(*) FROM media)
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;