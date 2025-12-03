import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  accountingAPI,
  type Expense,
  type Income,
  type Invoice,
  type CreateExpenseData,
  type UpdateExpenseData,
  type CreateIncomeData,
  type UpdateIncomeData,
  type AccountingStats,
  type FinancialReport
} from '@/services/api';
import { useAuth } from './AuthContext';

interface AccountingContextType {
  expenses: Expense[];
  income: Income[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  pagination: {
    expenses: { page: number; limit: number; total: number; totalPages: number };
    income: { page: number; limit: number; total: number; totalPages: number };
    invoices: { page: number; limit: number; total: number; totalPages: number };
  };
  
  // Filtered data
  filteredExpenses: Expense[];
  filteredIncome: Income[];
  
  // Expense Filters
  setExpenseFilters: (filters: { status?: string; category?: string; search?: string }) => void;
  setIncomeFilters: (filters: { status?: string; search?: string }) => void;
  
  // Expense Management
  fetchExpenses: (params?: { page?: number; limit?: number; category?: string; start_date?: string; end_date?: string }) => Promise<void>;
  createExpense: (data: CreateExpenseData) => Promise<Expense | null>;
  addExpense: (data: CreateExpenseData) => Promise<Expense | null>;
  updateExpense: (id: string, data: UpdateExpenseData) => Promise<Expense | null>;
  deleteExpense: (id: string) => Promise<boolean>;
  uploadReceipt: (expenseId: string, file: File) => Promise<Expense | null>;
  exportExpenses: (start_date?: string, end_date?: string) => Promise<void>;
  approveExpense: (id: string) => Promise<Expense | null>;
  rejectExpense: (id: string, reason?: string) => Promise<Expense | null>;
  
  // Income Management
  fetchIncome: (params?: { page?: number; limit?: number; start_date?: string; end_date?: string }) => Promise<void>;
  createIncome: (data: CreateIncomeData) => Promise<Income | null>;
  addIncome: (data: CreateIncomeData) => Promise<Income | null>;
  updateIncome: (id: string, data: UpdateIncomeData) => Promise<Income | null>;
  deleteIncome: (id: string) => Promise<boolean>;
  exportIncome: (start_date?: string, end_date?: string) => Promise<void>;
  
  // Invoice Management
  fetchInvoices: (params?: { page?: number; limit?: number; status?: string; client_id?: string; project_id?: string }) => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;
  sendInvoice: (id: string) => Promise<Invoice | null>;
  markInvoicePaid: (id: string, paid_date?: string) => Promise<Invoice | null>;
  downloadInvoicePDF: (id: string) => Promise<void>;
  
  // Financial Reporting
  getAccountingStats: () => Promise<AccountingStats | null>;
  getFinancialReport: (start_date: string, end_date: string) => Promise<FinancialReport | null>;
  
  // Helper functions
  getExpensesByCategory: () => Record<string, number>;
  getExpensesByProject: () => Record<string, number>;
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenseFilters, setExpenseFiltersState] = useState<{ status?: string; category?: string; search?: string }>({});
  const [incomeFilters, setIncomeFiltersState] = useState<{ status?: string; search?: string }>({});
  const [pagination, setPagination] = useState({
    expenses: { page: 1, limit: 10, total: 0, totalPages: 0 },
    income: { page: 1, limit: 10, total: 0, totalPages: 0 },
    invoices: { page: 1, limit: 10, total: 0, totalPages: 0 },
  });

  const { isAuthenticated, loading: authLoading } = useAuth();

  // Filtered data
  const filteredExpenses = expenses.filter(expense => {
    if (expenseFilters.status && expense.status !== expenseFilters.status) return false;
    if (expenseFilters.category && expense.category !== expenseFilters.category) return false;
    if (expenseFilters.search) {
      const search = expenseFilters.search.toLowerCase();
      const desc = expense.description?.toLowerCase() || '';
      const vendor = expense.vendor?.toLowerCase() || '';
      if (!desc.includes(search) && !vendor.includes(search)) return false;
    }
    return true;
  });

  const filteredIncome = income.filter(inc => {
    if (incomeFilters.status && inc.status !== incomeFilters.status) return false;
    if (incomeFilters.search) {
      const search = incomeFilters.search.toLowerCase();
      const desc = inc.description?.toLowerCase() || '';
      const source = inc.source?.toLowerCase() || '';
      if (!desc.includes(search) && !source.includes(search)) return false;
    }
    return true;
  });

  const setExpenseFilters = useCallback((filters: { status?: string; category?: string; search?: string }) => {
    setExpenseFiltersState(filters);
  }, []);

  const setIncomeFilters = useCallback((filters: { status?: string; search?: string }) => {
    setIncomeFiltersState(filters);
  }, []);

  // Expense Management
  const fetchExpenses = useCallback(async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountingAPI.expenses.getAll(params);
      setExpenses(response.items);
      setPagination(prev => ({ ...prev, expenses: response.pagination }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = useCallback(async (data: CreateExpenseData): Promise<Expense | null> => {
    try {
      setError(null);
      const newExpense = await accountingAPI.expenses.create(data);
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      console.error('Error creating expense:', err);
      return null;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, data: UpdateExpenseData): Promise<Expense | null> => {
    try {
      setError(null);
      const updated = await accountingAPI.expenses.update(id, data);
      setExpenses(prev => prev.map(exp => exp.id === id ? updated : exp));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      console.error('Error updating expense:', err);
      return null;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await accountingAPI.expenses.delete(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      console.error('Error deleting expense:', err);
      return false;
    }
  }, []);

  const uploadReceipt = useCallback(async (expenseId: string, file: File): Promise<Expense | null> => {
    try {
      setError(null);
      const updated = await accountingAPI.expenses.uploadReceipt(expenseId, file);
      setExpenses(prev => prev.map(exp => exp.id === expenseId ? updated : exp));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload receipt');
      console.error('Error uploading receipt:', err);
      return null;
    }
  }, []);

  const exportExpenses = useCallback(async (start_date?: string, end_date?: string) => {
    try {
      const blob = await accountingAPI.exportExpenses(start_date, end_date);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export expenses');
      console.error('Error exporting expenses:', err);
    }
  }, []);

  // Income Management
  const fetchIncome = useCallback(async (params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountingAPI.income.getAll(params);
      setIncome(response.items);
      setPagination(prev => ({ ...prev, income: response.pagination }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch income');
      console.error('Error fetching income:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncome = useCallback(async (data: CreateIncomeData): Promise<Income | null> => {
    try {
      setError(null);
      const newIncome = await accountingAPI.income.create(data);
      setIncome(prev => [newIncome, ...prev]);
      return newIncome;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create income');
      console.error('Error creating income:', err);
      return null;
    }
  }, []);

  const updateIncome = useCallback(async (id: string, data: UpdateIncomeData): Promise<Income | null> => {
    try {
      setError(null);
      const updated = await accountingAPI.income.update(id, data);
      setIncome(prev => prev.map(inc => inc.id === id ? updated : inc));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update income');
      console.error('Error updating income:', err);
      return null;
    }
  }, []);

  const deleteIncome = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await accountingAPI.income.delete(id);
      setIncome(prev => prev.filter(inc => inc.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete income');
      console.error('Error deleting income:', err);
      return false;
    }
  }, []);

  const exportIncome = useCallback(async (start_date?: string, end_date?: string) => {
    try {
      const blob = await accountingAPI.exportIncome(start_date, end_date);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export income');
      console.error('Error exporting income:', err);
    }
  }, []);

  // Invoice Management
  const fetchInvoices = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    client_id?: string;
    project_id?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountingAPI.invoices.getAll(params);
      setInvoices(response.items);
      setPagination(prev => ({ ...prev, invoices: response.pagination }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvoiceById = useCallback((id: string): Invoice | undefined => {
    return invoices.find(inv => inv.id === id);
  }, [invoices]);

  const sendInvoice = useCallback(async (id: string): Promise<Invoice | null> => {
    try {
      setError(null);
      const updated = await accountingAPI.invoices.send(id);
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
      console.error('Error sending invoice:', err);
      return null;
    }
  }, []);

  const markInvoicePaid = useCallback(async (id: string, paid_date?: string): Promise<Invoice | null> => {
    try {
      setError(null);
      const updated = await accountingAPI.invoices.markPaid(id, paid_date);
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark invoice as paid');
      console.error('Error marking invoice as paid:', err);
      return null;
    }
  }, []);

  const downloadInvoicePDF = useCallback(async (id: string) => {
    try {
      const blob = await accountingAPI.invoices.downloadPDF(id);
      const invoice = invoices.find(inv => inv.id === id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice?.invoice_number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download invoice PDF');
      console.error('Error downloading invoice PDF:', err);
    }
  }, [invoices]);

  // Financial Reporting
  const getAccountingStats = useCallback(async (): Promise<AccountingStats | null> => {
    try {
      const stats = await accountingAPI.getStats();
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get accounting stats');
      console.error('Error getting accounting stats:', err);
      return null;
    }
  }, []);

  const getFinancialReport = useCallback(async (start_date: string, end_date: string): Promise<FinancialReport | null> => {
    try {
      const report = await accountingAPI.getReport(start_date, end_date);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get financial report');
      console.error('Error getting financial report:', err);
      return null;
    }
  }, []);

  // Helper functions
  const getExpensesByCategory = useCallback((): Record<string, number> => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });
    
    return categoryTotals;
  }, [expenses]);

  const getExpensesByProject = useCallback((): Record<string, number> => {
    const projectTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const projectId = expense.project_id || 'Unassigned';
      projectTotals[projectId] = (projectTotals[projectId] || 0) + expense.amount;
    });
    
    return projectTotals;
  }, [expenses]);

  // Initialize data on mount
  useEffect(() => {
    // Only fetch data if user is authenticated and auth check is complete
    if (isAuthenticated && !authLoading) {
      fetchExpenses();
      fetchIncome();
      fetchInvoices();
    }
  }, [isAuthenticated, authLoading, fetchExpenses, fetchIncome, fetchInvoices]);

  const value: AccountingContextType = {
    expenses,
    income,
    invoices,
    loading,
    error,
    pagination,
    filteredExpenses,
    filteredIncome,
    setExpenseFilters,
    setIncomeFilters,
    fetchExpenses,
    createExpense,
    addExpense: createExpense,
    updateExpense,
    deleteExpense,
    uploadReceipt,
    exportExpenses,
    approveExpense: async (id: string) => updateExpense(id, { status: 'Approved' } as UpdateExpenseData),
    rejectExpense: async (id: string, _reason?: string) => updateExpense(id, { status: 'Rejected' } as UpdateExpenseData),
    fetchIncome,
    createIncome,
    addIncome: createIncome,
    updateIncome,
    deleteIncome,
    exportIncome,
    fetchInvoices,
    getInvoiceById,
    sendInvoice,
    markInvoicePaid,
    downloadInvoicePDF,
    getAccountingStats,
    getFinancialReport,
    getExpensesByCategory,
    getExpensesByProject,
  };

  return (
    <AccountingContext.Provider value={value}>
      {children}
    </AccountingContext.Provider>
  );
}
