-- Create routine_exercises table
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  rest_seconds INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view exercises for their own routines
CREATE POLICY "Users can view own routine exercises"
  ON public.routine_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.routines
      WHERE routines.id = routine_exercises.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Policy: Users can insert exercises for their own routines
CREATE POLICY "Users can insert own routine exercises"
  ON public.routine_exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routines
      WHERE routines.id = routine_exercises.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Policy: Users can update exercises for their own routines
CREATE POLICY "Users can update own routine exercises"
  ON public.routine_exercises
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.routines
      WHERE routines.id = routine_exercises.routine_id
      AND routines.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routines
      WHERE routines.id = routine_exercises.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Policy: Users can delete exercises for their own routines
CREATE POLICY "Users can delete own routine exercises"
  ON public.routine_exercises
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.routines
      WHERE routines.id = routine_exercises.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON public.routine_exercises(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_order ON public.routine_exercises(routine_id, order_index);

-- Add comment for documentation
COMMENT ON TABLE public.routine_exercises IS 'Exercises within workout routines. RLS ensures users can only access exercises for their own routines.';
