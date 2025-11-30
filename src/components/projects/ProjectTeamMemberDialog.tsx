import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContacts } from '@/contexts/ContactsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { Project } from '@/types';
import { toast } from 'sonner';

interface ProjectTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

const teamRoles = [
  'Producer',
  'Director', 
  'Editor',
  'Camera Operator',
  'Audio Engineer',
  'Assistant',
  'Freelancer',
  'Manager'
];

export function ProjectTeamMemberDialog({ 
  open, 
  onOpenChange, 
  project 
}: ProjectTeamMemberDialogProps) {
  const { contacts } = useContacts();
  const { addTeamMember } = useProjects();
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out contacts that are already team members
  const availableContacts = contacts.filter(
    contact => !project.team_members.includes(contact.id)
  );

  // Debug logging
  console.log('Dialog opened with:', { 
    contactsCount: contacts.length, 
    availableContactsCount: availableContacts.length, 
    projectTeamMembers: project.team_members 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContactId || !selectedRole) {
      toast.error('Please select a contact and role');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addTeamMember(project.id, selectedContactId, selectedRole);
      toast.success('Team member added successfully');
      onOpenChange(false);
      
      // Reset form
      setSelectedContactId('');
      setSelectedRole('');
    } catch (error) {
      toast.error('Failed to add team member');
      console.error('Error adding team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedContactId('');
    setSelectedRole('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a team member to "{project.title}" project.
            {contacts.length === 0 && (
              <div className="mt-2 text-amber-600">
                No contacts available. Please add contacts first.
              </div>
            )}
            {contacts.length > 0 && availableContacts.length === 0 && (
              <div className="mt-2 text-amber-600">
                All contacts are already team members.
              </div>
            )}
            <div className="mt-2 text-xs text-slate-500">
              Debug: {contacts.length} total contacts, {availableContacts.length} available
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact">Select Contact</Label>
            <Select value={selectedContactId} onValueChange={setSelectedContactId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a contact" />
              </SelectTrigger>
              <SelectContent>
                {availableContacts.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-slate-500">
                    {contacts.length === 0 
                      ? `No contacts available (Total contacts: ${contacts.length})`
                      : `All ${contacts.length} contacts are already team members`
                    }
                  </div>
                ) : (
                  availableContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{contact.name}</span>
                        {contact.company && (
                          <span className="text-xs text-slate-500">{contact.company}</span>
                        )}
                        <span className="text-xs text-slate-400">{contact.role}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {teamRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedContactId || !selectedRole}
            >
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
