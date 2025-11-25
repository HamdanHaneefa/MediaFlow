/*
  # Team Management Schema

  ## Overview
  This migration creates the team management schema for MediaFlow CRM.

  ## New Tables

  ### 1. team_members
  Stores team member information including roles, permissions, and performance metrics.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users if applicable
  - `name` (text) - Full name
  - `email` (text, unique) - Email address
  - `phone` (text) - Phone number
  - `avatar_url` (text) - Avatar image URL
  - `role` (text) - Team role
  - `status` (text) - Member status
  - `permissions` (jsonb) - Permission settings
  - `hourly_rate` (numeric) - Hourly billing rate
  - `emergency_contact` (jsonb) - Emergency contact information
  - `skills` (text[]) - Array of skills
  - `bio` (text) - Biography/description
  - `hire_date` (date) - Hire date
  - `assigned_projects` (uuid[]) - Array of project IDs
  - `performance_metrics` (jsonb) - Performance tracking data
  - `invitation_status` (text) - Invitation status
  - `invited_at` (timestamptz) - When invited
  - `invited_by` (uuid) - Who sent the invitation
  - `last_active` (timestamptz) - Last activity timestamp
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. team_invitations
  Manages team invitations sent via email.
  - `id` (uuid, primary key) - Unique identifier
  - `email` (text) - Invitee email
  - `role` (text) - Invited role
  - `permissions` (jsonb) - Permission settings
  - `invited_by` (uuid) - Who sent the invitation
  - `invitation_token` (text) - Unique invitation token
  - `expires_at` (timestamptz) - Expiration timestamp
  - `status` (text) - Invitation status
  - `message` (text) - Personal message
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. project_assignments
  Tracks team member assignments to projects.
  - `id` (uuid, primary key) - Unique identifier
  - `project_id` (uuid) - Reference to projects table
  - `team_member_id` (uuid) - Reference to team_members table
  - `role_in_project` (text) - Role in this specific project
  - `assigned_at` (timestamptz) - Assignment timestamp
  - `assigned_by` (uuid) - Who made the assignment
  - `is_lead` (boolean) - Is project lead
  - `responsibilities` (text[]) - Array of responsibilities
  - `hourly_rate_override` (numeric) - Project-specific rate override

  ## Security
  - RLS enabled on all tables
  - Proper access controls for team management
*/

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'Assistant',
  status text NOT NULL DEFAULT 'Active',
  permissions jsonb DEFAULT '{
    "can_manage_projects": false,
    "can_send_proposals": false,
    "can_approve_expenses": false,
    "can_manage_team": false,
    "can_view_financials": false,
    "can_manage_assets": false,
    "can_access_client_portal": false
  }'::jsonb,
  hourly_rate numeric(8, 2),
  emergency_contact jsonb,
  skills text[] DEFAULT '{}',
  bio text,
  hire_date date DEFAULT CURRENT_DATE,
  assigned_projects uuid[] DEFAULT '{}',
  performance_metrics jsonb,
  invitation_status text DEFAULT 'Accepted',
  invited_at timestamptz,
  invited_by uuid REFERENCES team_members(id) ON DELETE SET NULL,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'Assistant',
  permissions jsonb DEFAULT '{
    "can_manage_projects": false,
    "can_send_proposals": false,
    "can_approve_expenses": false,
    "can_manage_team": false,
    "can_view_financials": false,
    "can_manage_assets": false,
    "can_access_client_portal": false
  }'::jsonb,
  invited_by uuid REFERENCES team_members(id) ON DELETE SET NULL,
  invitation_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_assignments table
CREATE TABLE IF NOT EXISTS project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  role_in_project text NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES team_members(id) ON DELETE SET NULL,
  is_lead boolean DEFAULT false,
  responsibilities text[] DEFAULT '{}',
  hourly_rate_override numeric(8, 2)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_team_member_id ON project_assignments(team_member_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_invitations_updated_at ON team_invitations;
CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team_members
CREATE POLICY "Allow public read access to team_members"
  ON team_members FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to team_members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to team_members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to team_members"
  ON team_members FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for team_invitations
CREATE POLICY "Allow public read access to team_invitations"
  ON team_invitations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to team_invitations"
  ON team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to team_invitations"
  ON team_invitations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to team_invitations"
  ON team_invitations FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for project_assignments
CREATE POLICY "Allow public read access to project_assignments"
  ON project_assignments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to project_assignments"
  ON project_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to project_assignments"
  ON project_assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to project_assignments"
  ON project_assignments FOR DELETE
  TO authenticated
  USING (true);
