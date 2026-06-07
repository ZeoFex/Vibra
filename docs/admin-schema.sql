-- Vibra Admin Panel Schema Extension
-- Add to PostgreSQL when implementing backend

CREATE TYPE admin_role AS ENUM (
  'super_admin', 'content_manager', 'verification_manager', 'support_admin', 'finance_admin'
);

CREATE TYPE verification_status AS ENUM (
  'pending', 'under_review', 'needs_more_info', 'approved', 'verified', 'rejected', 'suspended'
);

CREATE TABLE admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          admin_role NOT NULL DEFAULT 'support_admin',
  avatar_url    TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        admin_role UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE artist_applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id),
  stage_name        VARCHAR(255) NOT NULL,
  legal_name        VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  phone             VARCHAR(50),
  country           VARCHAR(100),
  profile_photo_url TEXT,
  bio               TEXT,
  social_links      JSONB DEFAULT '[]',
  record_label      VARCHAR(255),
  distribution_links JSONB DEFAULT '[]',
  status            verification_status DEFAULT 'pending',
  admin_notes       JSONB DEFAULT '[]',
  reviewed_by       UUID REFERENCES admins(id),
  submitted_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE artist_verification_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID REFERENCES artist_applications(id) ON DELETE CASCADE,
  document_type   VARCHAR(100) NOT NULL,
  file_url        TEXT NOT NULL,
  file_name       VARCHAR(255),
  uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE artist_verification_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID REFERENCES artist_applications(id) ON DELETE CASCADE,
  admin_id        UUID REFERENCES admins(id),
  action          VARCHAR(100) NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE music_review_queue (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id             UUID REFERENCES songs(id),
  artist_id           UUID REFERENCES artists(id),
  title               VARCHAR(255) NOT NULL,
  status              VARCHAR(30) DEFAULT 'pending',
  explicit            BOOLEAN DEFAULT FALSE,
  copyright_confirmed BOOLEAN DEFAULT FALSE,
  admin_notes         JSONB DEFAULT '[]',
  reviewed_by         UUID REFERENCES admins(id),
  submitted_at        TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at         TIMESTAMPTZ
);

CREATE TABLE moderation_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          VARCHAR(50) NOT NULL,
  target_type   VARCHAR(50) NOT NULL,
  target_id     UUID NOT NULL,
  reported_by   UUID REFERENCES users(id),
  reason        VARCHAR(255) NOT NULL,
  description   TEXT,
  status        VARCHAR(30) DEFAULT 'open',
  priority      VARCHAR(20) DEFAULT 'medium',
  assigned_to   UUID REFERENCES admins(id),
  resolved_by   UUID REFERENCES admins(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ
);

CREATE TABLE support_tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  subject       VARCHAR(255) NOT NULL,
  category      VARCHAR(50) NOT NULL,
  status        VARCHAR(30) DEFAULT 'open',
  assigned_to   UUID REFERENCES admins(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  closed_at     TIMESTAMPTZ
);

CREATE TABLE support_ticket_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id   UUID,
  sender_type VARCHAR(20) NOT NULL,
  content     TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID REFERENCES admins(id) NOT NULL,
  action        VARCHAR(255) NOT NULL,
  target_type   VARCHAR(50) NOT NULL,
  target_id     UUID,
  target_label  VARCHAR(255),
  reason        TEXT,
  ip_address    INET,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE artist_payouts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id         UUID REFERENCES artists(id) NOT NULL,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  total_streams     BIGINT DEFAULT 0,
  estimated_amount  DECIMAL(12, 2),
  approved_amount   DECIMAL(12, 2),
  status            VARCHAR(30) DEFAULT 'pending',
  payment_method    VARCHAR(50),
  payment_details   JSONB,
  admin_note        TEXT,
  approved_by       UUID REFERENCES admins(id),
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE platform_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(255) NOT NULL,
  message         TEXT NOT NULL,
  audience        VARCHAR(50) NOT NULL,
  audience_filter JSONB,
  type            VARCHAR(50) NOT NULL,
  sent_by         UUID REFERENCES admins(id),
  sent_at         TIMESTAMPTZ,
  status          VARCHAR(20) DEFAULT 'draft',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE featured_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(30) NOT NULL,
  content_id  UUID NOT NULL,
  section     VARCHAR(50) NOT NULL,
  sort_order  INT DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES admins(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE official_playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id),
  category    VARCHAR(100),
  featured    BOOLEAN DEFAULT FALSE,
  official    BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES admins(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artist_applications_status ON artist_applications(status);
CREATE INDEX idx_music_review_queue_status ON music_review_queue(status);
CREATE INDEX idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_admin_activity_logs_admin ON admin_activity_logs(admin_id, created_at DESC);
