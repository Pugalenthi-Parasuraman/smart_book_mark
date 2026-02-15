# Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Google OAuth.  
Save, organize, and sync your bookmarks across multiple browser tabs instantly.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

---

## 🚀 Live Demo

**Deployed URL:**  
👉 https://your-app.vercel.app

---

## 📌 Overview

Smart Bookmark App is a full-stack web application that allows users to securely save and manage bookmarks.  
Authentication is handled via Google OAuth using Supabase Auth, and all bookmark data is securely stored with Row Level Security enabled.

The app supports real-time synchronization, meaning updates made in one browser tab instantly reflect in other open tabs.

---

## ✨ Features

- Google OAuth authentication
- Secure, private bookmarks per user
- Create and delete bookmarks
- Real-time sync across browser tabs
- Responsive UI (mobile & desktop)
- Modern design with Tailwind CSS
- Row Level Security (RLS) enabled
- Middleware-based route protection

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Authentication:** Supabase Auth (Google OAuth)
- **Database:** Supabase (PostgreSQL)
- **Realtime:** Supabase Realtime
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## 📋 Prerequisites

Before running the project, ensure you have:

- Node.js 18+
- Supabase account
- Google Cloud Console account

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd smart-bookmark-app
npm install
```

---

### 2️⃣ Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for database provisioning
4. Open **SQL Editor**
5. Open the file `supabase-setup.sql` from this repository
6. Copy all the SQL code inside it
7. Paste it into the Supabase SQL Editor
8. Click **Run**


---

### 3️⃣ Configure Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project
3. Configure OAuth consent screen
4. Create OAuth 2.0 Client ID
5. Choose **Web Application**
6. Add authorized redirect URIs:

```
https://<your-project>.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

7. Copy Client ID & Client Secret

---

### 4️⃣ Enable Google Provider in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Authentication → Providers**
3. Enable **Google**
4. Paste Client ID & Client Secret
5. Save changes

---

### 5️⃣ Add Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find these values in:

Supabase → Project Settings → API

---

### 6️⃣ Run Locally

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

### 7️⃣ Deploy to Vercel

1. Push project to GitHub
2. Import into Vercel
3. Add environment variables
4. Deploy

After deployment, add:

```
https://your-app.vercel.app/auth/callback
```

to Google OAuth redirect URIs.

---

## 🎯 How to Use

1. Click **Continue with Google**
2. Add a bookmark (Title + URL)
3. View your bookmarks instantly
4. Delete bookmarks when needed
5. Open two tabs to test real-time sync

---

## 📁 Project Structure

```
smart-bookmark-app/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── logout/
│   ├── auth/
│   │   └── callback/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── utils/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── middleware.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🐛 Problems Faced & Solutions

### Real-time Updates Not Working

- Enabled realtime publication in Supabase
- Properly configured subscriptions in React
- Cleaned up subscriptions on component unmount

### Row Level Security Blocking Access

- Added SELECT, INSERT, DELETE policies
- Used condition: `auth.uid() = user_id`

### OAuth Redirect Errors

- Correct redirect URLs added in Google Cloud Console
- Created `/auth/callback` route handler
- Fixed middleware redirection logic

### Redirect Loop Issue

- Updated middleware:
  - Unauthenticated → `/login`
  - Authenticated users on `/login` → `/`

---

## 🔐 Security Implementation

- Row Level Security (RLS)
- Google OAuth authentication
- Secure server-side session handling
- Middleware route protection
- HTTPS in production

---

## 📚 Key Learnings

- Implementing Google OAuth with Supabase
- Setting up RLS for multi-user apps
- Handling authentication in Next.js App Router
- Using Supabase Realtime
- Deploying full-stack applications on Vercel

---

## 📄 License

MIT License

---

Built with ❤️ using Next.js, Supabase, and Tailwind CSS
