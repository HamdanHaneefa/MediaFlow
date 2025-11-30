import { adminApiClient } from './auth';

export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  occurrences?: number;
  days_of_week?: number[];
}

export interface EventReminder {
  type: 'email' | 'notification' | 'popup';
  minutes_before: number;
  enabled: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location?: string;
  project_id?: string;
  attendees: string[];
  color?: string;
  is_all_day: boolean;
  recurrence?: EventRecurrence;
  reminder?: EventReminder;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
  projects?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface CreateEventData {
  title: string;
  description?: string;
  type?: string;
  start_time: string;
  end_time: string;
  location?: string;
  project_id?: string;
  attendees?: string[];
  color?: string;
  is_all_day?: boolean;
  recurrence?: EventRecurrence;
  reminder?: EventReminder;
  status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  type?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  project_id?: string | null;
  attendees?: string[];
  color?: string;
  is_all_day?: boolean;
  recurrence?: EventRecurrence;
  reminder?: EventReminder;
  status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface EventsListParams {
  page?: number;
  limit?: number;
  search?: string;
  project_id?: string;
  status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  type?: string;
  start_date?: string;
  end_date?: string;
  attendee_id?: string;
}

export interface EventStats {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  recent: Event[];
}

export interface EventConflictsParams {
  start_time: string;
  end_time: string;
  attendees?: string[];
  exclude_event_id?: string;
}

class EventsAPI {
  // Get all events with optional filtering and pagination
  async getAll(params?: EventsListParams) {
    console.log('EventsAPI.getAll - Starting request with params:', params);
    
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.project_id) queryParams.append('project_id', params.project_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.attendee_id) queryParams.append('attendee_id', params.attendee_id);

    const url = `/events?${queryParams.toString()}`;
    console.log('EventsAPI.getAll - Request URL:', url);
    console.log('EventsAPI.getAll - Auth token exists:', !!localStorage.getItem('admin_access_token'));
    
    try {
      const response = await adminApiClient.get(url);
      console.log('EventsAPI.getAll - Response:', response);
      return response.data.data;
    } catch (error) {
      console.error('EventsAPI.getAll - Error:', error);
      console.error('EventsAPI.getAll - Error response:', error.response);
      throw error;
    }
  }

  // Get event by ID
  async getById(id: string): Promise<Event> {
    const response = await adminApiClient.get(`/events/${id}`);
    return response.data.data;
  }

  // Create new event
  async create(data: CreateEventData): Promise<Event> {
    const response = await adminApiClient.post('/events', data);
    return response.data.data;
  }

  // Update event
  async update(id: string, data: UpdateEventData): Promise<Event> {
    const response = await adminApiClient.put(`/events/${id}`, data);
    return response.data.data;
  }

  // Delete event
  async delete(id: string): Promise<void> {
    await adminApiClient.delete(`/events/${id}`);
  }

  // Update event status
  async updateStatus(id: string, status: Event['status']): Promise<Event> {
    const response = await adminApiClient.patch(`/events/${id}/status`, { status });
    return response.data.data;
  }

  // Check for event conflicts
  async checkConflicts(params: EventConflictsParams): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('start_time', params.start_time);
    queryParams.append('end_time', params.end_time);
    
    if (params.attendees && params.attendees.length > 0) {
      queryParams.append('attendees', params.attendees.join(','));
    }
    if (params.exclude_event_id) {
      queryParams.append('exclude_event_id', params.exclude_event_id);
    }

    const response = await adminApiClient.get(`/events/conflicts?${queryParams.toString()}`);
    return response.data.data;
  }

  // Get event statistics
  async getStats(): Promise<EventStats> {
    const response = await adminApiClient.get('/events/stats');
    return response.data.data;
  }

  // Get events by project ID
  async getByProject(projectId: string): Promise<Event[]> {
    const response = await adminApiClient.get(`/events/project/${projectId}`);
    return response.data.data;
  }

  // Get events by date range
  async getByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);

    const response = await adminApiClient.get(`/events/date-range?${queryParams.toString()}`);
    return response.data.data;
  }
}

const eventsAPI = new EventsAPI();
export default eventsAPI;
