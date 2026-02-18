# Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Google OAuth.  
Save, organize, and sync your bookmarks across multiple browser tabs instantly.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

---

## What is this?

This is one of my first full-stack projects. I built a bookmark manager where you can log in with Google, save links, and delete them. The cool part is that if you open the app in two tabs, both tabs update in real time — no page refresh needed.

I ran into a lot of problems building this and spent a long time debugging. I'm documenting everything here so I remember what I learned, and so other beginners don't get stuck on the same things.

---

## Live Demo

👉 https://smart-book-mark-blush.vercel.app

---

## Features

- Google login (OAuth)
- Save bookmarks with a title and URL
- Delete bookmarks
- Real-time sync across browser tabs
- Works on mobile and desktop
- Each user only sees their own bookmarks (secure)

---

## Tech Stack

| What | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Login | Supabase Auth (Google OAuth) |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime |
| Styling | Tailwind CSS |
| Hosting | Vercel |

---

## How to Run This Project

### Step 1 — Clone the repo
```bash
git clone <your-repository-url>
cd smart-bookmark-app
npm install
```

---

### Step 2 — Set up Supabase

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Wait for it to finish setting up (takes about 1 minute)
4. Go to **SQL Editor** in the left sidebar
5. Open the file `supabase-setup.sql` from this project
6. Copy everything and paste it into the SQL Editor
7. Click **Run**

This creates the bookmarks table, security rules, and enables real-time.

---

### Step 3 — Set up Google Login

1. Go to https://console.cloud.google.com
2. Create a new project
3. Go to **APIs & Services → OAuth consent screen** and fill in the basic info
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Under **Authorized redirect URIs**, add:
```
https://<your-project-id>.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

7. Copy the **Client ID** and **Client Secret**

---

### Step 4 — Connect Google to Supabase

1. Go to your Supabase project
2. Navigate to **Authentication → Providers**
3. Find **Google** and enable it
4. Paste your Client ID and Client Secret
5. Save

---

### Step 5 — Add environment variables

Create a file called `.env.local` in the root of the project:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find these values in: **Supabase → Project Settings → API**

---

### Step 6 — Run locally
```bash
npm run dev
```

Open http://localhost:3000

---

### Step 7 — Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com and import the repo
3. Add the same environment variables from `.env.local`
4. Deploy

After deploying, go back to Google Cloud Console and add your live URL to the redirect URIs:
```
https://your-app.vercel.app/auth/callback
```

---

## Problems I Ran Into (and How I Fixed Them)

This is the most important section. These bugs took me a long time to figure out.

---

### Problem 1 — Real-time DELETE not working (INSERT worked fine)

**What happened:**
Adding a bookmark showed up instantly in both tabs. But deleting a bookmark — nothing happened in the other tab. No error, just silence.

**Why it happened:**
Supabase Realtime needs the old row data to know *which* row was deleted. By default, Postgres doesn't send that data. So the DELETE event was firing, but `payload.old` was empty — my filter had nothing to match.

**How I fixed it:**
Run this once in the Supabase SQL Editor:
```sql
ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;
```

This tells Postgres to include the full old row when a DELETE happens. After this, `payload.old.id` was available and the UI updated instantly.

**Mental model to remember:**
- INSERT → always sends `payload.new` ✅
- UPDATE → sends `payload.old` + `payload.new` ✅
- DELETE → sends `payload.old` **only if** `REPLICA IDENTITY FULL` is set ⚠️

---

### Problem 2 — Real-time not working at all (no events firing)

**What happened:**
Even after enabling the Supabase realtime publication, no events were coming through. Not INSERT, not DELETE, nothing.

**Why it happened:**
I was registering the `.on()` listener *inside* the `.subscribe()` callback — after the channel was already connected. Supabase requires listeners to be set up *before* subscribing.

**Wrong way:**
```ts
channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    channel.on('postgres_changes', ...) // too late, never fires
  }
})
```

**Correct way:**
```ts
channel
  .on('postgres_changes', ...) // register FIRST
  .subscribe()                 // then connect
```

**How to debug this in the future:**
Add `console.log(payload)` inside the `.on()` handler. If you never see any log, the listener isn't connected. If you see the log but `payload.old` is empty on DELETE, it's the replica identity issue from Problem 1.

---

### Problem 3 — OAuth redirect errors

**What happened:**
After logging in with Google, I got a redirect error instead of being sent back to the app.

**How I fixed it:**
Made sure both of these URLs were added to Google Cloud Console under authorized redirect URIs:
```
https://<your-project>.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

Also created the `/auth/callback` route handler in Next.js to exchange the OAuth code for a session.

---

### Problem 4 — Redirect loop

**What happened:**
The app kept bouncing between `/login` and `/` endlessly.

**How I fixed it:**
Updated the middleware logic to be explicit:
- If not logged in → go to `/login`
- If already logged in and on `/login` → go to `/`
- Otherwise → stay on current page

---

## Debugging Checklist for Future Me

If realtime stops working:

| Symptom | Check first |
|---|---|
| No events at all | Is `.on()` before `.subscribe()`? |
| INSERT works, DELETE silent | Run `REPLICA IDENTITY FULL` |
| OAuth fails | Check redirect URIs in Google Console |
| Redirect loop | Check middleware logic |

---

## What I Learned

- How Google OAuth works end to end
- What Row Level Security is and why silent failures are tricky
- How Supabase Realtime works under the hood
- Why Postgres replica identity matters for DELETE events
- How to protect routes in Next.js App Router with middleware
- How to deploy a full-stack app to Vercel

---

## License

MIT License

---
