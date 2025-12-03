import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  contactsAPI, 
  type Contact as APIContact,
  type CreateContactData
} from '@/services/api';
import { type Contact } from '@/types';
import { mockContacts } from '@/data/mockData';
import { useAuth } from './AuthContext';

// Transform API Contact to Frontend Contact type
const transformContact = (apiContact: APIContact): Contact => {
  return {
    id: apiContact.id,
    name: `${apiContact.first_name} ${apiContact.last_name}`.trim(),
    email: apiContact.email,
    phone: apiContact.phone,
    company: apiContact.company,
    role: apiContact.type as Contact['role'], // Map API 'type' to frontend 'role'
    status: apiContact.status,
    notes: apiContact.notes,
    tags: apiContact.tags || [],
    created_at: apiContact.created_at,
    updated_at: apiContact.updated_at,
  };
};

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

  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchContacts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first
      const response = await contactsAPI.getAll({ page, limit });
      const transformedContacts = response.items.map(transformContact);
      
      // If we have contacts from API, use them
      if (transformedContacts.length > 0) {
        setContacts(transformedContacts);
        setPagination(response.pagination);
      } else {
        // If no contacts from API, use mock data as fallback
        setContacts(mockContacts);
        setPagination({ page: 1, limit: mockContacts.length, total: mockContacts.length, totalPages: 1 });
        setError('No contacts in database - using demo data');
      }
    } catch (err) {
      // Fallback to mock data on API error
      setContacts(mockContacts);
      setPagination({ page: 1, limit: mockContacts.length, total: mockContacts.length, totalPages: 1 });
      setError('Database unavailable - using demo data');
    } finally {
      setLoading(false);
    }
  };

  const searchContacts = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactsAPI.search(query, { page: 1, limit: 50 });
      const transformedContacts = response.items.map(transformContact);
      
      setContacts(transformedContacts);
      setPagination(response.pagination);
    } catch (err) {
      // Fallback to filtering mock data
      const filteredMockContacts = mockContacts.filter(contact =>
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        contact.email.toLowerCase().includes(query.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(query.toLowerCase()))
      );
      setContacts(filteredMockContacts);
      setPagination({ page: 1, limit: filteredMockContacts.length, total: filteredMockContacts.length, totalPages: 1 });
      setError('Search failed - using filtered demo data');
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
      const transformedContact = transformContact(newContact);
      setContacts((prev) => [transformedContact, ...prev]);
      return transformedContact;
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
      const transformedContact = transformContact(updatedContact);
      setContacts((prev) => prev.map((c) => (c.id === id ? transformedContact : c)));
      return transformedContact;
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
    // Only fetch data if user is authenticated and auth check is complete
    if (isAuthenticated && !authLoading) {
      fetchContacts();
    }
  }, [isAuthenticated, authLoading]);

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
