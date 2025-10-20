/*
  # Update RLS policies to allow public insert for seeding

  This migration temporarily updates RLS policies to allow public inserts for demonstration/seeding purposes.
  
  ## Changes
  - Update policies to allow anon users to insert data
  - This is suitable for demonstration purposes but should be restricted in production
*/

-- Drop existing insert policies
DROP POLICY IF EXISTS "Allow authenticated insert to contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated insert to projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated insert to tasks" ON tasks;

-- Create new policies that allow public insert (for demo/seed purposes)
CREATE POLICY "Allow anon insert to contacts"
  ON contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon insert to projects"
  ON projects FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon insert to tasks"
  ON tasks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update policies are also needed
DROP POLICY IF EXISTS "Allow authenticated update to contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated update to projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated update to tasks" ON tasks;

CREATE POLICY "Allow anon update to contacts"
  ON contacts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update to projects"
  ON projects FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update to tasks"
  ON tasks FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Update delete policies
DROP POLICY IF EXISTS "Allow authenticated delete to contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated delete to projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated delete to tasks" ON tasks;

CREATE POLICY "Allow anon delete to contacts"
  ON contacts FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon delete to projects"
  ON projects FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon delete to tasks"
  ON tasks FOR DELETE
  TO anon, authenticated
  USING (true);