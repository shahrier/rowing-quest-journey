BEGIN;

-- Create enum for badge tiers if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_tier') THEN
        CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold');
    END IF;
END $$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS journey_checkpoints CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Create tables
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    description TEXT,
    goal_distance BIGINT,
    current_distance BIGINT DEFAULT 0
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('user', 'team_manager', 'admin')) DEFAULT 'user',
    team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE journey_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    distance_from_start BIGINT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    is_reached BOOLEAN DEFAULT FALSE,
    reached_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    team_id UUID REFERENCES teams(id) NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('rowing', 'strength')) NOT NULL,
    distance INTEGER,
    duration INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    tier badge_tier NOT NULL,
    team_id UUID REFERENCES teams(id),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    badge_id UUID REFERENCES badges(id) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    team_id UUID REFERENCES teams(id) NOT NULL,
    url TEXT NOT NULL,
    type TEXT CHECK (type IN ('photo', 'video')) NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_checkpoints ENABLE ROW LEVEL SECURITY;

-- Create functions
CREATE OR REPLACE FUNCTION check_badge_requirements()
RETURNS TRIGGER AS $$
BEGIN
    -- Check rowing distance badges
    INSERT INTO user_badges (user_id, badge_id)
    SELECT 
        NEW.user_id,
        b.id
    FROM badges b
    LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = NEW.user_id
    WHERE b.requirement_type = 'rowing_distance'
    AND (
        SELECT COALESCE(SUM(distance), 0)
        FROM activities
        WHERE user_id = NEW.user_id
        AND activity_type = 'rowing'
    ) >= b.requirement_value
    AND ub.user_id IS NULL;

    -- Check strength session badges
    INSERT INTO user_badges (user_id, badge_id)
    SELECT 
        NEW.user_id,
        b.id
    FROM badges b
    LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = NEW.user_id
    WHERE b.requirement_type = 'strength_sessions'
    AND (
        SELECT COUNT(*)
        FROM activities
        WHERE user_id = NEW.user_id
        AND activity_type = 'strength'
    ) >= b.requirement_value
    AND ub.user_id IS NULL;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_badges_after_activity ON activities;
CREATE TRIGGER check_badges_after_activity
    AFTER INSERT ON activities
    FOR EACH ROW
    EXECUTE FUNCTION check_badge_requirements();

-- Create function to update team distance
CREATE OR REPLACE FUNCTION update_team_distance(team_id UUID, distance_to_add INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE teams
    SET current_distance = current_distance + distance_to_add
    WHERE id = team_id;
END;
$$ LANGUAGE plpgsql;

-- Create policies
DO $$ 
BEGIN
    -- Profiles policies
    EXECUTE format('CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id)');
    EXECUTE format('CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id)');
    EXECUTE format('CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id)');
    EXECUTE format('CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = ''admin''))');
    EXECUTE format('CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = ''admin''))');

    -- Teams policies
    EXECUTE format('CREATE POLICY "Team visible to members" ON teams FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND team_id = teams.id))');
    EXECUTE format('CREATE POLICY "Team manageable by managers and admins" ON teams FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND team_id = teams.id AND role IN (''team_manager'', ''admin'')))');

    -- Activities policies
    EXECUTE format('CREATE POLICY "Activities visible to team members" ON activities FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND team_id = activities.team_id))');
    EXECUTE format('CREATE POLICY "Users can create their own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id)');

    -- Badges policies
    EXECUTE format('CREATE POLICY "Badges visible to all" ON badges FOR SELECT USING (true)');
    EXECUTE format('CREATE POLICY "Team managers can create team badges" ON badges FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND team_id = badges.team_id AND role = ''team_manager''))');
    EXECUTE format('CREATE POLICY "Admins can create global badges" ON badges FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = ''admin''))');

    -- User badges policies
    EXECUTE format('CREATE POLICY "User badges visible to team members" ON user_badges FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p1 JOIN profiles p2 ON p1.team_id = p2.team_id WHERE p1.user_id = auth.uid() AND p2.user_id = user_badges.user_id))');

    -- Media policies
    EXECUTE format('CREATE POLICY "Media visible to team members" ON media FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND team_id = media.team_id))');
    EXECUTE format('CREATE POLICY "Users can upload their own media" ON media FOR INSERT WITH CHECK (auth.uid() = user_id)');
    
    -- Journey checkpoints policies
    EXECUTE format('CREATE POLICY "Journey checkpoints visible to team members" ON journey_checkpoints FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND team_id = journey_checkpoints.team_id))');
    EXECUTE format('CREATE POLICY "Team managers can manage journey checkpoints" ON journey_checkpoints FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND team_id = journey_checkpoints.team_id AND role IN (''team_manager'', ''admin'')))');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

COMMIT;