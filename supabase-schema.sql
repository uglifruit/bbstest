-- Run this in your Supabase SQL Editor to set up the messages table

CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  handle TEXT NOT NULL CHECK (char_length(handle) <= 20),
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages
CREATE POLICY "Anyone can read messages"
  ON messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Anyone can post messages"
  ON messages
  FOR INSERT
  WITH CHECK (true);

-- Index for fast ordering
CREATE INDEX messages_created_at_idx ON messages (created_at DESC);
