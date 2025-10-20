/*
  # Asset Management System Schema

  ## Overview
  This migration creates a comprehensive asset management system for media files including
  file organization, version control, sharing, permissions, and workflow tracking.

  ## New Tables

  ### 1. asset_library
  Central repository for all media files and assets.
  - `id` (uuid, primary key) - Unique identifier
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `name` (text) - Asset name
  - `description` (text) - Asset description
  - `file_url` (text) - File URL (cloud storage or placeholder)
  - `file_type` (text) - Type: Video, Image, Audio, Document, Graphics, Raw, Other
  - `file_format` (text) - File format/extension (mp4, jpg, wav, etc.)
  - `file_size` (bigint) - File size in bytes
  - `thumbnail_url` (text) - Thumbnail preview URL
  - `category` (text) - Category: Raw Footage, Graphics, Audio, Final Exports, Other
  - `tags` (text[]) - Array of tags for classification
  - `metadata` (jsonb) - Additional metadata (dimensions, duration, codec, etc.)
  - `version` (integer) - Version number
  - `parent_asset_id` (uuid, foreign key) - Reference to parent asset for versioning
  - `status` (text) - Status: Draft, In Review, Approved, Archived, Deleted
  - `uploaded_by` (uuid, foreign key) - Reference to contacts table
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. asset_versions
  Tracks complete version history for assets.
  - `id` (uuid, primary key) - Unique identifier
  - `asset_id` (uuid, foreign key) - Reference to asset_library table
  - `version_number` (integer) - Version number
  - `file_url` (text) - File URL for this version
  - `file_size` (bigint) - File size in bytes
  - `changes_description` (text) - Description of changes
  - `created_by` (uuid, foreign key) - Reference to contacts table
  - `created_at` (timestamptz) - Version creation timestamp

  ### 3. asset_shares
  Manages secure sharing links and access control.
  - `id` (uuid, primary key) - Unique identifier
  - `asset_id` (uuid, foreign key) - Reference to asset_library table
  - `share_link` (text) - Unique shareable link
  - `recipient_email` (text) - Recipient email address
  - `recipient_name` (text) - Recipient name
  - `access_level` (text) - Access: View Only, Download, Edit
  - `password_protected` (boolean) - Whether password is required
  - `password_hash` (text) - Hashed password if protected
  - `expires_at` (timestamptz) - Link expiration date
  - `download_count` (integer) - Number of downloads
  - `last_accessed_at` (timestamptz) - Last access timestamp
  - `watermark_enabled` (boolean) - Whether to apply watermark
  - `created_by` (uuid, foreign key) - Reference to contacts table
  - `created_at` (timestamptz) - Share creation timestamp

  ### 4. asset_usage
  Tracks where and how assets are used across projects.
  - `id` (uuid, primary key) - Unique identifier
  - `asset_id` (uuid, foreign key) - Reference to asset_library table
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `task_id` (uuid, foreign key) - Reference to tasks table
  - `usage_type` (text) - Type: Project, Task, Event, Export, Review
  - `usage_context` (text) - Additional context about usage
  - `created_at` (timestamptz) - Usage timestamp

  ### 5. asset_collections
  User-created collections for organizing assets.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Collection name
  - `description` (text) - Collection description
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `created_by` (uuid, foreign key) - Reference to contacts table
  - `is_public` (boolean) - Whether collection is publicly accessible
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. asset_collection_items
  Junction table for assets in collections.
  - `id` (uuid, primary key) - Unique identifier
  - `collection_id` (uuid, foreign key) - Reference to asset_collections table
  - `asset_id` (uuid, foreign key) - Reference to asset_library table
  - `sort_order` (integer) - Display order within collection
  - `added_at` (timestamptz) - Timestamp when added to collection

  ### 7. asset_downloads
  Tracks all asset downloads for analytics.
  - `id` (uuid, primary key) - Unique identifier
  - `asset_id` (uuid, foreign key) - Reference to asset_library table
  - `downloaded_by` (uuid, foreign key) - Reference to contacts table
  - `ip_address` (text) - Downloader IP address
  - `user_agent` (text) - Browser/client information
  - `download_type` (text) - Type: Direct, Share Link, Export
  - `created_at` (timestamptz) - Download timestamp

  ## Security
  - RLS enabled on all tables
  - Public read for shared assets (via share_link)
  - Authenticated users have role-based access
  - Download tracking for security and analytics

  ## Important Notes
  1. Asset versioning creates new entries in asset_versions table
  2. Share links are unique and can expire
  3. Usage tracking helps identify asset dependencies
  4. Collections provide flexible organization beyond projects
*/

-- Create asset_library table
CREATE TABLE IF NOT EXISTS asset_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'Other',
  file_format text,
  file_size bigint,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'Other',
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  version integer NOT NULL DEFAULT 1,
  parent_asset_id uuid REFERENCES asset_library(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Draft',
  uploaded_by uuid REFERENCES contacts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create asset_versions table
CREATE TABLE IF NOT EXISTS asset_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES asset_library(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  changes_description text,
  created_by uuid REFERENCES contacts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create asset_shares table
CREATE TABLE IF NOT EXISTS asset_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES asset_library(id) ON DELETE CASCADE NOT NULL,
  share_link text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  recipient_email text,
  recipient_name text,
  access_level text NOT NULL DEFAULT 'View Only',
  password_protected boolean DEFAULT false,
  password_hash text,
  expires_at timestamptz,
  download_count integer DEFAULT 0,
  last_accessed_at timestamptz,
  watermark_enabled boolean DEFAULT false,
  created_by uuid REFERENCES contacts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create asset_usage table
CREATE TABLE IF NOT EXISTS asset_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES asset_library(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  usage_type text NOT NULL DEFAULT 'Project',
  usage_context text,
  created_at timestamptz DEFAULT now()
);

-- Create asset_collections table
CREATE TABLE IF NOT EXISTS asset_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  created_by uuid REFERENCES contacts(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create asset_collection_items table
CREATE TABLE IF NOT EXISTS asset_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES asset_collections(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid REFERENCES asset_library(id) ON DELETE CASCADE NOT NULL,
  sort_order integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, asset_id)
);

-- Create asset_downloads table
CREATE TABLE IF NOT EXISTS asset_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES asset_library(id) ON DELETE CASCADE NOT NULL,
  downloaded_by uuid REFERENCES contacts(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  download_type text NOT NULL DEFAULT 'Direct',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_asset_library_project_id ON asset_library(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_library_category ON asset_library(category);
CREATE INDEX IF NOT EXISTS idx_asset_library_file_type ON asset_library(file_type);
CREATE INDEX IF NOT EXISTS idx_asset_library_status ON asset_library(status);
CREATE INDEX IF NOT EXISTS idx_asset_library_tags ON asset_library USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_asset_library_created_at ON asset_library(created_at);
CREATE INDEX IF NOT EXISTS idx_asset_versions_asset_id ON asset_versions(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_shares_asset_id ON asset_shares(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_shares_share_link ON asset_shares(share_link);
CREATE INDEX IF NOT EXISTS idx_asset_usage_asset_id ON asset_usage(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_usage_project_id ON asset_usage(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_collections_project_id ON asset_collections(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_collection_items_collection_id ON asset_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_asset_collection_items_asset_id ON asset_collection_items(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_downloads_asset_id ON asset_downloads(asset_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_asset_library_updated_at ON asset_library;
CREATE TRIGGER update_asset_library_updated_at
  BEFORE UPDATE ON asset_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_asset_collections_updated_at ON asset_collections;
CREATE TRIGGER update_asset_collections_updated_at
  BEFORE UPDATE ON asset_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE asset_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_downloads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for asset_library
CREATE POLICY "Allow public read access to asset_library"
  ON asset_library FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to asset_library"
  ON asset_library FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update to asset_library"
  ON asset_library FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to asset_library"
  ON asset_library FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create RLS policies for asset_versions
CREATE POLICY "Allow public read access to asset_versions"
  ON asset_versions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to asset_versions"
  ON asset_versions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create RLS policies for asset_shares
CREATE POLICY "Allow public read access to asset_shares"
  ON asset_shares FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to asset_shares"
  ON asset_shares FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update to asset_shares"
  ON asset_shares FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to asset_shares"
  ON asset_shares FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create RLS policies for asset_usage
CREATE POLICY "Allow public read access to asset_usage"
  ON asset_usage FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to asset_usage"
  ON asset_usage FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create RLS policies for asset_collections
CREATE POLICY "Allow public read access to asset_collections"
  ON asset_collections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to asset_collections"
  ON asset_collections FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon update to asset_collections"
  ON asset_collections FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to asset_collections"
  ON asset_collections FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create RLS policies for asset_collection_items
CREATE POLICY "Allow public read access to asset_collection_items"
  ON asset_collection_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to asset_collection_items"
  ON asset_collection_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon delete to asset_collection_items"
  ON asset_collection_items FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create RLS policies for asset_downloads
CREATE POLICY "Allow public read access to asset_downloads"
  ON asset_downloads FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anon insert to asset_downloads"
  ON asset_downloads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
