-- Create gym_sessions table
CREATE TABLE IF NOT EXISTS public.gym_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  duration_minutes INTEGER,
  workout_type TEXT,
  exercises JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure one session per user per day
  CONSTRAINT unique_user_session_date UNIQUE (user_id, session_date)
);

-- Enable Row Level Security
ALTER TABLE public.gym_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.gym_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert only their own sessions
CREATE POLICY "Users can insert own sessions"
  ON public.gym_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own sessions
CREATE POLICY "Users can update own sessions"
  ON public.gym_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own sessions
CREATE POLICY "Users can delete own sessions"
  ON public.gym_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_gym_sessions_user_id ON public.gym_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_sessions_session_date ON public.gym_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_gym_sessions_user_date ON public.gym_sessions(user_id, session_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gym_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_gym_sessions_updated_at_trigger
  BEFORE UPDATE ON public.gym_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_gym_sessions_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.gym_sessions IS 'Gym session logs with RLS ensuring users can only access their own data. Each user can have one session per date.';
