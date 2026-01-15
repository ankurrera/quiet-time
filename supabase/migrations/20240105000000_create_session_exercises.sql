-- Create session_exercises table
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.gym_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view exercises for their own sessions
CREATE POLICY "Users can view own session exercises"
  ON public.session_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_sessions
      WHERE gym_sessions.id = session_exercises.session_id
      AND gym_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can insert exercises for their own sessions
CREATE POLICY "Users can insert own session exercises"
  ON public.session_exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gym_sessions
      WHERE gym_sessions.id = session_exercises.session_id
      AND gym_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can update exercises for their own sessions
CREATE POLICY "Users can update own session exercises"
  ON public.session_exercises
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_sessions
      WHERE gym_sessions.id = session_exercises.session_id
      AND gym_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gym_sessions
      WHERE gym_sessions.id = session_exercises.session_id
      AND gym_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can delete exercises for their own sessions
CREATE POLICY "Users can delete own session exercises"
  ON public.session_exercises
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.gym_sessions
      WHERE gym_sessions.id = session_exercises.session_id
      AND gym_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_session_exercises_session_id ON public.session_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_session_exercises_order ON public.session_exercises(session_id, order_index);

-- Add comment for documentation
COMMENT ON TABLE public.session_exercises IS 'Exercises logged in gym sessions. RLS ensures users can only access exercises for their own sessions.';
