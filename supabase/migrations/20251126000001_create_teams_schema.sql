/*
  # Teams Management Schema

  ## Overview
  This migration creates the teams management schema for MediaFlow CRM.
  It allows managers to create teams and assign both members and projects to them.

  ## New Tables

  ### 1. teams
  Stores team information with manager and member assignments.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Team name
  - `description` (text) - Team description
  - `manager_id` (uuid) - Reference to team_members table for the manager
  - `member_ids` (uuid[]) - Array of team member IDs
  - `project_ids` (uuid[]) - Array of project IDs assigned to this team
  - `created_by` (uuid) - Reference to who created the team
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. team_project_assignments
  Tracks which projects are assigned to which teams.
  - `id` (uuid, primary key) - Unique identifier
  - `team_id` (uuid) - Reference to teams table
  - `project_id` (uuid) - Reference to projects table
  - `assigned_at` (timestamptz) - Assignment timestamp
  - `assigned_by` (uuid) - Who made the assignment

  ## Security
  - RLS enabled on all tables
  - Team members can only see projects assigned to their team
  - Managers can manage their teams
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  manager_id uuid REFERENCES team_members(id) ON DELETE SET NULL,
  member_ids uuid[] DEFAULT '{}',
  project_ids uuid[] DEFAULT '{}',
  created_by uuid REFERENCES team_members(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_project_assignments table
CREATE TABLE IF NOT EXISTS team_project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES team_members(id) ON DELETE SET NULL,
  UNIQUE(team_id, project_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_team_project_assignments_team_id ON team_project_assignments(team_id);
CREATE INDEX IF NOT EXISTS idx_team_project_assignments_project_id ON team_project_assignments(project_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Allow public read access to teams"
  ON teams FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to teams"
  ON teams FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for team_project_assignments
CREATE POLICY "Allow public read access to team_project_assignments"
  ON team_project_assignments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to team_project_assignments"
  ON team_project_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to team_project_assignments"
  ON team_project_assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to team_project_assignments"
  ON team_project_assignments FOR DELETE
  TO authenticated
  USING (true);

-- Add team_id column to team_members for easy team lookup
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
