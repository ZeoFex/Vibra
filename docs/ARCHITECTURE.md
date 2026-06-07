# Vibra Architecture

Frontend-only MVP with mock data. Backend integration points are documented below for future implementation.

## Folder Structure

```
vibra/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── home/           # Personalized home feed
│   │   ├── search/         # Search & browse
│   │   ├── library/        # User library
│   │   ├── playlist/[id]/  # Playlist detail
│   │   ├── artist/[id]/    # Artist profile
│   │   ├── album/[id]/     # Album detail
│   │   ├── ai/             # Vibra AI chat
│   │   ├── premium/        # Subscription flow
│   │   ├── profile/        # User profile
│   │   ├── notifications/  # Notifications
│   │   ├── social/         # Activity feed
│   │   └── layout.tsx      # App shell (sidebar + player)
│   ├── (auth)/             # Auth pages (no app shell)
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── admin/              # Admin dashboard
│   │   ├── users/
│   │   ├── artists/
│   │   ├── songs/
│   │   ├── albums/
│   │   ├── subscriptions/
│   │   └── analytics/
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout + providers
│   └── globals.css
├── components/
│   ├── ui/                 # Shadcn-style primitives
│   ├── layout/             # Sidebar, player bar
│   └── music/              # Music-specific cards
├── lib/
│   ├── mock-data/          # Mock data layer
│   ├── contexts/           # React context (auth, player)
│   └── utils.ts
├── types/                  # Shared TypeScript types
└── docs/                   # Architecture documentation
```

## Database Schema (PostgreSQL — future)

See `docs/database-schema.sql` for the full Prisma-ready schema.

Core entities:
- **User** — accounts, profiles, subscription tier
- **Artist** — artist profiles, verification, monthly listeners
- **Album** — albums, EPs, singles
- **Song** — tracks with metadata and S3 audio URLs
- **Playlist** — user-created playlists with song ordering
- **Like** — polymorphic likes (songs, albums, artists)
- **Follow** — user-to-user and user-to-artist follows
- **Notification** — push/in-app notifications
- **Activity** — social activity feed
- **Subscription** — Stripe subscription records
- **ListeningHistory** — play events for recommendations

Future-ready tables (podcasts, audiobooks, videos, concerts) are stubbed in the schema.

## API Architecture (future)

```
/api/v1/
├── auth/           → Clerk/Auth.js webhooks + session
├── users/          → Profile CRUD, follow/unfollow
├── artists/        → Artist profiles, discography
├── albums/         → Album detail, tracks
├── songs/          → Song detail, stream URL (signed S3)
├── playlists/      → CRUD, add/remove songs, share
├── search/         → Full-text search (songs, artists, albums)
├── library/        → Liked items, recently played
├── player/         → Queue management, listening history
├── ai/             → Vibra AI recommendations & playlist generation
├── notifications/  → List, mark read
├── social/         → Activity feed
├── subscriptions/  → Stripe checkout, portal, webhooks
└── admin/          → Admin-only CRUD + analytics
```

Mock data is currently served from `lib/mock-data/`. Each API route will mirror these interfaces.

## Tech Stack

| Layer        | Current (MVP)     | Production           |
|-------------|-------------------|----------------------|
| Frontend    | Next.js 16 + TS   | Same                 |
| Styling     | TailwindCSS 4     | Same                 |
| Components  | Custom (Shadcn-style) | Same             |
| Data        | Mock data         | PostgreSQL + Prisma  |
| Auth        | localStorage mock | Clerk or Auth.js     |
| Storage     | Unsplash images   | AWS S3               |
| Payments    | Mock upgrade      | Stripe               |
| Deploy      | —                 | Vercel               |
