# Supabase Setup Instructions

Your property inspection app is currently running in **development mode** with mock data. To connect to your Supabase database, follow these steps:

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIs...`)

## Step 2: Update Configuration

### Option A: Update the config file directly (for development)
Edit `/config/env.ts` and replace the placeholder values:

```typescript
export const ENV = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-actual-anon-key',
  API_BASE_URL: 'http://localhost:3001/api',
  NODE_ENV: 'development'
};
```

### Option B: Use environment variables (recommended for production)
If your build system supports environment variables, you can also create a `.env` file:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key
```

## Step 3: Verify Connection

1. Restart your development server: `npm start`
2. The blue development notice should disappear
3. Your app will now use real Supabase data instead of mock data

## Step 4: Database Schema

Make sure your Supabase database has the required tables. The database schema should include:

- `communities` table
- `properties` table  
- `inspections` table
- `users` table
- And other tables as defined in your database schema

## Troubleshooting

- **Invalid URL error**: Make sure your SUPABASE_URL starts with `https://`
- **Auth errors**: Verify your SUPABASE_ANON_KEY is correct
- **Connection errors**: Check your internet connection and Supabase project status

## Row Level Security (RLS)

For production use, make sure to set up Row Level Security policies in your Supabase dashboard to protect your data.