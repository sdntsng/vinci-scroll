-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    gcs_url TEXT NOT NULL, -- Google Cloud Storage URL
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    file_size BIGINT, -- in bytes
    mime_type VARCHAR(100),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions table
CREATE TABLE public.user_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    video_id UUID REFERENCES public.videos(id) NOT NULL,
    interaction_type VARCHAR(20) NOT NULL, -- 'like', 'dislike', 'emoji', 'view'
    interaction_data JSONB DEFAULT '{}', -- For emoji data, view duration, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one interaction per user per video per type
    UNIQUE(user_id, video_id, interaction_type)
);

-- Feedback table
CREATE TABLE public.feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    video_id UUID REFERENCES public.videos(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    categories JSONB DEFAULT '{}', -- content_quality, engagement, etc.
    would_recommend BOOLEAN,
    comments TEXT,
    improvement_suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video upload sessions (for tracking bulk uploads)
CREATE TABLE public.upload_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    session_name VARCHAR(255),
    total_files INTEGER DEFAULT 0,
    uploaded_files INTEGER DEFAULT 0,
    failed_files INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_videos_active ON public.videos(is_active);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_user_interactions_user_video ON public.user_interactions(user_id, video_id);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_video_id ON public.feedback(video_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_sessions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Videos policies
CREATE POLICY "Anyone can view active videos" ON public.videos
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can upload videos" ON public.videos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own videos" ON public.videos
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- User interactions policies
CREATE POLICY "Users can view own interactions" ON public.user_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON public.user_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON public.user_interactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view own feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Upload sessions policies
CREATE POLICY "Users can view own upload sessions" ON public.upload_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own upload sessions" ON public.upload_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 