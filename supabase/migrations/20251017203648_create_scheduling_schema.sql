/*
  # Production Scheduling Schema

  ## Overview
  This migration adds comprehensive scheduling capabilities for media production workflows including
  events, shoots, equipment, locations, and crew management.

  ## New Tables

  ### 1. events
  Stores calendar events including shoots, meetings, deadlines, and milestones.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Event title
  - `description` (text) - Event description
  - `event_type` (text) - Type: Shoot, Meeting, Deadline, Milestone, Delivery
  - `start_time` (timestamptz) - Event start date and time
  - `end_time` (timestamptz) - Event end date and time
  - `project_id` (uuid, foreign key) - Reference to projects table
  - `location_id` (uuid, foreign key) - Reference to locations table
  - `attendees` (uuid[]) - Array of contact IDs attending the event
  - `equipment_needed` (uuid[]) - Array of equipment IDs needed
  - `status` (text) - Status: Scheduled, In Progress, Completed, Cancelled
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. equipment
  Manages production equipment inventory and availability.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Equipment name
  - `category` (text) - Category: Camera, Lighting, Audio, Grip, Post-Production
  - `description` (text) - Equipment description
  - `status` (text) - Status: Available, In Use, Maintenance, Retired
  - `daily_rate` (numeric) - Daily rental rate if applicable
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. locations
  Manages shooting locations and venues.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Location name
  - `address` (text) - Full address
  - `type` (text) - Type: Studio, Outdoor, Indoor, Remote
  - `contact_person` (uuid, foreign key) - Reference to contacts table
  - `capacity` (integer) - Maximum capacity
  - `amenities` (text[]) - Available amenities
  - `hourly_rate` (numeric) - Hourly rental rate if applicable
  - `notes` (text) - Additional notes
  - `status` (text) - Status: Available, Booked, Unavailable
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. crew_availability
  Tracks crew member availability for scheduling.
  - `id` (uuid, primary key) - Unique identifier
  - `contact_id` (uuid, foreign key) - Reference to contacts table
  - `date` (date) - Availability date
  - `status` (text) - Status: Available, Booked, Tentative, Unavailable
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. equipment_bookings
  Tracks equipment bookings for events.
  - `id` (uuid, primary key) - Unique identifier
  - `equipment_id` (uuid, foreign key) - Reference to equipment table
  - `event_id` (uuid, foreign key) - Reference to events table
  - `start_time` (timestamptz) - Booking start time
  - `end_time` (timestamptz) - Booking end time
  - `status` (text) - Status: Reserved, In Use, Returned, Cancelled
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Public read access for demonstration
  - Authenticated users have full CRUD access

  ## Important Notes
  1. All timestamps use timestamptz for timezone awareness
  2. Foreign keys ensure data integrity
  3. Array fields enable flexible many-to-many relationships
  4. Indexes optimize common query patterns
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'Meeting',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  location_id uuid,
  attendees uuid[] DEFAULT '{}',
  equipment_needed uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'Scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Camera',
  description text,
  status text NOT NULL DEFAULT 'Available',
  daily_rate numeric(10, 2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  type text NOT NULL DEFAULT 'Studio',
  contact_person uuid REFERENCES contacts(id) ON DELETE SET NULL,
  capacity integer,
  amenities text[] DEFAULT '{}',
  hourly_rate numeric(10, 2),
  notes text,
  status text NOT NULL DEFAULT 'Available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crew_availability table
CREATE TABLE IF NOT EXISTS crew_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'Available',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(contact_id, date)
);

-- Create equipment_bookings table
CREATE TABLE IF NOT EXISTS equipment_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'Reserved',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for location_id in events (after locations table is created)
ALTER TABLE events ADD CONSTRAINT fk_events_location
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations(status);
CREATE INDEX IF NOT EXISTS idx_crew_availability_contact_id ON crew_availability(contact_id);
CREATE INDEX IF NOT EXISTS idx_crew_availability_date ON crew_availability(date);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_equipment_id ON equipment_bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_event_id ON equipment_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_equipment_bookings_start_time ON equipment_bookings(start_time);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crew_availability_updated_at ON crew_availability;
CREATE TRIGGER update_crew_availability_updated_at
  BEFORE UPDATE ON crew_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_bookings_updated_at ON equipment_bookings;
CREATE TRIGGER update_equipment_bookings_updated_at
  BEFORE UPDATE ON equipment_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
CREATE POLICY "Allow public read access to events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for equipment
CREATE POLICY "Allow public read access to equipment"
  ON equipment FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for locations
CREATE POLICY "Allow public read access to locations"
  ON locations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to locations"
  ON locations FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for crew_availability
CREATE POLICY "Allow public read access to crew_availability"
  ON crew_availability FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to crew_availability"
  ON crew_availability FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to crew_availability"
  ON crew_availability FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to crew_availability"
  ON crew_availability FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for equipment_bookings
CREATE POLICY "Allow public read access to equipment_bookings"
  ON equipment_bookings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert to equipment_bookings"
  ON equipment_bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to equipment_bookings"
  ON equipment_bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to equipment_bookings"
  ON equipment_bookings FOR DELETE
  TO authenticated
  USING (true);