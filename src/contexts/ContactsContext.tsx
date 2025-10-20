import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Contact } from '@/types';

interface ContactsContextType {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  createContact: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => Promise<Contact | null>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<boolean>;
  getContactById: (id: string) => Contact | undefined;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setContacts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (
    contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Contact | null> => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setContacts((prev) => [data, ...prev]);
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
      console.error('Error creating contact:', err);
      return null;
    }
  };

  const updateContact = async (
    id: string,
    updates: Partial<Contact>
  ): Promise<Contact | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
      console.error('Error updating contact:', err);
      return null;
    }
  };

  const deleteContact = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setContacts((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      console.error('Error deleting contact:', err);
      return false;
    }
  };

  const getContactById = (id: string): Contact | undefined => {
    return contacts.find((c) => c.id === id);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        error,
        fetchContacts,
        createContact,
        updateContact,
        deleteContact,
        getContactById,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}
