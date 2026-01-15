-- Create routines table
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  focus TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own routines
CREATE POLICY "Users can view own routines"
  ON public.routines
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert only their own routines
CREATE POLICY "Users can insert own routines"
  ON public.routines
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own routines
CREATE POLICY "Users can update own routines"
  ON public.routines
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own routines
CREATE POLICY "Users can delete own routines"
  ON public.routines
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_routines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CLOCK_TIMESTAMP();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_routines_updated_at_trigger
  BEFORE UPDATE ON public.routines
  FOR EACH ROW
  EXECUTE FUNCTION update_routines_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.routines IS 'Workout routine templates with RLS ensuring users can only access their own data.';
