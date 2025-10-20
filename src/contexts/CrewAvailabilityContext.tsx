import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { CrewAvailability } from '@/types';

interface CrewAvailabilityContextType {
  crewAvailability: CrewAvailability[];
  loading: boolean;
  error: string | null;
  fetchCrewAvailability: () => Promise<void>;
  createCrewAvailability: (availability: Omit<CrewAvailability, 'id' | 'created_at' | 'updated_at'>) => Promise<CrewAvailability | null>;
  updateCrewAvailability: (id: string, updates: Partial<CrewAvailability>) => Promise<CrewAvailability | null>;
  deleteCrewAvailability: (id: string) => Promise<boolean>;
  bulkUpdateCrewAvailability: (contactId: string, dates: string[], status: CrewAvailability['status'], notes?: string) => Promise<boolean>;
  getCrewAvailabilityByContact: (contactId: string) => CrewAvailability[];
  getCrewAvailabilityByDate: (date: string) => CrewAvailability[];
  checkCrewAvailability: (contactId: string, startDate: string, endDate: string) => {
    isAvailable: boolean;
    conflicts: CrewAvailability[];
    status: 'Available' | 'Booked' | 'Tentative' | 'Unavailable' | 'Partial';
  };
  getAvailableCrewForDateRange: (startDate: string, endDate: string, excludeStatuses?: string[]) => string[];
}

const CrewAvailabilityContext = createContext<CrewAvailabilityContextType | undefined>(undefined);

export function CrewAvailabilityProvider({ children }: { children: ReactNode }) {
  const [crewAvailability, setCrewAvailability] = useState<CrewAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrewAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('crew_availability')
        .select('*')
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;
      setCrewAvailability(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch crew availability');
      console.error('Error fetching crew availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCrewAvailability = async (
    availability: Omit<CrewAvailability, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CrewAvailability | null> => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('crew_availability')
        .insert([availability])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setCrewAvailability((prev) => [...prev, data]);
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create crew availability');
      console.error('Error creating crew availability:', err);
      return null;
    }
  };

  const updateCrewAvailability = async (
    id: string,
    updates: Partial<CrewAvailability>
  ): Promise<CrewAvailability | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('crew_availability')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setCrewAvailability((prev) => prev.map((a) => (a.id === id ? data : a)));
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update crew availability');
      console.error('Error updating crew availability:', err);
      return null;
    }
  };

  const deleteCrewAvailability = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('crew_availability')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setCrewAvailability((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete crew availability');
      console.error('Error deleting crew availability:', err);
      return false;
    }
  };

  const bulkUpdateCrewAvailability = async (
    contactId: string,
    dates: string[],
    status: CrewAvailability['status'],
    notes?: string
  ): Promise<boolean> => {
    try {
      setError(null);

      const availabilityRecords = dates.map(date => ({
        contact_id: contactId,
        date,
        status,
        notes: notes || '',
      }));

      const { data, error: upsertError } = await supabase
        .from('crew_availability')
        .upsert(availabilityRecords, {
          onConflict: 'contact_id,date',
        })
        .select();

      if (upsertError) throw upsertError;

      if (data) {
        setCrewAvailability((prev) => {
          const updated = [...prev];
          data.forEach((newRecord) => {
            const existingIndex = updated.findIndex(
              (r) => r.contact_id === newRecord.contact_id && r.date === newRecord.date
            );
            if (existingIndex >= 0) {
              updated[existingIndex] = newRecord;
            } else {
              updated.push(newRecord);
            }
          });
          return updated;
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update crew availability');
      console.error('Error bulk updating crew availability:', err);
      return false;
    }
  };

  const getCrewAvailabilityByContact = (contactId: string): CrewAvailability[] => {
    return crewAvailability.filter((a) => a.contact_id === contactId);
  };

  const getCrewAvailabilityByDate = (date: string): CrewAvailability[] => {
    return crewAvailability.filter((a) => a.date === date);
  };

  const checkCrewAvailability = (
    contactId: string,
    startDate: string,
    endDate: string
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const relevantAvailability = crewAvailability.filter((a) => {
      if (a.contact_id !== contactId) return false;
      const availDate = new Date(a.date);
      return availDate >= start && availDate <= end;
    });

    const conflicts = relevantAvailability.filter(
      (a) => a.status === 'Booked' || a.status === 'Unavailable'
    );

    const tentative = relevantAvailability.filter((a) => a.status === 'Tentative');

    const daysInRange = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let status: 'Available' | 'Booked' | 'Tentative' | 'Unavailable' | 'Partial';
    let isAvailable = true;

    if (conflicts.length === 0 && tentative.length === 0) {
      status = 'Available';
    } else if (conflicts.length === daysInRange) {
      status = conflicts[0].status === 'Booked' ? 'Booked' : 'Unavailable';
      isAvailable = false;
    } else if (conflicts.length > 0) {
      status = 'Partial';
      isAvailable = false;
    } else if (tentative.length > 0) {
      status = 'Tentative';
    } else {
      status = 'Available';
    }

    return {
      isAvailable,
      conflicts,
      status,
    };
  };

  const getAvailableCrewForDateRange = (
    startDate: string,
    endDate: string,
    excludeStatuses: string[] = ['Booked', 'Unavailable']
  ): string[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictedContactIds = new Set<string>();

    crewAvailability.forEach((a) => {
      const availDate = new Date(a.date);
      if (availDate >= start && availDate <= end && excludeStatuses.includes(a.status)) {
        conflictedContactIds.add(a.contact_id);
      }
    });

    const allContactIds = new Set(crewAvailability.map((a) => a.contact_id));

    return Array.from(allContactIds).filter((id) => !conflictedContactIds.has(id));
  };

  useEffect(() => {
    fetchCrewAvailability();
  }, []);

  return (
    <CrewAvailabilityContext.Provider
      value={{
        crewAvailability,
        loading,
        error,
        fetchCrewAvailability,
        createCrewAvailability,
        updateCrewAvailability,
        deleteCrewAvailability,
        bulkUpdateCrewAvailability,
        getCrewAvailabilityByContact,
        getCrewAvailabilityByDate,
        checkCrewAvailability,
        getAvailableCrewForDateRange,
      }}
    >
      {children}
    </CrewAvailabilityContext.Provider>
  );
}

export function useCrewAvailability() {
  const context = useContext(CrewAvailabilityContext);
  if (context === undefined) {
    throw new Error('useCrewAvailability must be used within a CrewAvailabilityProvider');
  }
  return context;
}
