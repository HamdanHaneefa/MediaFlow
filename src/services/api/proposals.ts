// Proposals & Leads Management API Service
import { adminApiClient } from './auth';

// Types
export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost' | 'Converted';
  priority: 'Low' | 'Medium' | 'High';
  tags: string[];
  budget?: number;
  estimated_value?: number;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface Proposal {
  id: string;
  proposal_number: string;
  title: string;
  description?: string;
  client_id: string;
  lead_id?: string;
  amount: number;
  type: 'Standard' | 'Custom' | 'Quick Quote' | 'Retainer' | 'Package Deal';
  currency: string;
  assigned_team_members: string[];
  version: number;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled';
  valid_until: string;
  content?: string;
  terms?: string;
  sections: ProposalSection[];
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

export interface ProposalSection {
  id: string;
  proposal_id: string;
  title: string;
  content: string;
  order: number;
}

export interface CreateLeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
  budget?: number;
  estimated_value?: number;
  notes?: string;
  assigned_to?: string;
}

export interface UpdateLeadData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost' | 'Converted';
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
  budget?: number;
  estimated_value?: number;
  notes?: string;
  assigned_to?: string;
}

export interface CreateProposalData {
  title: string;
  client_id: string;
  lead_id?: string;
  amount: number;
  valid_until: string;
  content?: string;
  terms?: string;
  sections?: Omit<ProposalSection, 'id' | 'proposal_id'>[];
}

export interface UpdateProposalData {
  title?: string;
  amount?: number;
  status?: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled';
  valid_until?: string;
  content?: string;
  terms?: string;
  sections?: Omit<ProposalSection, 'id' | 'proposal_id'>[];
}

export interface LeadStats {
  total_leads: number;
  new_leads: number;
  qualified_leads: number;
  won_leads: number;
  lost_leads: number;
  conversion_rate: number;
  total_estimated_value: number;
}

export interface ProposalStats {
  total_proposals: number;
  draft_proposals: number;
  sent_proposals: number;
  accepted_proposals: number;
  rejected_proposals: number;
  acceptance_rate: number;
  total_value: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface LeadSearchParams extends PaginationParams {
  search?: string;
  status?: string;
  source?: string;
  assigned_to?: string;
}

export interface ProposalSearchParams extends PaginationParams {
  search?: string;
  status?: string;
  client_id?: string;
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

// Proposals API methods
export const proposalsAPI = {
  // Leads
  leads: {
    // Get all leads
    getAll: async (params?: LeadSearchParams): Promise<PaginatedResponse<Lead>> => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.source) queryParams.append('source', params.source);
      if (params?.assigned_to) queryParams.append('assigned_to', params.assigned_to);

      const response = await adminApiClient.get(`/proposals/leads?${queryParams.toString()}`);
      return response.data.data;
    },

    // Create lead
    create: async (data: CreateLeadData): Promise<Lead> => {
      const response = await adminApiClient.post('/proposals/leads', data);
      return response.data.data;
    },

    // Get lead by ID
    getById: async (id: string): Promise<Lead> => {
      const response = await adminApiClient.get(`/proposals/leads/${id}`);
      return response.data.data;
    },

    // Update lead
    update: async (id: string, data: UpdateLeadData): Promise<Lead> => {
      const response = await adminApiClient.put(`/proposals/leads/${id}`, data);
      return response.data.data;
    },

    // Delete lead
    delete: async (id: string): Promise<void> => {
      await adminApiClient.delete(`/proposals/leads/${id}`);
    },

    // Update lead status
    updateStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
      const response = await adminApiClient.put(`/proposals/leads/${id}/status`, { status });
      return response.data.data;
    },

    // Assign lead to user
    assign: async (leadId: string, userId: string): Promise<Lead> => {
      const response = await adminApiClient.post(`/proposals/leads/${leadId}/assign`, { user_id: userId });
      return response.data.data;
    },

    // Convert lead to client
    convertToClient: async (leadId: string): Promise<any> => {
      const response = await adminApiClient.post(`/proposals/leads/${leadId}/convert`);
      return response.data.data;
    },

    // Get lead statistics
    getStats: async (): Promise<LeadStats> => {
      const response = await adminApiClient.get('/proposals/leads/stats');
      return response.data.data;
    },

    // Export leads to CSV
    exportCSV: async (params?: LeadSearchParams): Promise<Blob> => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.source) queryParams.append('source', params.source);
      if (params?.assigned_to) queryParams.append('assigned_to', params.assigned_to);

      const response = await adminApiClient.get(`/proposals/leads/export?${queryParams.toString()}`, {
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // Proposals
  proposals: {
    // Get all proposals
    getAll: async (params?: ProposalSearchParams): Promise<PaginatedResponse<Proposal>> => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.client_id) queryParams.append('client_id', params.client_id);

      const response = await adminApiClient.get(`/proposals?${queryParams.toString()}`);
      return response.data.data;
    },

    // Create proposal
    create: async (data: CreateProposalData): Promise<Proposal> => {
      const response = await adminApiClient.post('/proposals', data);
      return response.data.data;
    },

    // Get proposal by ID
    getById: async (id: string): Promise<Proposal> => {
      const response = await adminApiClient.get(`/proposals/${id}`);
      return response.data.data;
    },

    // Update proposal
    update: async (id: string, data: UpdateProposalData): Promise<Proposal> => {
      const response = await adminApiClient.put(`/proposals/${id}`, data);
      return response.data.data;
    },

    // Delete proposal
    delete: async (id: string): Promise<void> => {
      await adminApiClient.delete(`/proposals/${id}`);
    },

    // Send proposal
    send: async (id: string): Promise<Proposal> => {
      const response = await adminApiClient.post(`/proposals/${id}/send`);
      return response.data.data;
    },

    // Accept proposal
    accept: async (id: string): Promise<Proposal> => {
      const response = await adminApiClient.post(`/proposals/${id}/accept`);
      return response.data.data;
    },

    // Reject proposal
    reject: async (id: string, reason?: string): Promise<Proposal> => {
      const response = await adminApiClient.post(`/proposals/${id}/reject`, { reason });
      return response.data.data;
    },

    // Download proposal PDF
    downloadPDF: async (id: string): Promise<Blob> => {
      const response = await adminApiClient.get(`/proposals/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    },

    // Duplicate proposal
    duplicate: async (id: string): Promise<Proposal> => {
      const response = await adminApiClient.post(`/proposals/${id}/duplicate`);
      return response.data.data;
    },

    // Get proposal statistics
    getStats: async (): Promise<ProposalStats> => {
      const response = await adminApiClient.get('/proposals/stats');
      return response.data.data;
    },
  },
};

export default proposalsAPI;
