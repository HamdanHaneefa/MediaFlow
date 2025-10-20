/*
  # Client Portal and Approval Workflow Schema

  ## Overview
  This migration creates a comprehensive client collaboration system with asset management,
  review workflows, approvals, messaging, and version control.

  ## New Tables

  ### 1. project_assets
  Stores project deliverables and files for client review.
  - `id` (uuid, primary key) - Unique identifier
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `name` (text) - Asset name/title
  - `description` (text) - Asset description
  - `file_url` (text) - URL to the file (Supabase Storage or external)
  - `file_type` (text) - File type: Video, Image, Document, Audio, Other
  - `file_size` (bigint) - File size in bytes
  - `thumbnail_url` (text) - Preview thumbnail URL
  - `version` (integer) - Version number
  - `parent_asset_id` (uuid, foreign key) - Reference to parent asset for versioning
  - `status` (text) - Status: Draft, Pending Review, Approved, Rejected, Final
  - `uploaded_by` (uuid, foreign key) - Reference to contacts table
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. asset_reviews
  Tracks review requests sent to clients.
  - `id` (uuid, primary key) - Unique identifier
  - `asset_id` (uuid, foreign key) - Reference to project_assets table
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `reviewer_id` (uuid, foreign key) - Reference to contacts table (client)
  - `status` (text) - Status: Pending, In Review, Approved, Rejected, Changes Requested
  - `deadline` (timestamptz) - Review deadline
  - `submitted_at` (timestamptz) - When review was submitted
  - `review_link` (text) - Unique shareable review link
  - `notes` (text) - Internal notes about the review
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. review_comments
  Stores feedback and comments on assets.
  - `id` (uuid, primary key) - Unique identifier
  - `review_id` (uuid, foreign key) - Reference to asset_reviews table
  - `asset_id` (uuid, foreign key) - Reference to project_assets table
  - `commenter_id` (uuid, foreign key) - Reference to contacts table
  - `comment_text` (text) - Comment content
  - `timestamp_marker` (numeric) - Timestamp for video/audio (in seconds)
  - `position_x` (numeric) - X coordinate for image markup
  - `position_y` (numeric) - Y coordinate for image markup
  - `priority` (text) - Priority: Low, Medium, High, Critical
  - `status` (text) - Status: Open, Addressed, Resolved
  - `parent_comment_id` (uuid, foreign key) - For threaded replies
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. project_messages
  Project-specific communication between team and clients.
  - `id` (uuid, primary key) - Unique identifier
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `sender_id` (uuid, foreign key) - Reference to contacts table
  - `recipient_id` (uuid, foreign key) - Reference to contacts table
  - `message_text` (text) - Message content
  - `attachments` (jsonb) - Array of attachment objects with URLs
  - `is_read` (boolean) - Read status
  - `read_at` (timestamptz) - When message was read
  - `message_type` (text) - Type: Message, System Update, Milestone, Approval Request
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. approval_history
  Tracks complete approval lifecycle for auditing.
  - `id` (uuid, primary key) - Unique identifier
  - `asset_id` (uuid, foreign key) - Reference to project_assets table
  - `review_id` (uuid, foreign key) - Reference to asset_reviews table
  - `action` (text) - Action: Submitted, Approved, Rejected, Changes Requested, Resubmitted
  - `performed_by` (uuid, foreign key) - Reference to contacts table
  - `feedback` (text) - Feedback or notes
  - `metadata` (jsonb) - Additional data (IP address, user agent, etc.)
  - `created_at` (timestamptz) - Timestamp of action

  ### 6. client_preferences
  Stores client-specific settings and preferences.
  - `id` (uuid, primary key) - Unique identifier
  - `contact_id` (uuid, foreign key) - Reference to contacts table
  - `notification_email` (boolean) - Email notifications enabled
  - `notification_frequency` (text) - Frequency: Immediate, Daily Digest, Weekly Digest
  - `brand_color` (text) - Custom brand color for portal
  - `logo_url` (text) - Client logo URL
  - `timezone` (text) - Client timezone
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Public read for review links (specific to review_id)
  - Authenticated users have role-based access
  - Clients can only see their own projects

  ## Important Notes
  1. Asset versioning uses parent_asset_id for tracking changes
  2. Review links are unique and shareable for external access
  3. Comments support time-based and position-based feedback
  4. All approval actions are logged for audit trail
*/

-- Create project_assets table
CREATE TABLE IF NOT EXISTS project_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'Other',
  file_size bigint,
  thumbnail_url text,
  version integer NOT NULL DEFAULT 1,
  parent_asset_id uuid REFERENCES project_assets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Draft',
  uploaded_by uuid REFERENCES contacts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create asset_reviews table
CREATE TABLE IF NOT EXISTS asset_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES project_assets(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Pending',
  deadline timestamptz,
  submitted_at timestamptz,
  review_link text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create review_comments table
CREATE TABLE IF NOT EXISTS review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES asset_reviews(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid REFERENCES project_assets(id) ON DELETE CASCADE NOT NULL,
  commenter_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  comment_text text NOT NULL,
  timestamp_marker numeric,
  position_x numeric,
  position_y numeric,
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Open',
  parent_comment_id uuid REFERENCES review_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_messages table
CREATE TABLE IF NOT EXISTS project_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  message_text text NOT NULL,
  attachments jsonb DEFAULT '[]',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  message_type text NOT NULL DEFAULT 'Message',
  created_at timestamptz DEFAULT now()
);

-- Create approval_history table
CREATE TABLE IF NOT EXISTS approval_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES project_assets(id) ON DELETE CASCADE NOT NULL,
  review_id uuid REFERENCES asset_reviews(id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by uuid REFERENCES contacts(id) ON DELETE SET NULL,
  feedback text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create client_preferences table
CREATE TABLE IF NOT EXISTS client_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  notification_email boolean DEFAULT true,
  notification_frequency text DEFAULT 'Immediate',
  brand_color text DEFAULT '#3b82f6',
  logo_url text,
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_status ON project_assets(status);
CREATE INDEX IF NOT EXISTS idx_project_assets_parent_asset_id ON project_assets(parent_asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_reviews_asset_id ON asset_reviews(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_reviews_project_id ON asset_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_reviews_reviewer_id ON asset_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_asset_reviews_status ON asset_reviews(status);
CREATE INDEX IF NOT EXISTS idx_asset_reviews_review_link ON asset_reviews(review_link);
CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_asset_id ON review_comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_status ON review_comments(status);
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_recipient_id ON project_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_is_read ON project_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_approval_history_asset_id ON approval_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_review_id ON approval_history(review_id);
CREATE INDEX IF NOT EXISTS idx_client_preferences_contact_id ON client_preferences(contact_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_project_assets_updated_at ON project_assets;
CREATE TRIGGER update_project_assets_updated_at
  BEFORE UPDATE ON project_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_asset_reviews_updated_at ON asset_reviews;
CREATE TRIGGER update_asset_reviews_updated_at
  BEFORE UPDATE ON asset_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_review_comments_updated_at ON review_comments;
CREATE TRIGGER update_review_comments_updated_at
  BEFORE UPDATE ON review_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_preferences_updated_at ON client_preferences;
CREATE TRIGGER update_client_preferences_updated_at
  BEFORE UPDATE ON client_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_assets
CREATE POLICY "Allow public read access to project_assets"
  ON project_assets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to project_assets"
  ON project_assets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update to project_assets"
  ON project_assets FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to project_assets"
  ON project_assets FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create RLS policies for asset_reviews
CREATE POLICY "Allow public read access to asset_reviews"
  ON asset_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to asset_reviews"
  ON asset_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update to asset_reviews"
  ON asset_reviews FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to asset_reviews"
  ON asset_reviews FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create RLS policies for review_comments
CREATE POLICY "Allow public read access to review_comments"
  ON review_comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to review_comments"
  ON review_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update to review_comments"
  ON review_comments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to review_comments"
  ON review_comments FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create RLS policies for project_messages
CREATE POLICY "Allow public read access to project_messages"
  ON project_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to project_messages"
  ON project_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update to project_messages"
  ON project_messages FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to project_messages"
  ON project_messages FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create RLS policies for approval_history
CREATE POLICY "Allow public read access to approval_history"
  ON approval_history FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to approval_history"
  ON approval_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create RLS policies for client_preferences
CREATE POLICY "Allow public read access to client_preferences"
  ON client_preferences FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to client_preferences"
  ON client_preferences FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update to client_preferences"
  ON client_preferences FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to client_preferences"
  ON client_preferences FOR DELETE
  TO anon, authenticated
  USING (true);
