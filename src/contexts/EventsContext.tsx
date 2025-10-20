import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';

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
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
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
      const { data, error: createError } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setEvents((prev) => [...prev, data]);
        return data;
      }
      return null;
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
      const { data, error: updateError } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      console.error('Error updating event:', err);
      return null;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setEvents((prev) => prev.filter((e) => e.id !== id));
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

      const hasAttendeeOverlap = attendees.some((attendeeId) =>
        event.attendees.includes(attendeeId)
      );

      return hasTimeOverlap && hasAttendeeOverlap;
    });
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
