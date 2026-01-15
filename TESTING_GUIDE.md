# Quick Start Guide - Testing the Gym Tracker

## Prerequisites
1. Supabase account and project
2. Node.js and npm installed

## Setup Steps

### 1. Configure Supabase
Create a `.env` file in the root directory:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Run Migrations
Push all migrations to your Supabase database:
```bash
# Using Supabase CLI
supabase db push

# Or manually run each migration in the Supabase SQL editor:
# 1. 20240101000000_create_profiles.sql
# 2. 20240102000000_create_gym_sessions.sql
# 3. 20240103000000_create_routines.sql
# 4. 20240104000000_create_routine_exercises.sql
# 5. 20240105000000_create_session_exercises.sql
# 6. 20240106000000_create_session_sets.sql
# 7. 20240107000000_update_gym_sessions_add_routine.sql
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

## Testing Workflow

### Test 1: Authentication & Profile Setup
1. Navigate to `http://localhost:5173`
2. Sign up with email
3. Complete profile setup
4. Should redirect to today's session

### Test 2: Create a Routine
1. From session page, click "create a new one"
2. Should navigate to `/routines`
3. Click "+ New routine"
4. Enter name: "Push Day"
5. Enter focus: "Chest & Triceps"
6. Click "Create"
7. Should navigate to routine detail page

### Test 3: Add Exercises to Routine
1. On routine detail page, click "+ Add exercise"
2. Enter name: "Bench Press"
3. Enter sets: "4"
4. Enter reps: "8-10"
5. Enter rest: "90"
6. Click "Add"
7. Repeat for 2-3 more exercises
8. Edit exercise inline - changes should autosave

### Test 4: Create Another Routine
1. Click "← Back to routines"
2. Click "+ New routine"
3. Create "Pull Day" with different exercises
4. Add exercises: "Pull-ups", "Barbell Rows", etc.

### Test 5: Select Routine in Session
1. Click "Return to today's session"
2. Should see "Select a routine for today"
3. Click "Choose routine"
4. Bottom sheet should appear with routines
5. Select "Push Day"
6. Exercises should appear in session

### Test 6: Log Exercise Sets
1. For first exercise, fill in Set 1:
   - Reps: 8
   - Weight: 60
2. Fill in remaining sets with different values
3. Wait 1-2 seconds (autosave)
4. Refresh page - data should persist

### Test 7: Add Duration and Notes
1. Scroll to Duration field
2. Enter: "45"
3. In Notes field, enter: "Felt strong today"
4. Wait for autosave
5. Refresh - should persist

### Test 8: Navigate Between Days
1. Swipe left or use date navigation
2. Should see empty session for next day
3. Can select same or different routine
4. Swipe right to go back

### Test 9: Edit Routine After Session
1. Navigate to `/routines`
2. Edit "Push Day" routine
3. Change exercise details
4. Go back to logged session
5. Session should remain unchanged (independent copy)

### Test 10: RLS Security Testing
1. Open Supabase dashboard
2. Go to SQL Editor
3. Run: `SELECT * FROM routines;`
4. Should only see your routines
5. Try with different users - should be isolated

## Expected Behavior

### Autosave
- All fields autosave after 1 second of no typing
- No "Save" buttons
- No success messages

### Navigation
- Swipe left/right between days
- Contextual links (not persistent menu)
- "Return to today's session" link on routine pages

### Design
- Serif headings (Playfair Display)
- Grayscale colors
- Minimal UI (no icons except calendar)
- Slow, calm transitions

### Data Flow
1. **Routine Creation**: Creates routine + exercises
2. **Routine Selection**: Copies exercises to session
3. **Session Logging**: Logs actual performance
4. **Independence**: Session data never changes when routine is edited

## Common Issues

### Issue: "Loading..." forever
**Solution**: Check .env file has correct Supabase credentials

### Issue: Cannot create routine
**Solution**: 
1. Check migrations are run
2. Check RLS policies are enabled
3. Check user is authenticated

### Issue: Exercises not appearing after routine selection
**Solution**:
1. Check session_exercises table exists
2. Check session_sets table exists
3. Check browser console for errors

### Issue: Data not persisting
**Solution**:
1. Wait 1-2 seconds for autosave
2. Check network tab for failed requests
3. Check RLS policies allow insert/update

## Database Verification

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles',
    'gym_sessions',
    'routines',
    'routine_exercises',
    'session_exercises',
    'session_sets'
  );
```

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
All tables should show `rowsecurity = true`

### Check Policies Exist
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```
Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)

## Performance Notes

- Routines list: Fetches routines + exercise counts (2 queries)
- Routine detail: Fetches routine + exercises (2 queries)
- Session page: Fetches session + exercises + sets (3 queries)
- All queries are optimized with indexes
- Autosave uses debouncing to minimize API calls

## Browser Console Monitoring

Watch for:
```
✅ "Fetching routines..."
✅ "Fetching session..."
✅ "Copying exercises to session..."
❌ "Error fetching..." (should not see these)
❌ "RLS policy violated" (should not see these)
```

## Success Criteria

✅ Can create routines with exercises
✅ Can edit routines inline (autosave works)
✅ Can select routine in session
✅ Can log sets with reps and weight
✅ Session data persists across refreshes
✅ Different users see different data
✅ Swipe navigation still works
✅ Design is minimalist and calm
✅ No console errors

## Screenshots to Capture

1. Routines list page (empty and with routines)
2. Routine detail page with exercises
3. Session page with routine selector sheet
4. Session page with exercises and sets
5. Session page with duration and notes
6. Mobile view (responsive design)

---

**Note**: This application requires proper Supabase setup. Without database credentials, the app will show loading states indefinitely.
