import { useState, useMemo } from 'react';
import { useContacts } from '@/contexts/ContactsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTasks } from '@/contexts/TasksContext';
import { Contact, ContactStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Download } from 'lucide-react';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { ContactDetailView } from '@/components/contacts/ContactDetailView';
import { ContactFilters, ContactFiltersState } from '@/components/contacts/ContactFilters';
import { BulkActions } from '@/components/contacts/BulkActions';
import { toast } from 'sonner';

export function Contacts() {
  const { contacts, loading, createContact, updateContact, deleteContact } = useContacts();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<ContactFiltersState>({
    search: '',
    role: 'all',
    status: 'all',
  });

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        filters.search === '' ||
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        (contact.company && contact.company.toLowerCase().includes(searchLower));

      const matchesRole = filters.role === 'all' || contact.role === filters.role;
      const matchesStatus = filters.status === 'all' || contact.status === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [contacts, filters]);

  const handleAddContact = () => {
    setSelectedContact(undefined);
    setDialogOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setDialogOpen(true);
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailViewOpen(true);
  };

  const handleSaveContact = async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    setSaving(true);
    try {
      if (selectedContact) {
        await updateContact(selectedContact.id, data);
        toast.success('Contact updated successfully');
      } else {
        await createContact(data);
        toast.success('Contact added successfully');
      }
    } catch (error) {
      toast.error('Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await deleteContact(contactId);
      toast.success('Contact deleted successfully');
      setSelectedContactIds(selectedContactIds.filter((id) => id !== contactId));
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedContactIds(selected ? filteredContacts.map((c) => c.id) : []);
  };

  const handleExport = () => {
    const contactsToExport =
      selectedContactIds.length > 0
        ? contacts.filter((c) => selectedContactIds.includes(c.id))
        : contacts;

    const csv = [
      ['Name', 'Email', 'Phone', 'Company', 'Role', 'Status', 'Tags', 'Notes'].join(','),
      ...contactsToExport.map((c) =>
        [
          c.name,
          c.email,
          c.phone || '',
          c.company || '',
          c.role,
          c.status,
          (c.tags || []).join(';'),
          (c.notes || '').replace(/,/g, ';'),
        ]
          .map((field) => `"${field}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${contactsToExport.length} contacts`);
    setSelectedContactIds([]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedContactIds.length} contacts?`)) {
      return;
    }

    try {
      await Promise.all(selectedContactIds.map((id) => deleteContact(id)));
      toast.success(`Deleted ${selectedContactIds.length} contacts`);
      setSelectedContactIds([]);
    } catch (error) {
      toast.error('Failed to delete contacts');
    }
  };

  const handleBulkStatusChange = async (status: ContactStatus) => {
    try {
      await Promise.all(selectedContactIds.map((id) => updateContact(id, { status })));
      toast.success(`Updated ${selectedContactIds.length} contacts`);
      setSelectedContactIds([]);
    } catch (error) {
      toast.error('Failed to update contacts');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Contacts</h2>
          <p className="text-slate-600 mt-1">Manage your client relationships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddContact} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <ContactFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalContacts={contacts.length}
        filteredCount={filteredContacts.length}
      />

      <BulkActions
        selectedCount={selectedContactIds.length}
        onExport={handleExport}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
      />

      <ContactsTable
        contacts={filteredContacts}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
        onView={handleViewContact}
        selectedContacts={selectedContactIds}
        onSelectContact={handleSelectContact}
        onSelectAll={handleSelectAll}
      />

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={selectedContact}
        onSave={handleSaveContact}
        loading={saving}
      />

      {selectedContact && (
        <ContactDetailView
          contact={selectedContact}
          projects={projects}
          tasks={tasks}
          open={detailViewOpen}
          onOpenChange={setDetailViewOpen}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
        />
      )}
    </div>
  );
}
