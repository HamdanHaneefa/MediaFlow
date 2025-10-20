/*
  # MediaFlow CRM Database Schema

  ## Overview
  This migration creates the core database schema for MediaFlow CRM, a production management system for media companies.

  ## New Tables

  ### 1. contacts
  Stores all contact information including clients, vendors, freelancers, and partners.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Contact full name
  - `email` (text, unique) - Contact email address
  - `phone` (text) - Contact phone number
  - `company` (text) - Company name
  - `role` (text) - Contact role: Client, Vendor, Freelancer, Partner
  - `status` (text) - Contact status: Active, Inactive, Prospect
  - `notes` (text) - Additional notes about the contact
  - `tags` (text[]) - Array of tags for categorization
  - `created_at` (timestamptz) - Timestamp when record was created
  - `updated_at` (timestamptz) - Timestamp when record was last updated

  ### 2. projects
  Manages production projects with budgets, timelines, and team assignments.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Project title
  - `description` (text) - Project description
  - `type` (text) - Project type: Commercial, Documentary, Music Video, Corporate, etc.
  - `status` (text) - Project status: Active, On Hold, Completed, Cancelled
  - `phase` (text) - Production phase: Pre-production, Production, Post-production, Delivered
  - `client_id` (uuid, foreign key) - Reference to contacts table
  - `budget` (numeric) - Project budget amount
  - `start_date` (date) - Project start date
  - `end_date` (date) - Project end date
  - `team_members` (uuid[]) - Array of contact IDs for team members
  - `created_at` (timestamptz) - Timestamp when record was created
  - `updated_at` (timestamptz) - Timestamp when record was last updated

  ### 3. tasks
  Tracks individual tasks within projects with assignments and priorities.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Task title
  - `description` (text) - Task description
  - `status` (text) - Task status: To Do, In Progress, In Review, Completed
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `assigned_to` (uuid, foreign key) - Reference to contacts table
  - `due_date` (date) - Task due date
  - `priority` (text) - Priority level: High, Medium, Low
  - `type` (text) - Task type: Creative, Technical, Administrative
  - `created_at` (timestamptz) - Timestamp when record was created
  - `updated_at` (timestamptz) - Timestamp when record was last updated

  ## Security
  - RLS (Row Level Security) enabled on all tables
  - Public read access for demonstration purposes
  - Full CRUD access for authenticated users

  ## Notes
  1. All tables use UUID primary keys for scalability
  2. Foreign keys ensure referential integrity
  3. Timestamps are automatically managed by database triggers
  4. Array fields allow flexible many-to-many relationships
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  company text,
  role text NOT NULL DEFAULT 'Client',
  status text NOT NULL DEFAULT 'Active',
  notes text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'Commercial',
  status text NOT NULL DEFAULT 'Active',
  phase text NOT NULL DEFAULT 'Pre-production',
  client_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  budget numeric(12, 2),
  start_date date,
  end_date date,
  team_members uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'To Do',
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES contacts(id) ON DELETE SET NULL,
  due_date date,
  priority text NOT NULL DEFAULT 'Medium',
  type text NOT NULL DEFAULT 'Administrative',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(role);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
CREATE POLICY "Allow public read access to contacts"
  ON contacts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for projects
CREATE POLICY "Allow public read access to projects"
  ON projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for tasks
CREATE POLICY "Allow public read access to tasks"
  ON tasks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);