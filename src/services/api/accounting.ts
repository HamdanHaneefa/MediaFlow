// Accounting Management API Service
import { adminApiClient } from './auth';

// Types
export interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  vendor?: string;
  receipt_url?: string;
  payment_method: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Check' | 'Other';
  date: string;
  project_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  description?: string;
  date: string;
  invoice_id?: string;
  project_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  project_id?: string;
  amount: number;
  tax_amount?: number;
  total_amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  issue_date: string;
  due_date: string;
  paid_date?: string;
  notes?: string;
  line_items: InvoiceLineItem[];
  created_by: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company?: string;
  };
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface CreateExpenseData {
  category: string;
  amount: number;
  description?: string;
  vendor?: string;
  payment_method: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Check' | 'Other';
  date: string;
  project_id?: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

export interface CreateIncomeData {
  source: string;
  amount: number;
  description?: string;
  date: string;
  invoice_id?: string;
  project_id?: string;
}

export interface UpdateIncomeData extends Partial<CreateIncomeData> {}

export interface CreateInvoiceData {
  client_id: string;
  project_id?: string;
  amount: number;
  tax_amount?: number;
  issue_date: string;
  due_date: string;
  notes?: string;
  line_items: Omit<InvoiceLineItem, 'id' | 'invoice_id'>[];
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  paid_date?: string;
}

export interface AccountingStats {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  total_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  pending_amount: number;
}

export interface FinancialReport {
  period: string;
  income: number;
  expenses: number;
  profit: number;
  income_by_category: Record<string, number>;
  expenses_by_category: Record<string, number>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
}

export interface InvoiceSearchParams extends PaginationParams {
  search?: string;
  status?: string;
  client_id?: string;
  project_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Accounting API methods
export const accountingAPI = {
  // Expenses
  expenses: {
    // Get all expenses
    getAll: async (params?: SearchParams): Promise<PaginatedResponse<Expense>> => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);

      const response = await adminApiClient.get(`/accounting/expenses?${queryParams.toString()}`);
      return response.data.data;
    },

    // Create expense
    create: async (data: CreateExpenseData): Promise<Expense> => {
      const response = await adminApiClient.post('/accounting/expenses', data);
      return response.data.data;
    },

    // Get expense by ID
    getById: async (id: string): Promise<Expense> => {
      const response = await adminApiClient.get(`/accounting/expenses/${id}`);
      return response.data.data;
    },

    // Update expense
    update: async (id: string, data: UpdateExpenseData): Promise<Expense> => {
      const response = await adminApiClient.put(`/accounting/expenses/${id}`, data);
      return response.data.data;
    },

    // Delete expense
    delete: async (id: string): Promise<void> => {
      await adminApiClient.delete(`/accounting/expenses/${id}`);
    },

    // Upload receipt
    uploadReceipt: async (expenseId: string, file: File): Promise<Expense> => {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await adminApiClient.post(`/accounting/expenses/${expenseId}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
  },

  // Income
  income: {
    // Get all income
    getAll: async (params?: SearchParams): Promise<PaginatedResponse<Income>> => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);

      const response = await adminApiClient.get(`/accounting/income?${queryParams.toString()}`);
      return response.data.data;
    },

    // Create income
    create: async (data: CreateIncomeData): Promise<Income> => {
      const response = await adminApiClient.post('/accounting/income', data);
      return response.data.data;
    },

    // Get income by ID
    getById: async (id: string): Promise<Income> => {
      const response = await adminApiClient.get(`/accounting/income/${id}`);
      return response.data.data;
    },

    // Update income
    update: async (id: string, data: UpdateIncomeData): Promise<Income> => {
      const response = await adminApiClient.put(`/accounting/income/${id}`, data);
      return response.data.data;
    },

    // Delete income
    delete: async (id: string): Promise<void> => {
      await adminApiClient.delete(`/accounting/income/${id}`);
    },
  },

  // Invoices
  invoices: {
    // Get all invoices
    getAll: async (params?: InvoiceSearchParams): Promise<PaginatedResponse<Invoice>> => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.client_id) queryParams.append('client_id', params.client_id);
      if (params?.project_id) queryParams.append('project_id', params.project_id);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);

      const response = await adminApiClient.get(`/accounting/invoices?${queryParams.toString()}`);
      return response.data.data;
    },

    // Create invoice
    create: async (data: CreateInvoiceData): Promise<Invoice> => {
      const response = await adminApiClient.post('/accounting/invoices', data);
      return response.data.data;
    },

    // Get invoice by ID
    getById: async (id: string): Promise<Invoice> => {
      const response = await adminApiClient.get(`/accounting/invoices/${id}`);
      return response.data.data;
    },

    // Update invoice
    update: async (id: string, data: UpdateInvoiceData): Promise<Invoice> => {
      const response = await adminApiClient.put(`/accounting/invoices/${id}`, data);
      return response.data.data;
    },

    // Delete invoice
    delete: async (id: string): Promise<void> => {
      await adminApiClient.delete(`/accounting/invoices/${id}`);
    },

    // Send invoice
    send: async (id: string): Promise<Invoice> => {
      const response = await adminApiClient.post(`/accounting/invoices/${id}/send`);
      return response.data.data;
    },

    // Mark invoice as paid
    markPaid: async (id: string, paid_date?: string): Promise<Invoice> => {
      const response = await adminApiClient.post(`/accounting/invoices/${id}/paid`, { paid_date });
      return response.data.data;
    },

    // Download invoice PDF
    downloadPDF: async (id: string): Promise<Blob> => {
      const response = await adminApiClient.get(`/accounting/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // Statistics & Reports
  getStats: async (): Promise<AccountingStats> => {
    const response = await adminApiClient.get('/accounting/stats');
    return response.data.data;
  },

  getReport: async (start_date: string, end_date: string): Promise<FinancialReport> => {
    const response = await adminApiClient.get('/accounting/report', {
      params: { start_date, end_date },
    });
    return response.data.data;
  },

  exportExpenses: async (start_date?: string, end_date?: string): Promise<Blob> => {
    const response = await adminApiClient.get('/accounting/expenses/export', {
      params: { start_date, end_date },
      responseType: 'blob',
    });
    return response.data;
  },

  exportIncome: async (start_date?: string, end_date?: string): Promise<Blob> => {
    const response = await adminApiClient.get('/accounting/income/export', {
      params: { start_date, end_date },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default accountingAPI;
