import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Equipment, Location, EquipmentBooking } from '@/types';

interface ResourcesContextType {
  equipment: Equipment[];
  locations: Location[];
  bookings: EquipmentBooking[];
  loading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
  createEquipment: (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => Promise<Equipment | null>;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<Equipment | null>;
  deleteEquipment: (id: string) => Promise<boolean>;
  createLocation: (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => Promise<Location | null>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<Location | null>;
  deleteLocation: (id: string) => Promise<boolean>;
  createBooking: (booking: Omit<EquipmentBooking, 'id' | 'created_at' | 'updated_at'>) => Promise<EquipmentBooking | null>;
  updateBooking: (id: string, updates: Partial<EquipmentBooking>) => Promise<EquipmentBooking | null>;
  deleteBooking: (id: string) => Promise<boolean>;
  getAvailableEquipment: (startTime: string, endTime: string) => Equipment[];
  checkEquipmentConflicts: (equipmentId: string, startTime: string, endTime: string, excludeEventId?: string) => EquipmentBooking[];
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [bookings, setBookings] = useState<EquipmentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const [equipmentRes, locationsRes, bookingsRes] = await Promise.all([
        supabase.from('equipment').select('*').order('name', { ascending: true }),
        supabase.from('locations').select('*').order('name', { ascending: true }),
        supabase.from('equipment_bookings').select('*').order('start_time', { ascending: true }),
      ]);

      if (equipmentRes.error) throw equipmentRes.error;
      if (locationsRes.error) throw locationsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;

      setEquipment(equipmentRes.data || []);
      setLocations(locationsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEquipment = async (
    equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Equipment | null> => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('equipment')
        .insert([equipmentData])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setEquipment((prev) => [...prev, data]);
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create equipment');
      console.error('Error creating equipment:', err);
      return null;
    }
  };

  const updateEquipment = async (
    id: string,
    updates: Partial<Equipment>
  ): Promise<Equipment | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setEquipment((prev) => prev.map((e) => (e.id === id ? data : e)));
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update equipment');
      console.error('Error updating equipment:', err);
      return null;
    }
  };

  const deleteEquipment = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setEquipment((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete equipment');
      console.error('Error deleting equipment:', err);
      return false;
    }
  };

  const createLocation = async (
    locationData: Omit<Location, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Location | null> => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setLocations((prev) => [...prev, data]);
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create location');
      console.error('Error creating location:', err);
      return null;
    }
  };

  const updateLocation = async (
    id: string,
    updates: Partial<Location>
  ): Promise<Location | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setLocations((prev) => prev.map((l) => (l.id === id ? data : l)));
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
      console.error('Error updating location:', err);
      return null;
    }
  };

  const deleteLocation = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setLocations((prev) => prev.filter((l) => l.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete location');
      console.error('Error deleting location:', err);
      return false;
    }
  };

  const createBooking = async (
    bookingData: Omit<EquipmentBooking, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EquipmentBooking | null> => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('equipment_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setBookings((prev) => [...prev, data]);
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      console.error('Error creating booking:', err);
      return null;
    }
  };

  const updateBooking = async (
    id: string,
    updates: Partial<EquipmentBooking>
  ): Promise<EquipmentBooking | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('equipment_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      console.error('Error updating booking:', err);
      return null;
    }
  };

  const deleteBooking = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('equipment_bookings')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setBookings((prev) => prev.filter((b) => b.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
      console.error('Error deleting booking:', err);
      return false;
    }
  };

  const getAvailableEquipment = (startTime: string, endTime: string): Equipment[] => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const bookedEquipmentIds = bookings
      .filter((booking) => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);

        return (
          booking.status !== 'Cancelled' &&
          booking.status !== 'Returned' &&
          ((start >= bookingStart && start < bookingEnd) ||
            (end > bookingStart && end <= bookingEnd) ||
            (start <= bookingStart && end >= bookingEnd))
        );
      })
      .map((b) => b.equipment_id);

    return equipment.filter(
      (e) => e.status === 'Available' && !bookedEquipmentIds.includes(e.id)
    );
  };

  const checkEquipmentConflicts = (
    equipmentId: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ): EquipmentBooking[] => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return bookings.filter((booking) => {
      if (excludeEventId && booking.event_id === excludeEventId) return false;
      if (booking.equipment_id !== equipmentId) return false;
      if (booking.status === 'Cancelled' || booking.status === 'Returned') return false;

      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);

      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <ResourcesContext.Provider
      value={{
        equipment,
        locations,
        bookings,
        loading,
        error,
        fetchResources,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        createLocation,
        updateLocation,
        deleteLocation,
        createBooking,
        updateBooking,
        deleteBooking,
        getAvailableEquipment,
        checkEquipmentConflicts,
      }}
    >
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (context === undefined) {
    throw new Error('useResources must be used within a ResourcesProvider');
  }
  return context;
}
