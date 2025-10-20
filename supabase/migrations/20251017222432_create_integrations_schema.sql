/*
  # Integrations and External Services Schema

  ## Overview
  This migration creates tables for managing integrations with external services
  and tracking their status, configuration, and usage.

  ## New Tables

  ### 1. integrations
  Stores available integrations and their configurations.
  - `id` (uuid, primary key)
  - `name` (text) - Integration name
  - `category` (text) - Category: Communication, Storage, Financial, Creative, Other
  - `provider` (text) - Provider name (e.g., Gmail, Slack, Dropbox)
  - `description` (text)
  - `icon_url` (text)
  - `is_connected` (boolean)
  - `status` (text) - Status: Active, Inactive, Error, Pending
  - `config` (jsonb) - Configuration settings
  - `connected_at` (timestamptz)
  - `last_sync_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. integration_logs
  Tracks integration activity and sync operations.
  - `id` (uuid, primary key)
  - `integration_id` (uuid, foreign key)
  - `event_type` (text) - Type: Sync, Error, Config, Connect, Disconnect
  - `status` (text) - Status: Success, Failed, Warning
  - `message` (text)
  - `details` (jsonb)
  - `created_at` (timestamptz)

  ### 3. integration_webhooks
  Manages webhook configurations for real-time updates.
  - `id` (uuid, primary key)
  - `integration_id` (uuid, foreign key)
  - `event_types` (text[]) - Events to trigger webhook
  - `url` (text)
  - `secret` (text)
  - `is_active` (boolean)
  - `last_triggered_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 4. data_sync_queue
  Manages data synchronization between services.
  - `id` (uuid, primary key)
  - `integration_id` (uuid, foreign key)
  - `sync_type` (text) - Type: Import, Export, Bidirectional
  - `entity_type` (text) - Entity: Contact, Project, Event, Asset
  - `entity_id` (uuid)
  - `status` (text) - Status: Pending, Processing, Completed, Failed
  - `retry_count` (integer)
  - `error_message` (text)
  - `synced_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public access for demo purposes
*/

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  provider text NOT NULL,
  description text,
  icon_url text,
  is_connected boolean DEFAULT false,
  status text NOT NULL DEFAULT 'Inactive',
  config jsonb DEFAULT '{}',
  connected_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create integration_logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  status text NOT NULL,
  message text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create integration_webhooks table
CREATE TABLE IF NOT EXISTS integration_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  event_types text[] DEFAULT '{}',
  url text NOT NULL,
  secret text,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create data_sync_queue table
CREATE TABLE IF NOT EXISTS data_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  sync_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  status text NOT NULL DEFAULT 'Pending',
  retry_count integer DEFAULT 0,
  error_message text,
  synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_is_connected ON integrations(is_connected);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_event_type ON integration_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_integration_id ON integration_webhooks(integration_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_queue_integration_id ON data_sync_queue(integration_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_queue_status ON data_sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_data_sync_queue_entity_type ON data_sync_queue(entity_type);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for demo)
CREATE POLICY "Allow public read access to integrations"
  ON integrations FOR SELECT TO public USING (true);

CREATE POLICY "Allow anon insert to integrations"
  ON integrations FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon update to integrations"
  ON integrations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to integration_logs"
  ON integration_logs FOR SELECT TO public USING (true);

CREATE POLICY "Allow anon insert to integration_logs"
  ON integration_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public read access to integration_webhooks"
  ON integration_webhooks FOR SELECT TO public USING (true);

CREATE POLICY "Allow anon insert to integration_webhooks"
  ON integration_webhooks FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon update to integration_webhooks"
  ON integration_webhooks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to data_sync_queue"
  ON data_sync_queue FOR SELECT TO public USING (true);

CREATE POLICY "Allow anon insert to data_sync_queue"
  ON data_sync_queue FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon update to data_sync_queue"
  ON data_sync_queue FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert default integrations
INSERT INTO integrations (name, category, provider, description, icon_url, status) VALUES
  ('Gmail', 'Communication', 'Google', 'Connect your Gmail account for seamless email integration', 'https://api.dicebear.com/7.x/shapes/svg?seed=gmail', 'Inactive'),
  ('Google Calendar', 'Communication', 'Google', 'Sync events and schedules with Google Calendar', 'https://api.dicebear.com/7.x/shapes/svg?seed=gcal', 'Inactive'),
  ('Slack', 'Communication', 'Slack', 'Get notifications and updates in your Slack workspace', 'https://api.dicebear.com/7.x/shapes/svg?seed=slack', 'Inactive'),
  ('Zoom', 'Communication', 'Zoom', 'Schedule and manage video meetings directly from MediaFlow', 'https://api.dicebear.com/7.x/shapes/svg?seed=zoom', 'Inactive'),
  ('Google Drive', 'Storage', 'Google', 'Store and sync files with Google Drive', 'https://api.dicebear.com/7.x/shapes/svg?seed=gdrive', 'Inactive'),
  ('Dropbox', 'Storage', 'Dropbox', 'Backup and share files using Dropbox', 'https://api.dicebear.com/7.x/shapes/svg?seed=dropbox', 'Inactive'),
  ('QuickBooks', 'Financial', 'Intuit', 'Sync invoices and expenses with QuickBooks', 'https://api.dicebear.com/7.x/shapes/svg?seed=qb', 'Inactive'),
  ('Stripe', 'Financial', 'Stripe', 'Process payments and manage subscriptions', 'https://api.dicebear.com/7.x/shapes/svg?seed=stripe', 'Inactive'),
  ('Adobe Creative Cloud', 'Creative', 'Adobe', 'Connect to Adobe Creative Suite for asset management', 'https://api.dicebear.com/7.x/shapes/svg?seed=adobe', 'Inactive'),
  ('Frame.io', 'Creative', 'Frame.io', 'Review and approve video content collaboratively', 'https://api.dicebear.com/7.x/shapes/svg?seed=frameio', 'Inactive')
ON CONFLICT DO NOTHING;
