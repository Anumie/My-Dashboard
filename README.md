# Personal Productivity Dashboard

A warm, personal productivity dashboard built with Next.js 14, Drizzle ORM, and Neon Postgres.

## Features

- **Weekly View** — Tasks with confetti on completion, gym tracker, focus/goals, reflections, currently reading
- **Habits** — Weekly grid with custom icon/color/goal, daily + devotional sections, completion score
- **Quarter** — Credit cards & savings with progress bars, quarterly goals, gym chart (13 weeks), achievements, parking lot
- **Books** — Open Library search, reading status, per-quarter read list
- **Bucket List** — 7 categories, completion tracking with dates, progress bars
- **Yearly** — 4 reflection prompts, word of the year, themed buckets, yearly goals
- **Portfolio** — Log projects/posts, clean public page at `/portfolio/public`

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create GitHub repo and push
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. Deploy to Vercel
1. Go to vercel.com → New Project → Import from GitHub
2. Select your repo → Deploy

### 4. Add Neon Postgres Database
1. In your Vercel project dashboard → Storage tab
2. Create → Postgres (powered by Neon)
3. Name it anything, accept defaults
4. This auto-adds `DATABASE_URL` to your environment

### 5. Pull env vars for local dev
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
```

### 6. Push database schema
```bash
npm run db:push
```

### 7. Run locally
```bash
npm run dev
```

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Postgres (via Vercel Storage)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion + CSS

## Color Palette

Warm earthy tones: muted browns, sage greens, sandy neutrals, cream backgrounds.
