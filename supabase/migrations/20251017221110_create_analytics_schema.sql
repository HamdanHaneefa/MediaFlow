/*
  # Analytics and Reporting Schema

  ## Overview
  This migration creates tables for tracking business metrics, analytics, and reporting data.

  ## New Tables

  ### 1. revenue_tracking
  Tracks revenue from projects and clients.
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key)
  - `client_id` (uuid, foreign key)
  - `amount` (numeric) - Revenue amount
  - `type` (text) - Type: Invoice, Payment, Deposit, Refund
  - `status` (text) - Status: Pending, Paid, Overdue, Cancelled
  - `invoice_date` (date) - Invoice date
  - `due_date` (date) - Payment due date
  - `paid_date` (date) - Actual payment date
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 2. project_costs
  Tracks costs and expenses for projects.
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key)
  - `category` (text) - Category: Labor, Equipment, Location, Talent, Other
  - `description` (text)
  - `amount` (numeric)
  - `date` (date)
  - `created_at` (timestamptz)

  ### 3. client_satisfaction
  Tracks client satisfaction and feedback.
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key)
  - `client_id` (uuid, foreign key)
  - `satisfaction_score` (integer) - Score 1-10
  - `communication_rating` (integer) - Rating 1-5
  - `quality_rating` (integer) - Rating 1-5
  - `timeline_rating` (integer) - Rating 1-5
  - `feedback` (text)
  - `survey_date` (date)
  - `created_at` (timestamptz)

  ### 4. report_schedules
  Manages scheduled report generation.
  - `id` (uuid, primary key)
  - `name` (text)
  - `report_type` (text)
  - `frequency` (text) - Daily, Weekly, Monthly, Quarterly
  - `recipients` (text[]) - Email addresses
  - `filters` (jsonb) - Report filters
  - `last_run` (timestamptz)
  - `next_run` (timestamptz)
  - `is_active` (boolean)
  - `created_by` (uuid, foreign key)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public access for demo purposes
*/

-- Create revenue_tracking table
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  type text NOT NULL DEFAULT 'Invoice',
  status text NOT NULL DEFAULT 'Pending',
  invoice_date date,
  due_date date,
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create project_costs table
CREATE TABLE IF NOT EXISTS project_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  description text,
  amount numeric NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create client_satisfaction table
CREATE TABLE IF NOT EXISTS client_satisfaction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES contacts(id) ON DELETE SET NULL NOT NULL,
  satisfaction_score integer CHECK (satisfaction_score BETWEEN 1 AND 10),
  communication_rating integer CHECK (communication_rating BETWEEN 1 AND 5),
  quality_rating integer CHECK (quality_rating BETWEEN 1 AND 5),
  timeline_rating integer CHECK (timeline_rating BETWEEN 1 AND 5),
  feedback text,
  survey_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create report_schedules table
CREATE TABLE IF NOT EXISTS report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  report_type text NOT NULL,
  frequency text NOT NULL DEFAULT 'Monthly',
  recipients text[] DEFAULT '{}',
  filters jsonb DEFAULT '{}',
  last_run timestamptz,
  next_run timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES contacts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_project_id ON revenue_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_client_id ON revenue_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_status ON revenue_tracking(status);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_invoice_date ON revenue_tracking(invoice_date);
CREATE INDEX IF NOT EXISTS idx_project_costs_project_id ON project_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_category ON project_costs(category);
CREATE INDEX IF NOT EXISTS idx_project_costs_date ON project_costs(date);
CREATE INDEX IF NOT EXISTS idx_client_satisfaction_client_id ON client_satisfaction(client_id);
CREATE INDEX IF NOT EXISTS idx_client_satisfaction_project_id ON client_satisfaction(project_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run);

-- Enable Row Level Security
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_satisfaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for demo)
CREATE POLICY "Allow public read access to revenue_tracking"
  ON revenue_tracking FOR SELECT TO public USING (true);

CREATE POLICY "Allow anon insert to revenue_tracking"
  ON revenue_tracking FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon update to revenue_tracking"
  ON revenue_tracking FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to project_costs"
  ON project_costs FOR SELECT TO public USING (true);

CREATE POLICY "Allow anon insert to project_costs"
  ON project_costs FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public read access to client_satisfaction"
  ON client_satisfaction FOR SELECT TO public USING (true);

CREATE POLICY "Allow anon insert to client_satisfaction"
  ON client_satisfaction FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public read access to report_schedules"
  ON report_schedules FOR SELECT TO public USING (true);

CREATE POLICY "Allow anon insert to report_schedules"
  ON report_schedules FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon update to report_schedules"
  ON report_schedules FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon delete to report_schedules"
  ON report_schedules FOR DELETE TO anon, authenticated USING (true);
