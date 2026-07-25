-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  banner_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  singles_rating FLOAT DEFAULT 1500,
  doubles_rating FLOAT DEFAULT 1500,
  singles_matches_played INTEGER DEFAULT 0,
  doubles_matches_played INTEGER DEFAULT 0,
  bio TEXT,
  paddle TEXT,
  favorite_court TEXT,
  accent_color TEXT DEFAULT '#cfff50',
  birthdate DATE,
  tags TEXT[] DEFAULT '{}',
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  blocked_users TEXT[] DEFAULT '{}',
  app_theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  show_posts_on_profile BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MATCHES TABLE
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  match_format TEXT NOT NULL, -- 'singles' or 'doubles'
  match_type TEXT NOT NULL,   -- 'friendly' or 'ranked'
  team1_score INTEGER NOT NULL,
  team2_score INTEGER NOT NULL,
  team1 UUID[] NOT NULL,
  team2 UUID[] NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submitted_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POSTS (COMMENTS/FEED) TABLE
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL, -- 'match_request', 'new_follower', 'match_approved'
  message TEXT NOT NULL,
  related_match_id UUID REFERENCES public.matches(id),
  related_user_id UUID REFERENCES public.users(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
