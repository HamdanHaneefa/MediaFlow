/*
  # Proposals and Leads Schema

  ## Overview
  This migration creates the proposals and leads management system for MediaFlow CRM.
  
  ## New Tables
  
  ### 1. leads
  Stores potential clients and opportunities before they become projects.
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Lead name
  - `company` (text) - Company name
  - `email` (text) - Lead email
  - `phone` (text) - Lead phone
  - `status` (text) - Lead status: New, Contacted, Qualified, Proposal Sent, Negotiating, Won, Lost, Converted
  - `source` (text) - Lead source: Website, Referral, Cold Outreach, Social Media, Event, Partner, Other
  - `priority` (text) - Lead priority: Low, Medium, High, Hot
  - `estimated_value` (decimal) - Estimated project value
  - `estimated_close_date` (date) - Expected close date
  - `notes` (text) - Additional notes
  - `tags` (text[]) - Array of tags
  - `assigned_to` (uuid) - Assigned team member
  - `contact_date` (timestamptz) - When first contacted
  - `follow_up_date` (timestamptz) - Next follow-up date
  - `created_at` (timestamptz) - Created timestamp
  - `updated_at` (timestamptz) - Last updated timestamp

  ### 2. proposals
  Manages project proposals with status tracking and versioning.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Proposal title
  - `description` (text) - Proposal description
  - `proposal_number` (text) - Unique proposal number
  - `status` (text) - Status: Draft, Sent, Viewed, Accepted, Rejected, Expired, Cancelled
  - `type` (text) - Type: Standard, Custom, Quick Quote, Retainer, Package Deal
  - `lead_id` (uuid) - Related lead
  - `project_id` (uuid) - Related project (if converted)
  - `client_id` (uuid) - Related client contact
  - `amount` (decimal) - Proposal amount
  - `currency` (text) - Currency code
  - `valid_until` (date) - Proposal validity date
  - `sent_date` (timestamptz) - When sent to client
  - `viewed_date` (timestamptz) - When viewed by client
  - `accepted_date` (timestamptz) - When accepted
  - `rejected_date` (timestamptz) - When rejected
  - `rejection_reason` (text) - Reason for rejection
  - `terms` (text) - Terms and conditions
  - `notes` (text) - Internal notes
  - `created_by` (uuid) - Creator
  - `assigned_team_members` (uuid[]) - Team members involved
  - `document_url` (text) - URL to proposal document
  - `version` (integer) - Version number
  - `parent_proposal_id` (uuid) - Parent proposal if revision
  - `created_at` (timestamptz) - Created timestamp
  - `updated_at` (timestamptz) - Last updated timestamp

  ### 3. proposal_items
  Individual line items within proposals.
  - `id` (uuid, primary key) - Unique identifier
  - `proposal_id` (uuid) - Related proposal
  - `name` (text) - Item name
  - `description` (text) - Item description
  - `quantity` (decimal) - Quantity
  - `unit_price` (decimal) - Price per unit
  - `total` (decimal) - Total amount
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz) - Created timestamp

  ### 4. proposal_revisions
  Tracks revision history for proposals.
  - `id` (uuid, primary key) - Unique identifier
  - `proposal_id` (uuid) - Related proposal
  - `version` (integer) - Version number
  - `changes_summary` (text) - Summary of changes
  - `created_by` (uuid) - Who made the revision
  - `document_url` (text) - URL to revision document
  - `created_at` (timestamptz) - Created timestamp

  ### 5. proposal_activities
  Tracks all activities and interactions for proposals.
  - `id` (uuid, primary key) - Unique identifier
  - `proposal_id` (uuid) - Related proposal
  - `activity_type` (text) - Activity type: Created, Sent, Viewed, Accepted, Rejected, Revised, Expired, Cancelled
  - `description` (text) - Activity description
  - `performed_by` (uuid) - Who performed the activity
  - `metadata` (jsonb) - Additional activity data
  - `created_at` (timestamptz) - Activity timestamp

  ### 6. proposal_signatures
  Stores digital signatures for accepted proposals.
  - `id` (uuid, primary key) - Unique identifier
  - `proposal_id` (uuid) - Related proposal
  - `signer_name` (text) - Name of signer
  - `signer_email` (text) - Email of signer
  - `signature_data` (text) - Signature data (base64 encoded)
  - `signed_at` (timestamptz) - When signed
  - `ip_address` (inet) - IP address of signer

  ## Security
  Row Level Security (RLS) is enabled on all tables.
*/

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM public;

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    company text,
    email text NOT NULL,
    phone text,
    status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiating', 'Won', 'Lost', 'Converted')),
    source text NOT NULL DEFAULT 'Other' CHECK (source IN ('Website', 'Referral', 'Cold Outreach', 'Social Media', 'Event', 'Partner', 'Other')),
    priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Hot')),
    estimated_value decimal(15,2),
    estimated_close_date date,
    notes text,
    tags text[] DEFAULT '{}',
    assigned_to uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
    contact_date timestamptz,
    follow_up_date timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    proposal_number text UNIQUE NOT NULL,
    status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired', 'Cancelled')),
    type text NOT NULL DEFAULT 'Standard' CHECK (type IN ('Standard', 'Custom', 'Quick Quote', 'Retainer', 'Package Deal')),
    lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
    project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    client_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
    amount decimal(15,2) NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'USD',
    valid_until date,
    sent_date timestamptz,
    viewed_date timestamptz,
    accepted_date timestamptz,
    rejected_date timestamptz,
    rejection_reason text,
    terms text,
    notes text,
    created_by uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
    assigned_team_members uuid[] DEFAULT '{}',
    document_url text,
    version integer NOT NULL DEFAULT 1,
    parent_proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create proposal_items table
CREATE TABLE IF NOT EXISTS public.proposal_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    quantity decimal(10,2) NOT NULL DEFAULT 1,
    unit_price decimal(15,2) NOT NULL DEFAULT 0,
    total decimal(15,2) NOT NULL DEFAULT 0,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create proposal_revisions table
CREATE TABLE IF NOT EXISTS public.proposal_revisions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    version integer NOT NULL,
    changes_summary text NOT NULL,
    created_by uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
    document_url text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create proposal_activities table
CREATE TABLE IF NOT EXISTS public.proposal_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    activity_type text NOT NULL CHECK (activity_type IN ('Created', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Revised', 'Expired', 'Cancelled')),
    description text NOT NULL,
    performed_by uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create proposal_signatures table
CREATE TABLE IF NOT EXISTS public.proposal_signatures (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    signer_name text NOT NULL,
    signer_email text NOT NULL,
    signature_data text NOT NULL,
    signed_at timestamptz DEFAULT now() NOT NULL,
    ip_address inet
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_estimated_close_date ON public.leads(estimated_close_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_id ON public.proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON public.proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON public.proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_proposals_valid_until ON public.proposals(valid_until);

CREATE INDEX IF NOT EXISTS idx_proposal_items_proposal_id ON public.proposal_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_revisions_proposal_id ON public.proposal_revisions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_activities_proposal_id ON public.proposal_activities(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_signatures_proposal_id ON public.proposal_signatures(proposal_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate proposal number
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS text AS $$
DECLARE
    next_number integer;
    proposal_number text;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_number FROM '^PROP-(\d+)$') AS integer)), 0) + 1
    FROM public.proposals
    WHERE proposal_number ~ '^PROP-\d+$'
    INTO next_number;
    
    -- Format the proposal number
    proposal_number := 'PROP-' || LPAD(next_number::text, 4, '0');
    
    RETURN proposal_number;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_signatures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Enable read access for all users" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.leads FOR DELETE USING (true);

-- Create RLS policies for proposals
CREATE POLICY "Enable read access for all users" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.proposals FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.proposals FOR DELETE USING (true);

-- Create RLS policies for proposal_items
CREATE POLICY "Enable read access for all users" ON public.proposal_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.proposal_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.proposal_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.proposal_items FOR DELETE USING (true);

-- Create RLS policies for proposal_revisions
CREATE POLICY "Enable read access for all users" ON public.proposal_revisions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.proposal_revisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.proposal_revisions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.proposal_revisions FOR DELETE USING (true);

-- Create RLS policies for proposal_activities
CREATE POLICY "Enable read access for all users" ON public.proposal_activities FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.proposal_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.proposal_activities FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.proposal_activities FOR DELETE USING (true);

-- Create RLS policies for proposal_signatures
CREATE POLICY "Enable read access for all users" ON public.proposal_signatures FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.proposal_signatures FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.proposal_signatures FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.proposal_signatures FOR DELETE USING (true);
