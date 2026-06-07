-- Vibra Database Schema (PostgreSQL)
-- Ready for Prisma migration when backend is implemented

-- Users & Auth
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  tier          VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  clerk_id      VARCHAR(255) UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Artists
CREATE TABLE artists (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255) NOT NULL,
  image_url         TEXT,
  bio               TEXT,
  monthly_listeners INT DEFAULT 0,
  verified          BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE artist_genres (
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  genre     VARCHAR(100) NOT NULL,
  PRIMARY KEY (artist_id, genre)
);

-- Albums
CREATE TABLE albums (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  artist_id    UUID REFERENCES artists(id) ON DELETE CASCADE,
  cover_url    TEXT,
  release_date DATE,
  genre        VARCHAR(100),
  type         VARCHAR(20) DEFAULT 'album' CHECK (type IN ('album', 'single', 'ep')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Songs
CREATE TABLE songs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  artist_id    UUID REFERENCES artists(id) ON DELETE CASCADE,
  album_id     UUID REFERENCES albums(id) ON DELETE SET NULL,
  cover_url    TEXT,
  audio_url    TEXT,
  duration     INT NOT NULL,
  genre        VARCHAR(100),
  plays        BIGINT DEFAULT 0,
  release_date DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists
CREATE TABLE playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url   TEXT,
  owner_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playlist_songs (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id     UUID REFERENCES songs(id) ON DELETE CASCADE,
  position    INT NOT NULL,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (playlist_id, song_id)
);

-- Likes (polymorphic)
CREATE TABLE likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('song', 'album', 'artist')),
  target_id   UUID NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

-- Follows
CREATE TABLE follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL,
  following_type VARCHAR(20) NOT NULL CHECK (following_type IN ('user', 'artist')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (follower_id, following_id, following_type)
);

-- Listening History
CREATE TABLE listening_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  song_id    UUID REFERENCES songs(id) ON DELETE CASCADE,
  played_at  TIMESTAMPTZ DEFAULT NOW(),
  duration   INT
);

-- Notifications
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT,
  link       TEXT,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Feed
CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(30) NOT NULL,
  target      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (Stripe)
CREATE TABLE subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id     VARCHAR(255),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status                 VARCHAR(30) DEFAULT 'active',
  plan                   VARCHAR(30) DEFAULT 'premium',
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics (aggregated)
CREATE TABLE daily_stats (
  date              DATE PRIMARY KEY,
  daily_active_users INT DEFAULT 0,
  total_plays       BIGINT DEFAULT 0,
  new_users         INT DEFAULT 0,
  revenue           DECIMAL(12, 2) DEFAULT 0
);

-- Future-ready: Podcasts
CREATE TABLE podcasts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  host        VARCHAR(255),
  cover_url   TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Future-ready: Audiobooks
CREATE TABLE audiobooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  author      VARCHAR(255),
  cover_url   TEXT,
  duration    INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_songs_artist ON songs(artist_id);
CREATE INDEX idx_songs_album ON songs(album_id);
CREATE INDEX idx_songs_genre ON songs(genre);
CREATE INDEX idx_listening_history_user ON listening_history(user_id, played_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_likes_user ON likes(user_id, target_type);
