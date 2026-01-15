-- Create session_sets table
CREATE TABLE IF NOT EXISTS public.session_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id UUID NOT NULL REFERENCES public.session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight NUMERIC(6, 2),
  rest_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.session_sets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sets for their own session exercises
CREATE POLICY "Users can view own session sets"
  ON public.session_sets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises
      JOIN public.gym_sessions ON gym_sessions.id = session_exercises.session_id
      WHERE session_exercises.id = session_sets.session_exercise_id
      AND gym_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can insert sets for their own session exercises
CREATE POLICY "Users can insert own session sets"
  ON public.session_sets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.session_exercises
      JOIN public.gym_sessions ON gym_sessions.id = session_exercises.session_id
      WHERE session_exercises.id = session_sets.session_exercise_id
      AND gym_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can update sets for their own session exercises
CREATE POLICY "Users can update own session sets"
  ON public.session_sets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises
      JOIN public.gym_sessions ON gym_sessions.id = session_exercises.session_id
      WHERE session_exercises.id = session_sets.session_exercise_id
      AND gym_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.session_exercises
      JOIN public.gym_sessions ON gym_sessions.id = session_exercises.session_id
      WHERE session_exercises.id = session_sets.session_exercise_id
      AND gym_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can delete sets for their own session exercises
CREATE POLICY "Users can delete own session sets"
  ON public.session_sets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises
      JOIN public.gym_sessions ON gym_sessions.id = session_exercises.session_id
      WHERE session_exercises.id = session_sets.session_exercise_id
      AND gym_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_session_sets_exercise_id ON public.session_sets(session_exercise_id);
CREATE INDEX IF NOT EXISTS idx_session_sets_set_number ON public.session_sets(session_exercise_id, set_number);

-- Add comment for documentation
COMMENT ON TABLE public.session_sets IS 'Individual sets within session exercises. RLS ensures users can only access sets for their own sessions.';
