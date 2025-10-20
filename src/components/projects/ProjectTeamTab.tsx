import { Project } from '@/types';
import { useContacts } from '@/contexts/ContactsContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, Phone, UserPlus } from 'lucide-react';

interface ProjectTeamTabProps {
  project: Project;
}

export function ProjectTeamTab({ project }: ProjectTeamTabProps) {
  const { contacts } = useContacts();

  const teamMembers = project.team_members
    .map(memberId => contacts.find(c => c.id === memberId))
    .filter((contact): contact is NonNullable<typeof contact> => contact !== null && contact !== undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Team Members ({teamMembers.length})
        </h3>
        <Button size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {teamMembers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500">No team members assigned yet.</p>
          <Button variant="outline" size="sm" className="mt-4">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <Card key={member?.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {member?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {member?.name}
                  </p>
                  {member?.company && (
                    <p className="text-sm text-slate-600 truncate">
                      {member?.company}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-1">
                    {member?.role}
                  </Badge>
                  <div className="flex gap-2 mt-3">
                    {member?.email && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                    {member?.phone && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
