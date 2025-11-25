import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  Expense, 
  Income, 
  FinancialTransaction, 
  ExpenseCategory, 
  ExpenseStatus,
  IncomeStatus,
  ProjectFinancialSummary 
} from '../types';

interface AccountingContextType {
  expenses: Expense[];
  income: Income[];
  transactions: FinancialTransaction[];
  loading: boolean;
  
  // Expense Management
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  approveExpense: (id: string) => Promise<void>;
  rejectExpense: (id: string, reason: string) => Promise<void>;
  
  // Income Management
  addIncome: (income: Omit<Income, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  
  // Financial Reporting
  getProjectFinancialSummary: (projectId: string) => ProjectFinancialSummary | null;
  getExpensesByCategory: () => Record<ExpenseCategory, number>;
  getExpensesByProject: () => Record<string, number>;
  
  // Filtering
  filteredExpenses: Expense[];
  filteredIncome: Income[];
  setExpenseFilters: (filters: ExpenseFilters) => void;
  setIncomeFilters: (filters: IncomeFilters) => void;
}

interface ExpenseFilters {
  projectId?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
  submittedBy?: string;
}

interface IncomeFilters {
  projectId?: string;
  status?: IncomeStatus;
  startDate?: string;
  endDate?: string;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (context === undefined) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
}

interface AccountingProviderProps {
  children: ReactNode;
}

export function AccountingProvider({ children }: AccountingProviderProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [transactions] = useState<FinancialTransaction[]>([]);
  const [loading] = useState(false);
  const [expenseFilters, setExpenseFilters] = useState<ExpenseFilters>({});
  const [incomeFilters, setIncomeFilters] = useState<IncomeFilters>({});

  const generateSampleData = useCallback(() => {
    const sampleExpenses: Expense[] = [
      {
        id: '1',
        project_id: 'proj-1',
        title: 'Camera Equipment Rental',
        description: 'Sony FX9 camera rental for 3 days',
        amount: 1200.00,
        category: 'Equipment Rental',
        expense_date: '2024-11-20',
        receipt_url: '/receipts/camera-rental.pdf',
        receipt_filename: 'camera-rental.pdf',
        vendor: 'Pro Camera Rental',
        status: 'Approved',
        submitted_by: 'john.doe@example.com',
        approved_by: 'manager@example.com',
        approved_at: '2024-11-21T10:00:00Z',
        created_at: '2024-11-20T09:00:00Z',
        updated_at: '2024-11-21T10:00:00Z'
      },
      {
        id: '2',
        project_id: 'proj-1',
        title: 'Location Fees',
        description: 'Studio rental for corporate video shoot',
        amount: 800.00,
        category: 'Location',
        expense_date: '2024-11-22',
        vendor: 'Downtown Studios',
        status: 'Submitted',
        submitted_by: 'jane.smith@example.com',
        created_at: '2024-11-22T14:30:00Z',
        updated_at: '2024-11-22T14:30:00Z'
      },
      {
        id: '3',
        project_id: 'proj-2',
        title: 'Catering Services',
        description: 'Lunch for cast and crew (15 people)',
        amount: 450.00,
        category: 'Catering',
        expense_date: '2024-11-23',
        receipt_url: '/receipts/catering.pdf',
        receipt_filename: 'catering-invoice.pdf',
        vendor: 'Fresh Bites Catering',
        status: 'Draft',
        submitted_by: 'mike.wilson@example.com',
        created_at: '2024-11-23T12:00:00Z',
        updated_at: '2024-11-23T12:00:00Z'
      }
    ];

    const sampleIncome: Income[] = [
      {
        id: '1',
        project_id: 'proj-1',
        title: 'Corporate Video - Initial Payment',
        description: '50% deposit for corporate promotional video',
        amount: 5000.00,
        income_type: 'Deposit',
        expected_date: '2024-11-15',
        received_date: '2024-11-16',
        status: 'Received',
        invoice_number: 'INV-2024-001',
        client_id: 'client-1',
        created_at: '2024-11-10T00:00:00Z',
        updated_at: '2024-11-16T10:00:00Z'
      },
      {
        id: '2',
        project_id: 'proj-1',
        title: 'Corporate Video - Final Payment',
        description: 'Remaining 50% payment upon delivery',
        amount: 5000.00,
        income_type: 'Final Payment',
        expected_date: '2024-12-01',
        status: 'Expected',
        invoice_number: 'INV-2024-002',
        client_id: 'client-1',
        created_at: '2024-11-10T00:00:00Z',
        updated_at: '2024-11-10T00:00:00Z'
      }
    ];

    setExpenses(sampleExpenses);
    setIncome(sampleIncome);
  }, []);

  // Initialize sample data on mount
  useEffect(() => {
    generateSampleData();
  }, [generateSampleData]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setExpenses(prev => [...prev, newExpense]);
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id 
        ? { ...expense, ...updates, updated_at: new Date().toISOString() }
        : expense
    ));
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const approveExpense = useCallback(async (id: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id 
        ? { 
            ...expense, 
            status: 'Approved',
            approved_by: 'current-user@example.com',
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          }
        : expense
    ));
  }, []);

  const rejectExpense = useCallback(async (id: string, reason: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id 
        ? { 
            ...expense, 
            status: 'Rejected',
            rejection_reason: reason,
            updated_at: new Date().toISOString() 
          }
        : expense
    ));
  }, []);

  const addIncome = useCallback(async (income: Omit<Income, 'id' | 'created_at' | 'updated_at'>) => {
    const newIncome: Income = {
      ...income,
      id: `inc-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setIncome(prev => [...prev, newIncome]);
  }, []);

  const updateIncome = useCallback(async (id: string, updates: Partial<Income>) => {
    setIncome(prev => prev.map(income => 
      income.id === id 
        ? { ...income, ...updates, updated_at: new Date().toISOString() }
        : income
    ));
  }, []);

  const deleteIncome = useCallback(async (id: string) => {
    setIncome(prev => prev.filter(income => income.id !== id));
  }, []);

  const getProjectFinancialSummary = useCallback((projectId: string): ProjectFinancialSummary | null => {
    const projectExpenses = expenses.filter(exp => exp.project_id === projectId);
    const projectIncome = income.filter(inc => inc.project_id === projectId);

    const totalExpenses = projectExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = projectIncome.reduce((sum, inc) => sum + inc.amount, 0);
    const pendingExpenses = projectExpenses
      .filter(exp => ['Draft', 'Submitted'].includes(exp.status))
      .reduce((sum, exp) => sum + exp.amount, 0);
    const pendingIncome = projectIncome
      .filter(inc => inc.status === 'Expected')
      .reduce((sum, inc) => sum + inc.amount, 0);

    const expenseByCategory = projectExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return {
      project_id: projectId,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: totalIncome - totalExpenses,
      pending_expenses: pendingExpenses,
      pending_income: pendingIncome,
      expense_by_category: expenseByCategory
    };
  }, [expenses, income]);

  const getExpensesByCategory = useCallback(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  }, [expenses]);

  const getExpensesByProject = useCallback(() => {
    return expenses.reduce((acc, expense) => {
      if (expense.project_id) {
        acc[expense.project_id] = (acc[expense.project_id] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  // Apply filters
  const filteredExpenses = expenses.filter(expense => {
    if (expenseFilters.projectId && expense.project_id !== expenseFilters.projectId) return false;
    if (expenseFilters.category && expense.category !== expenseFilters.category) return false;
    if (expenseFilters.status && expense.status !== expenseFilters.status) return false;
    if (expenseFilters.submittedBy && expense.submitted_by !== expenseFilters.submittedBy) return false;
    if (expenseFilters.startDate && expense.expense_date < expenseFilters.startDate) return false;
    if (expenseFilters.endDate && expense.expense_date > expenseFilters.endDate) return false;
    return true;
  });

  const filteredIncome = income.filter(incomeItem => {
    if (incomeFilters.projectId && incomeItem.project_id !== incomeFilters.projectId) return false;
    if (incomeFilters.status && incomeItem.status !== incomeFilters.status) return false;
    if (incomeFilters.startDate && (incomeItem.received_date || incomeItem.expected_date || '') < incomeFilters.startDate) return false;
    if (incomeFilters.endDate && (incomeItem.received_date || incomeItem.expected_date || '') > incomeFilters.endDate) return false;
    return true;
  });

  const value: AccountingContextType = {
    expenses,
    income,
    transactions,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    getProjectFinancialSummary,
    getExpensesByCategory,
    getExpensesByProject,
    filteredExpenses,
    filteredIncome,
    setExpenseFilters,
    setIncomeFilters
  };

  return (
    <AccountingContext.Provider value={value}>
      {children}
    </AccountingContext.Provider>
  );
}
