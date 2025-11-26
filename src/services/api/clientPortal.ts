// Client Portal API Service
import { clientApiClient } from './clientAuth';

// Types
export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_invoices: number;
  pending_invoices: number;
  paid_invoices: number;
  total_amount: number;
  paid_amount: number;
  pending_proposals: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: Activity[];
}

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_date: string;
  end_date?: string;
  budget?: number;
  team_members?: any[];
  tasks?: any[];
}

export interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  items?: any[];
}

export interface Proposal {
  id: string;
  proposal_number: string;
  title: string;
  status: string;
  issue_date: string;
  valid_until: string;
  total_amount: number;
  items?: any[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  contact?: any;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id?: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: any;
  recipient?: any;
}

export interface Conversation {
  thread_id: string;
  last_message: Message;
  unread_count: number;
  participant: any;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  file_path: string;
  file_size?: number;
  uploaded_at: string;
  project_id?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
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

// Portal API methods
export const clientPortalAPI = {
  // Dashboard
  getDashboard: async (period: string = 'month'): Promise<DashboardData> => {
    const response = await clientApiClient.get(`/portal/dashboard?period=${period}`);
    return response.data.data;
  },

  // Profile
  getProfile: async (): Promise<Profile> => {
    const response = await clientApiClient.get('/portal/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await clientApiClient.put('/portal/profile', data);
    return response.data.data;
  },

  // Projects
  getProjects: async (params?: PaginationParams & { status?: string }): Promise<{ projects: Project[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await clientApiClient.get(`/portal/projects?${queryParams.toString()}`);
    return response.data.data;
  },

  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await clientApiClient.get(`/portal/projects/${projectId}`);
    return response.data.data;
  },

  addProjectComment: async (projectId: string, comment: string): Promise<void> => {
    await clientApiClient.post(`/portal/projects/${projectId}/comment`, { comment });
  },

  // Invoices
  getInvoices: async (params?: PaginationParams & { status?: string }): Promise<{ invoices: Invoice[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await clientApiClient.get(`/portal/invoices?${queryParams.toString()}`);
    return response.data.data;
  },

  getInvoiceById: async (invoiceId: string): Promise<Invoice> => {
    const response = await clientApiClient.get(`/portal/invoices/${invoiceId}`);
    return response.data.data;
  },

  // Proposals
  getProposals: async (params?: PaginationParams & { status?: string }): Promise<{ proposals: Proposal[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await clientApiClient.get(`/portal/proposals?${queryParams.toString()}`);
    return response.data.data;
  },

  getProposalById: async (proposalId: string): Promise<Proposal> => {
    const response = await clientApiClient.get(`/portal/proposals/${proposalId}`);
    return response.data.data;
  },

  respondToProposal: async (proposalId: string, status: 'accepted' | 'rejected' | 'changes_requested', comments?: string): Promise<void> => {
    await clientApiClient.post(`/portal/proposals/${proposalId}/respond`, { status, comments });
  },

  // Activities
  getActivities: async (params?: PaginationParams): Promise<PaginatedResponse<Activity>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await clientApiClient.get(`/portal/activities?${queryParams.toString()}`);
    return response.data.data;
  },
};

// Notifications API
export const clientNotificationsAPI = {
  getNotifications: async (params?: PaginationParams & { unread_only?: boolean }): Promise<PaginatedResponse<Notification>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unread_only) queryParams.append('unread_only', 'true');

    const response = await clientApiClient.get(`/notifications?${queryParams.toString()}`);
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await clientApiClient.get('/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await clientApiClient.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await clientApiClient.put('/notifications/mark-all-read');
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await clientApiClient.delete(`/notifications/${notificationId}`);
  },
};

// Messaging API
export const clientMessagingAPI = {
  getConversations: async (params?: PaginationParams): Promise<PaginatedResponse<Conversation>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await clientApiClient.get(`/messages?${queryParams.toString()}`);
    return response.data.data;
  },

  getMessageThread: async (threadId: string, params?: PaginationParams): Promise<PaginatedResponse<Message>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await clientApiClient.get(`/messages/thread/${threadId}?${queryParams.toString()}`);
    return response.data.data;
  },

  sendMessage: async (data: {
    recipient_id: string;
    subject: string;
    message: string;
    project_id?: string;
    thread_id?: string;
  }): Promise<Message> => {
    const response = await clientApiClient.post('/messages', data);
    return response.data.data;
  },

  markMessageAsRead: async (messageId: string): Promise<void> => {
    await clientApiClient.put(`/messages/${messageId}/read`);
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await clientApiClient.delete(`/messages/${messageId}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await clientApiClient.get('/messages/unread-count');
    return response.data.data.unreadCount;
  },
};

// Documents API
export const clientDocumentsAPI = {
  getDocuments: async (params?: PaginationParams & { type?: string; project_id?: string }): Promise<PaginatedResponse<Document>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.project_id) queryParams.append('project_id', params.project_id);

    const response = await clientApiClient.get(`/documents?${queryParams.toString()}`);
    return response.data.data;
  },

  getDocumentById: async (documentId: string): Promise<Document> => {
    const response = await clientApiClient.get(`/documents/${documentId}`);
    return response.data.data;
  },

  getDocumentTypes: async (): Promise<{ type: string; count: number }[]> => {
    const response = await clientApiClient.get('/documents/types');
    return response.data.data.types;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await clientApiClient.delete(`/documents/${documentId}`);
  },
};

export default {
  portal: clientPortalAPI,
  notifications: clientNotificationsAPI,
  messaging: clientMessagingAPI,
  documents: clientDocumentsAPI,
};
