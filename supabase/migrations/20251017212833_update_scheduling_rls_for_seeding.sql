/*
  # Update Scheduling Table RLS Policies for Seeding

  ## Overview
  This migration updates RLS policies for scheduling tables to allow public inserts for demonstration and seeding purposes.

  ## Changes
  - Update events, equipment, locations, crew_availability, and equipment_bookings policies
  - Allow anon users to insert, update, and delete data
  - Suitable for demonstration purposes

  ## Security Notes
  - These permissive policies are for development/demo only
  - Production deployments should restrict to authenticated users
*/

-- Drop existing insert policies for scheduling tables
DROP POLICY IF EXISTS "Allow authenticated insert to events" ON events;
DROP POLICY IF EXISTS "Allow authenticated insert to equipment" ON equipment;
DROP POLICY IF EXISTS "Allow authenticated insert to locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated insert to crew_availability" ON crew_availability;
DROP POLICY IF EXISTS "Allow authenticated insert to equipment_bookings" ON equipment_bookings;

-- Create new policies that allow public insert
CREATE POLICY "Allow anon insert to events"
  ON events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon insert to equipment"
  ON equipment FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon insert to locations"
  ON locations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon insert to crew_availability"
  ON crew_availability FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon insert to equipment_bookings"
  ON equipment_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update existing update policies
DROP POLICY IF EXISTS "Allow authenticated update to events" ON events;
DROP POLICY IF EXISTS "Allow authenticated update to equipment" ON equipment;
DROP POLICY IF EXISTS "Allow authenticated update to locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated update to crew_availability" ON crew_availability;
DROP POLICY IF EXISTS "Allow authenticated update to equipment_bookings" ON equipment_bookings;

CREATE POLICY "Allow anon update to events"
  ON events FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update to equipment"
  ON equipment FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update to locations"
  ON locations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update to crew_availability"
  ON crew_availability FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon update to equipment_bookings"
  ON equipment_bookings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Update delete policies
DROP POLICY IF EXISTS "Allow authenticated delete to events" ON events;
DROP POLICY IF EXISTS "Allow authenticated delete to equipment" ON equipment;
DROP POLICY IF EXISTS "Allow authenticated delete to locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated delete to crew_availability" ON crew_availability;
DROP POLICY IF EXISTS "Allow authenticated delete to equipment_bookings" ON equipment_bookings;

CREATE POLICY "Allow anon delete to events"
  ON events FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon delete to equipment"
  ON equipment FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon delete to locations"
  ON locations FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon delete to crew_availability"
  ON crew_availability FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon delete to equipment_bookings"
  ON equipment_bookings FOR DELETE
  TO anon, authenticated
  USING (true);
