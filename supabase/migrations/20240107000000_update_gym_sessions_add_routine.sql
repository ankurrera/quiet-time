-- Add routine_id column to gym_sessions table
ALTER TABLE public.gym_sessions
ADD COLUMN IF NOT EXISTS routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gym_sessions_routine_id ON public.gym_sessions(routine_id);

-- Add comment
COMMENT ON COLUMN public.gym_sessions.routine_id IS 'Optional reference to the routine used for this session. Sessions are independent copies once created.';
