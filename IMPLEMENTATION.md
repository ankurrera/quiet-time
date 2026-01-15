# Secure Authentication & Session Flow - Implementation Guide

## Overview

This implementation provides a secure, minimalist authentication and gym session logging system following a "time as navigation" philosophy. There are no traditional navigation menus - users navigate through time itself using visual calendar representations.

## Core Architecture

### Authentication Flow

```
Unauthenticated User
    ↓
/auth (Sign in / Sign up)
    ↓
Profile exists?
    No → /profile-setup (one-time)
    Yes → /session/YYYY-MM-DD (today's session)
```

### Key Features

1. **No Dashboard/Home Page**: Users are immediately directed to today's session detail page
2. **Invisible Navigation**: Time-based navigation through dot grids and progress bars
3. **Inline Editing**: Tap anywhere to edit, autosave after 1 second of inactivity
4. **Secure by Default**: Row Level Security (RLS) ensures users only see their own data
5. **Gesture Support**: Swipe left/right to navigate between days (mobile)

## Database Schema

### Tables

#### `profiles`
```sql
- id (uuid, references auth.users)
- full_name (text, nullable)
- preferred_name (text, required)
- gym_start_date (date, nullable)
- weekly_goal (integer, nullable, 1-7)
- created_at (timestamp)
```

#### `gym_sessions`
```sql
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- session_date (date, required)
- duration_minutes (integer, nullable)
- workout_type (text, nullable)
- exercises (jsonb, default [])
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

UNIQUE CONSTRAINT: (user_id, session_date)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- `SELECT`: `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`
- `DELETE`: `auth.uid() = user_id`

## Navigation System

### Primary Entry: Session Detail Page
- **Route**: `/session/YYYY-MM-DD`
- **Default**: Today's date when logging in
- **Auto-create**: Empty session created on first save
- **Editing**: Tap anywhere on card → edit mode
- **Autosave**: Changes saved 1 second after typing stops
- **Gestures**: Swipe left → next day, swipe right → previous day

### Year Navigation
Accessible via Calendar button (top-right of session page):

1. **Year Progress Bar**
   - Visual representation of year progress
   - Click anywhere on bar → navigate to that day
   - Hover shows day number tooltip
   - Green bars indicate attended days
   - Gray bars indicate missed/rest days

2. **Year Dot Grid**
   - 365 dots arranged in a grid (20 columns)
   - Each dot represents one day
   - Click any dot → navigate to that day's session
   - Dark dot = attended, light dot = not attended, red dot = today
   - Hover shows date and status

## Component Structure

```
App.tsx
├── AuthProvider (context)
├── Routes
    ├── /auth → Auth.tsx
    ├── /profile-setup → ProfileSetup.tsx
    ├── / → RootRedirect.tsx (redirects to today's session)
    └── /session/:date → GymSessionDetail.tsx
        ├── YearViewPanel (slide-in overlay)
        │   ├── YearProgressBar
        │   └── YearDotGrid
        └── Session content (view/edit modes)
```

## Hooks

### `useAuth()`
Manages authentication state and profile data.

**Returns:**
- `user`: Current authenticated user
- `profile`: User profile data
- `isLoading`: Loading state
- `isInitialized`: Auth system initialized
- `signIn()`: Email/password sign in
- `signUp()`: Create new account
- `signInWithMagicLink()`: Passwordless email link
- `signOut()`: Sign out
- `createProfile()`: Create user profile
- `refreshProfile()`: Refresh profile data

### `useGymSession(dateString: string)`
Manages session data for a specific date.

**Parameters:**
- `dateString`: Date in YYYY-MM-DD format

**Returns:**
- `session`: Session data (or empty if doesn't exist)
- `isLoading`: Loading state
- `error`: Error message if any
- `saveSession()`: Save/update session
- `refetch()`: Reload session data

### `useGymData()`
Fetches all gym sessions for the year (for visualizations).

**Returns:**
- `attendedDays`: Set of day-of-year numbers
- `stats`: Year statistics (daysAttended, percentComplete, etc.)
- `isAttended()`: Check if day has session
- `isToday()`: Check if day is today
- `isPast()`: Check if day is in the past
- `isFuture()`: Check if day is in the future
- `year`: Current year
- `isLoading`: Loading state

## Security Considerations

### Authentication
- Uses Supabase Auth for secure authentication
- Supports email/password and magic link sign-in
- Session management handled by Supabase
- Auto-refresh tokens

### Data Access
- All database queries scoped to `auth.uid()`
- RLS policies prevent unauthorized access
- No direct SQL injection risk (Supabase handles escaping)
- HTTPS required for all connections

### Client-Side Validation
- Email format validation
- Password strength requirements (min 6 characters)
- Form validation before submission

## Environment Setup

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important**: Never commit the service role key. The anon key is safe for client-side use as it respects RLS.

### Database Setup
1. Run migrations in order:
   - `20240101000000_create_profiles.sql`
   - `20240102000000_create_gym_sessions.sql`

2. Verify RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

### Lint Code
```bash
npm run lint
```

## User Experience Principles

### Calm & Invisible
- No navigation menus or visible links
- Subtle animations (0.4-0.6s transitions)
- Muted color palette (blacks, grays, subtle green)
- Typography: Playfair Display (serif) for headings, Inter for body

### Time as Navigation
- The timeline itself is the UI
- No "back" or "next" buttons (use swipes/clicks on timeline)
- Dates are never shown as URLs in the UI
- Everything feels discovered, not navigated

### No Friction
- No save buttons (autosave)
- No confirmation dialogs
- No loading spinners (unless truly waiting)
- No form validation errors (silent correction)

## Testing Checklist

- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign in with magic link
- [ ] Create profile (one-time setup)
- [ ] Redirected to today's session after login
- [ ] Click on session card to edit
- [ ] Type in fields and verify autosave (wait 1 second)
- [ ] Swipe left to go to next day
- [ ] Swipe right to go to previous day
- [ ] Click calendar button to open year view
- [ ] Click on dot in year grid to navigate
- [ ] Click on progress bar to navigate
- [ ] Verify RLS (can't see other users' data)
- [ ] Sign out and verify redirect to auth page

## Troubleshooting

### "Missing Supabase environment variables"
Ensure `.env` file exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Sessions not saving
Check browser console for errors. Verify RLS policies are correctly set up and Supabase connection works.

### Navigation not working
Verify date format is YYYY-MM-DD. Check that routes are properly configured in App.tsx.

### Year view not showing data
Check that `useGymData` hook is fetching sessions. Verify date range filters in query.

## Future Enhancements

- [ ] Add exercise tracking with sets/reps/weight
- [ ] Export data as CSV/JSON
- [ ] Weekly/monthly summary views
- [ ] Personal records tracking
- [ ] Progressive Web App (PWA) support
- [ ] Offline mode with sync
- [ ] Photo attachments for sessions
- [ ] Workout templates
