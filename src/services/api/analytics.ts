// Analytics & Reports API Service
import { adminApiClient } from './auth';

// Types
export interface OverviewStats {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  active_projects: number;
  total_clients: number;
  open_tasks: number;
  pending_invoices: number;
  team_members: number;
}

export interface RevenueAnalytics {
  period: string;
  total_revenue: number;
  revenue_by_month: MonthlyRevenue[];
  revenue_by_project: ProjectRevenue[];
  revenue_by_client: ClientRevenue[];
  growth_rate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ProjectRevenue {
  project_id: string;
  project_name: string;
  revenue: number;
}

export interface ClientRevenue {
  client_id: string;
  client_name: string;
  revenue: number;
}

export interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  on_hold_projects: number;
  projects_by_status: StatusCount[];
  avg_completion_time: number;
  budget_utilization: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface TaskAnalytics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  tasks_by_status: StatusCount[];
  tasks_by_priority: PriorityCount[];
  avg_completion_time: number;
  completion_rate: number;
}

export interface PriorityCount {
  priority: string;
  count: number;
}

export interface TeamPerformance {
  total_members: number;
  active_members: number;
  member_stats: MemberStat[];
  avg_tasks_per_member: number;
  avg_projects_per_member: number;
}

export interface MemberStat {
  user_id: string;
  user_name: string;
  total_tasks: number;
  completed_tasks: number;
  active_projects: number;
  completion_rate: number;
}

export interface ClientAnalytics {
  total_clients: number;
  active_clients: number;
  new_clients: number;
  client_retention_rate: number;
  top_clients: TopClient[];
  clients_by_value: ClientValue[];
}

export interface TopClient {
  client_id: string;
  client_name: string;
  total_revenue: number;
  projects_count: number;
}

export interface ClientValue {
  client_id: string;
  client_name: string;
  lifetime_value: number;
}

export interface SalesAnalytics {
  total_leads: number;
  converted_leads: number;
  conversion_rate: number;
  total_proposals: number;
  accepted_proposals: number;
  acceptance_rate: number;
  pipeline_value: number;
  won_value: number;
}

export interface TimeframeParams {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface ExportParams extends TimeframeParams {
  format?: 'csv' | 'pdf' | 'excel';
}

// Analytics API methods
export const analyticsAPI = {
  // Overview
  getOverview: async (params?: TimeframeParams): Promise<OverviewStats> => {
    const response = await adminApiClient.get('/analytics/overview', { params });
    return response.data.data;
  },

  // Revenue Analytics
  getRevenue: async (params?: TimeframeParams): Promise<RevenueAnalytics> => {
    const response = await adminApiClient.get('/analytics/revenue', { params });
    return response.data.data;
  },

  // Project Analytics
  getProjects: async (params?: TimeframeParams): Promise<ProjectAnalytics> => {
    const response = await adminApiClient.get('/analytics/projects', { params });
    return response.data.data;
  },

  // Task Analytics
  getTasks: async (params?: TimeframeParams): Promise<TaskAnalytics> => {
    const response = await adminApiClient.get('/analytics/tasks', { params });
    return response.data.data;
  },

  // Team Performance
  getTeamPerformance: async (params?: TimeframeParams): Promise<TeamPerformance> => {
    const response = await adminApiClient.get('/analytics/team', { params });
    return response.data.data;
  },

  // Client Analytics
  getClients: async (params?: TimeframeParams): Promise<ClientAnalytics> => {
    const response = await adminApiClient.get('/analytics/clients', { params });
    return response.data.data;
  },

  // Sales Analytics
  getSales: async (params?: TimeframeParams): Promise<SalesAnalytics> => {
    const response = await adminApiClient.get('/analytics/sales', { params });
    return response.data.data;
  },

  // Custom Reports
  generateCustomReport: async (
    reportType: string,
    params?: TimeframeParams & Record<string, any>
  ): Promise<any> => {
    const response = await adminApiClient.post('/analytics/custom-report', {
      reportType,
      ...params,
    });
    return response.data.data;
  },

  // Export Reports
  exportOverview: async (params?: ExportParams): Promise<Blob> => {
    const response = await adminApiClient.get('/analytics/overview/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportRevenue: async (params?: ExportParams): Promise<Blob> => {
    const response = await adminApiClient.get('/analytics/revenue/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportProjects: async (params?: ExportParams): Promise<Blob> => {
    const response = await adminApiClient.get('/analytics/projects/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportTasks: async (params?: ExportParams): Promise<Blob> => {
    const response = await adminApiClient.get('/analytics/tasks/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportTeam: async (params?: ExportParams): Promise<Blob> => {
    const response = await adminApiClient.get('/analytics/team/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportClients: async (params?: ExportParams): Promise<Blob> => {
    const response = await adminApiClient.get('/analytics/clients/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportSales: async (params?: ExportParams): Promise<Blob> => {
    const response = await adminApiClient.get('/analytics/sales/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Dashboard Widgets
  getDashboardData: async (): Promise<{
    overview: OverviewStats;
    recentProjects: any[];
    recentTasks: any[];
    recentInvoices: any[];
    upcomingDeadlines: any[];
  }> => {
    const response = await adminApiClient.get('/analytics/dashboard');
    return response.data.data;
  },

  // Real-time Stats
  getRealTimeStats: async (): Promise<{
    active_users: number;
    tasks_completed_today: number;
    revenue_today: number;
    new_leads_today: number;
  }> => {
    const response = await adminApiClient.get('/analytics/realtime');
    return response.data.data;
  },

  // Comparison Reports
  compareTimeframes: async (
    metric: string,
    timeframe1: TimeframeParams,
    timeframe2: TimeframeParams
  ): Promise<{
    timeframe1: any;
    timeframe2: any;
    difference: number;
    percentage_change: number;
  }> => {
    const response = await adminApiClient.post('/analytics/compare', {
      metric,
      timeframe1,
      timeframe2,
    });
    return response.data.data;
  },

  // Forecasting
  getForecast: async (
    metric: string,
    params?: TimeframeParams
  ): Promise<{
    historical_data: any[];
    forecast_data: any[];
    confidence_interval: { lower: number; upper: number };
  }> => {
    const response = await adminApiClient.post('/analytics/forecast', {
      metric,
      ...params,
    });
    return response.data.data;
  },
};

export default analyticsAPI;
