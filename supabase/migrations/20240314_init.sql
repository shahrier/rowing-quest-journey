-- Create enum for badge tiers
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold');

-- Create teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    goal_distance BIGINT, -- Distance in meters
    current_distance BIGINT DEFAULT 0,
    description TEXT
);

-- Add team_id to profiles table
ALTER TABLE profiles 
ADD COLUMN team_id UUID REFERENCES teams(id),
ADD COLUMN role TEXT CHECK (role IN ('user', 'team_manager', 'admin')) DEFAULT 'user';

-- Create activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    team_id UUID REFERENCES teams(id) NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('rowing', 'strength')) NOT NULL,
    distance INTEGER, -- For rowing activities
    duration INTEGER NOT NULL, -- In seconds
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create badges table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    tier badge_tier NOT NULL,
    team_id UUID REFERENCES teams(id), -- NULL means global badge
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_badges table
CREATE TABLE user_badges (
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    badge_id UUID REFERENCES badges(id) NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);

-- Create media table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    team_id UUID REFERENCES teams(id) NOT NULL,
    media_type TEXT CHECK (media_type IN ('photo', 'video')) NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Team visible to members" ON teams
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE team_id = teams.id
        )
    );

CREATE POLICY "Team manageable by managers and admins" ON teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND team_id = teams.id 
            AND role IN ('team_manager', 'admin')
        )
    );

-- Activities policies
CREATE POLICY "Activities visible to team members" ON activities
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE team_id = activities.team_id
        )
    );

CREATE POLICY "Users can create their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Badges visible to all" ON badges
    FOR SELECT USING (true);

CREATE POLICY "Team managers can create team badges" ON badges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND team_id = badges.team_id 
            AND role = 'team_manager'
        )
    );

CREATE POLICY "Admins can create global badges" ON badges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- User badges policies
CREATE POLICY "User badges visible to team members" ON user_badges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p1
            JOIN profiles p2 ON p1.team_id = p2.team_id
            WHERE p1.user_id = auth.uid()
            AND p2.user_id = user_badges.user_id
        )
    );

-- Media policies
CREATE POLICY "Media visible to team members" ON media
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE team_id = media.team_id
        )
    );

CREATE POLICY "Users can upload their own media" ON media
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions
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
