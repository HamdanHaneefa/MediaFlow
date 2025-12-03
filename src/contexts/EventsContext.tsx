import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import eventsAPI from '@/services/api/events';
import type { Event, CreateEventData, UpdateEventData, EventStats } from '@/services/api/events';

interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => Promise<Event | null>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  getEventById: (id: string) => Event | undefined;
  getEventsByProject: (projectId: string) => Event[];
  getEventsByDateRange: (startDate: Date, endDate: Date) => Event[];
  checkConflicts: (startTime: string, endTime: string, attendees: string[], excludeEventId?: string) => Event[];
  updateStatus: (id: string, status: Event['status']) => Promise<Event | null>;
  getStats: () => Promise<EventStats | null>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Helper function to ensure datetime is in ISO format
const toISOString = (dateTime: string): string => {
  // If it's already in ISO format, return as is
  if (dateTime.includes('Z') || dateTime.includes('+') || dateTime.includes('T') && dateTime.length > 19) {
    return dateTime;
  }
  // Convert to ISO format
  return new Date(dateTime).toISOString();
};

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false); // Set to false since we're not loading
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('EventsContext.fetchEvents - Starting fetch...');
      
      // Use the new backend API
      const response = await eventsAPI.getAll();
      console.log('EventsContext.fetchEvents - Response:', response);
      
      setEvents(response.items || response || []); // Handle both paginated and direct array responses
      console.log('EventsContext.fetchEvents - Events set:', response.items?.length || response?.length || 0);
      
    } catch (err: unknown) {
      console.error('EventsContext.fetchEvents - Full error:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        console.error('EventsContext.fetchEvents - Error response:', (err as { response: unknown }).response);
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (
    event: Omit<Event, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Event | null> => {
    try {
      setError(null);
      
      console.log('EventsContext - Input event object:', event);
      
      // Create event data object that matches the API interface
      const eventData: CreateEventData = {
        title: event.title,
        description: event.description,
        type: event.event_type,
        start_time: toISOString(event.start_time),
        end_time: toISOString(event.end_time),
        location: event.location,
        project_id: event.project_id,
        attendees: event.attendees,
        color: event.color,
        is_all_day: event.is_all_day,
        recurrence: event.recurrence,
        reminder: event.reminder,
        status: event.status
      };

      console.log('EventsContext - API payload:', eventData);

      const newEvent = await eventsAPI.create(eventData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      console.error('Error creating event:', err);
      return null;
    }
  };

  const updateEvent = async (
    id: string,
    updates: Partial<Event>
  ): Promise<Event | null> => {
    try {
      setError(null);
      
      // Convert Event updates to UpdateEventData format
      const updateData: UpdateEventData = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.event_type !== undefined) updateData.type = updates.event_type;
      if (updates.start_time !== undefined) updateData.start_time = toISOString(updates.start_time);
      if (updates.end_time !== undefined) updateData.end_time = toISOString(updates.end_time);
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.project_id !== undefined) updateData.project_id = updates.project_id;
      if (updates.attendees !== undefined) updateData.attendees = updates.attendees;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.is_all_day !== undefined) updateData.is_all_day = updates.is_all_day;
      if (updates.recurrence !== undefined) updateData.recurrence = updates.recurrence;
      if (updates.reminder !== undefined) updateData.reminder = updates.reminder;
      if (updates.status !== undefined) updateData.status = updates.status;

      const updatedEvent = await eventsAPI.update(id, updateData);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return updatedEvent;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      console.error('Error updating event:', err);
      return null;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      return true;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      console.error('Error deleting event:', err);
      return false;
    }
  };

  const getEventById = (id: string): Event | undefined => {
    return events.find((e) => e.id === id);
  };

  const getEventsByProject = (projectId: string): Event[] => {
    return events.filter((e) => e.project_id === projectId);
  };

  const getEventsByDateRange = (startDate: Date, endDate: Date): Event[] => {
    return events.filter((e) => {
      const eventStart = new Date(e.start_time);
      return eventStart >= startDate && eventStart <= endDate;
    });
  };

  const checkConflicts = (
    startTime: string,
    endTime: string,
    attendees: string[],
    excludeEventId?: string
  ): Event[] => {
    // For now, use local checking. In production, you might want to use the API
    // const conflicts = await eventsAPI.checkConflicts({ start_time: startTime, end_time: endTime, attendees, exclude_event_id: excludeEventId });
    
    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    return events.filter((event) => {
      if (excludeEventId && event.id === excludeEventId) return false;

      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      const hasTimeOverlap =
        (newStart >= eventStart && newStart < eventEnd) ||
        (newEnd > eventStart && newEnd <= eventEnd) ||
        (newStart <= eventStart && newEnd >= eventEnd);

      const hasAttendeeOverlap = attendees.some((attendee) =>
        event.attendees.includes(attendee)
      );

      return hasTimeOverlap && hasAttendeeOverlap;
    });
  };

  const updateStatus = async (id: string, status: Event['status']): Promise<Event | null> => {
    try {
      setError(null);
      const updatedEvent = await eventsAPI.updateStatus(id, status);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return updatedEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event status');
      console.error('Error updating event status:', err);
      return null;
    }
  };

  const getStats = async (): Promise<EventStats | null> => {
    try {
      setError(null);
      return await eventsAPI.getStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get event statistics');
      console.error('Error getting event statistics:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EventsContext.Provider
      value={{
        events,
        loading,
        error,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventsByProject,
        getEventsByDateRange,
        checkConflicts,
        updateStatus,
        getStats,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
