// Contacts Management API Service
import { adminApiClient } from './auth';

// Types
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  type: 'Lead' | 'Client' | 'Partner' | 'Vendor';
  status: 'Active' | 'Inactive' | 'Prospect';
  source?: string;
  tags?: string[];
  notes?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  projects?: any[];
  invoices?: any[];
}

export interface CreateContactData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  type?: 'Lead' | 'Client' | 'Partner' | 'Vendor';
  status?: 'Active' | 'Inactive' | 'Prospect';
  source?: string;
  tags?: string[];
  notes?: string;
  assigned_to?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface ContactNote {
  id: string;
  contact_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface ContactStats {
  total_contacts: number;
  active_contacts: number;
  leads: number;
  clients: number;
  recent_contacts: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  type?: string;
  status?: string;
  assigned_to?: string;
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

// Contacts API methods
export const contactsAPI = {
  // Get all contacts
  getAll: async (params?: SearchParams): Promise<PaginatedResponse<Contact>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.assigned_to) queryParams.append('assigned_to', params.assigned_to);
    const response = await adminApiClient.get(`/contacts?${queryParams.toString()}`);
    return response.data.data;
  },

  // Create contact
  create: async (data: CreateContactData): Promise<Contact> => {
    const response = await adminApiClient.post('/contacts', data);
    return response.data.data;
  },

  // Get contact by ID
  getById: async (id: string): Promise<Contact> => {
    const response = await adminApiClient.get(`/contacts/${id}`);
    return response.data.data;
  },

  // Update contact
  update: async (id: string, data: UpdateContactData): Promise<Contact> => {
    const response = await adminApiClient.put(`/contacts/${id}`, data);
    return response.data.data;
  },

  // Delete contact
  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/contacts/${id}`);
  },

  // Search contacts
  search: async (query: string, params?: PaginationParams): Promise<PaginatedResponse<Contact>> => {
    const queryParams = new URLSearchParams({ search: query });
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await adminApiClient.get(`/contacts/search?${queryParams.toString()}`);
    return response.data.data;
  },

  // Add note to contact
  addNote: async (contactId: string, note: string): Promise<ContactNote> => {
    const response = await adminApiClient.post(`/contacts/${contactId}/notes`, { note });
    return response.data.data;
  },

  // Get contact projects
  getProjects: async (contactId: string): Promise<any[]> => {
    const response = await adminApiClient.get(`/contacts/${contactId}/projects`);
    return response.data.data;
  },

  // Get contact invoices
  getInvoices: async (contactId: string): Promise<any[]> => {
    const response = await adminApiClient.get(`/contacts/${contactId}/invoices`);
    return response.data.data;
  },

  // Convert lead to client
  convertToClient: async (contactId: string): Promise<Contact> => {
    const response = await adminApiClient.post(`/contacts/${contactId}/convert-to-client`);
    return response.data.data;
  },

  // Get contact statistics
  getStats: async (): Promise<ContactStats> => {
    const response = await adminApiClient.get('/contacts/stats');
    return response.data.data;
  },

  // Export contacts to CSV
  exportCSV: async (params?: SearchParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const response = await adminApiClient.get(`/contacts/export?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Import contacts from CSV
  importCSV: async (file: File): Promise<{ imported: number; failed: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await adminApiClient.post('/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Bulk delete contacts
  bulkDelete: async (contactIds: string[]): Promise<{ deleted: number }> => {
    const response = await adminApiClient.post('/contacts/bulk-delete', { ids: contactIds });
    return response.data.data;
  },
};

export default contactsAPI;
