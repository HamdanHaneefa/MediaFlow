-- Create accounting tables for expense and income management

-- Create expense categories enum
CREATE TYPE expense_category AS ENUM (
  'Equipment Rental',
  'Location',
  'Travel',
  'Catering',
  'Crew',
  'Post Production',
  'Marketing',
  'Office Supplies',
  'Utilities',
  'Insurance',
  'Legal',
  'Other'
);

-- Create expense status enum
CREATE TYPE expense_status AS ENUM (
  'Draft',
  'Submitted',
  'Approved',
  'Rejected',
  'Paid',
  'Reimbursed'
);

-- Create income type enum
CREATE TYPE income_type AS ENUM (
  'Project Payment',
  'Deposit',
  'Final Payment',
  'Additional Services',
  'Other'
);

-- Create income status enum
CREATE TYPE income_status AS ENUM (
  'Expected',
  'Received',
  'Overdue',
  'Cancelled'
);

-- Create transaction type enum
CREATE TYPE transaction_type AS ENUM (
  'Income',
  'Expense',
  'Transfer'
);

-- Create transaction status enum
CREATE TYPE transaction_status AS ENUM (
  'Pending',
  'Reconciled',
  'Failed'
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  category expense_category NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  receipt_filename VARCHAR,
  vendor VARCHAR,
  status expense_status NOT NULL DEFAULT 'Draft',
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create income table
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  income_type income_type NOT NULL,
  expected_date DATE,
  received_date DATE,
  status income_status NOT NULL DEFAULT 'Expected',
  invoice_number VARCHAR,
  client_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create financial transactions table
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  income_id UUID REFERENCES income(id) ON DELETE SET NULL,
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  status transaction_status NOT NULL DEFAULT 'Pending',
  reference_number VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create expense approval rules table
CREATE TABLE expense_approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category expense_category,
  amount_threshold DECIMAL(12,2),
  approver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  require_receipt BOOLEAN NOT NULL DEFAULT true,
  auto_approve BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_submitted_by ON expenses(submitted_by);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

CREATE INDEX idx_income_project_id ON income(project_id);
CREATE INDEX idx_income_client_id ON income(client_id);
CREATE INDEX idx_income_status ON income(status);
CREATE INDEX idx_income_expected_date ON income(expected_date);

CREATE INDEX idx_financial_transactions_project_id ON financial_transactions(project_id);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_approval_rules_updated_at BEFORE UPDATE ON expense_approval_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approval_rules ENABLE ROW LEVEL SECURITY;

-- Expenses policies
CREATE POLICY "Users can view all expenses" ON expenses
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own draft expenses" ON expenses
  FOR UPDATE USING (auth.uid() = submitted_by AND status = 'Draft');

CREATE POLICY "Managers can approve/reject submitted expenses" ON expenses
  FOR UPDATE USING (status = 'Submitted');

-- Income policies
CREATE POLICY "Users can view all income" ON income
  FOR SELECT USING (true);

CREATE POLICY "Users can manage income entries" ON income
  FOR ALL USING (true);

-- Financial transactions policies
CREATE POLICY "Users can view all transactions" ON financial_transactions
  FOR SELECT USING (true);

CREATE POLICY "System can manage transactions" ON financial_transactions
  FOR ALL USING (true);

-- Expense approval rules policies
CREATE POLICY "Users can view approval rules" ON expense_approval_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage approval rules" ON expense_approval_rules
  FOR ALL USING (true);

-- Insert some sample data
INSERT INTO expense_approval_rules (category, amount_threshold, approver_id, require_receipt) VALUES
  ('Equipment Rental', 1000.00, (SELECT id FROM auth.users LIMIT 1), true),
  ('Location', 500.00, (SELECT id FROM auth.users LIMIT 1), true),
  ('Travel', 300.00, (SELECT id FROM auth.users LIMIT 1), false),
  ('Catering', 200.00, (SELECT id FROM auth.users LIMIT 1), false);

-- Create a view for project financial summary
CREATE VIEW project_financial_summary AS
SELECT 
  p.id as project_id,
  p.title as project_title,
  COALESCE(SUM(i.amount), 0) as total_income,
  COALESCE(SUM(e.amount), 0) as total_expenses,
  COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0) as net_profit,
  CASE 
    WHEN COALESCE(SUM(i.amount), 0) > 0 
    THEN ((COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0)) / SUM(i.amount) * 100)
    ELSE 0 
  END as profit_margin_percent
FROM projects p
LEFT JOIN income i ON i.project_id = p.id AND i.status = 'Received'
LEFT JOIN expenses e ON e.project_id = p.id AND e.status IN ('Approved', 'Paid')
GROUP BY p.id, p.title;
