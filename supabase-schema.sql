-- ─── MESSAGES ───────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  handle TEXT NOT NULL CHECK (char_length(handle) <= 20),
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages
CREATE POLICY "Anyone can read messages"
  ON messages FOR SELECT USING (true);

-- Anyone can insert (auth check is enforced in the Next.js API layer)
CREATE POLICY "Anyone can post messages"
  ON messages FOR INSERT WITH CHECK (true);

CREATE INDEX messages_created_at_idx ON messages (created_at DESC);


-- ─── USERS ───────────────────────────────────────────────────────────────────
-- Password hashes are stored here. Access is restricted to service role only.

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL
    CHECK (char_length(handle) >= 2 AND char_length(handle) <= 20),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- No public policies — only the service role key (used by Next.js API routes)
-- can read or write this table. Anon/public access is fully blocked.
