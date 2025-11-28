import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  contactsAPI, 
  type Contact, 
  type CreateContactData,
  type PaginatedResponse 
} from '@/services/api';

interface ContactsContextType {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; totalPages: number };
  fetchContacts: (page?: number, limit?: number) => Promise<void>;
  searchContacts: (query: string) => Promise<void>;
  createContact: (contact: CreateContactData) => Promise<Contact | null>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<boolean>;
  getContactById: (id: string) => Contact | undefined;
  exportContacts: () => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchContacts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsAPI.getAll({ page, limit });
      console.log('Resoponse form contact : ',response)
      setContacts(response.items);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchContacts = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsAPI.search(query, { page: 1, limit: 50 });
      setContacts(response.items);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search contacts');
      console.error('Error searching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (
    contactData: CreateContactData
  ): Promise<Contact | null> => {
    try {
      setError(null);
      const newContact = await contactsAPI.create(contactData);
      setContacts((prev) => [newContact, ...prev]);
      return newContact;
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
      const updatedContact = await contactsAPI.update(id, updates);
      setContacts((prev) => prev.map((c) => (c.id === id ? updatedContact : c)));
      return updatedContact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
      console.error('Error updating contact:', err);
      return null;
    }
  };

  const deleteContact = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await contactsAPI.delete(id);
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

  const exportContacts = async () => {
    try {
      const blob = await contactsAPI.exportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export contacts');
      console.error('Error exporting contacts:', err);
    }
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
        pagination,
        fetchContacts,
        searchContacts,
        createContact,
        updateContact,
        deleteContact,
        getContactById,
        exportContacts,
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
