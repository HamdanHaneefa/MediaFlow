import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Calendar, Upload } from 'lucide-react';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { EventDialogEnhanced } from '@/components/calendar/EventDialogEnhanced';
import { useContacts } from '@/contexts/ContactsContext';
import { Contact } from '@/types';
import { toast } from 'sonner';

export function QuickActions() {
  const navigate = useNavigate();
  const { createContact } = useContacts();
  
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const handleCreateContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Transform the contact data to match the API format
      const createData = {
        first_name: contactData.name.split(' ')[0] || '',
        last_name: contactData.name.split(' ').slice(1).join(' ') || '',
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        type: 'Lead' as const,
        status: contactData.status === 'Active' ? 'Active' as const : 'Prospect' as const,
        notes: contactData.notes,
        tags: contactData.tags,
      };
      
      await createContact(createData);
      setContactDialogOpen(false);
      toast.success('Contact added successfully');
    } catch (error) {
      console.error('Failed to add contact:', error);
      toast.error('Failed to add contact');
    }
  };

  const actions = [
    {
      label: 'New Project',
      icon: Plus,
      variant: 'default' as const,
      onClick: () => setProjectDialogOpen(true),
    },
    {
      label: 'Add Contact',
      icon: UserPlus,
      variant: 'outline' as const,
      onClick: () => setContactDialogOpen(true),
    },
    {
      label: 'Schedule Meeting',
      icon: Calendar,
      variant: 'outline' as const,
      onClick: () => setEventDialogOpen(true),
    },
    {
      label: 'Upload Asset',
      icon: Upload,
      variant: 'outline' as const,
      onClick: () => navigate('/assets'),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                className="h-auto flex-col gap-1.5 sm:gap-2 py-3 sm:py-4 text-xs sm:text-sm"
                onClick={action.onClick}
              >
                <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm leading-tight text-center">
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
      />

      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSave={handleCreateContact}
      />

      <EventDialogEnhanced
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
      />
    </>
  );
}
