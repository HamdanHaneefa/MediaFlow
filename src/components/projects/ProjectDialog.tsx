import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useContacts } from '@/contexts/ContactsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTeam } from '@/contexts/TeamContext';
import { cn } from '@/lib/utils';
import { Project, ProjectPhase, ProjectStatus, ProjectType } from '@/types';
import { format } from 'date-fns';
import {
  Briefcase,
  Calendar as CalendarIcon,
  Camera,
  Check,
  ChevronsUpDown,
  FileVideo,
  Film,
  Music,
  Share2,
  Video,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

const projectTypeIcons: Record<ProjectType, React.ReactNode> = {
  'Commercial': <Film className="w-4 h-4" />,
  'Documentary': <FileVideo className="w-4 h-4" />,
  'Music Video': <Music className="w-4 h-4" />,
  'Corporate': <Briefcase className="w-4 h-4" />,
  'Short Film': <Video className="w-4 h-4" />,
  'Event Coverage': <Camera className="w-4 h-4" />,
  'Social Media': <Share2 className="w-4 h-4" />,
};

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const { createProject, updateProject } = useProjects();
  const { contacts, loading: contactsLoading } = useContacts();
  const { teamMembers, teams, teamsLoading } = useTeam();
  const isEditing = !!project;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Commercial' as ProjectType,
    status: 'Active' as ProjectStatus,
    phase: 'Pre-production' as ProjectPhase,
    client_id: '',
    budget: '',
    start_date: '',
    end_date: '',
    team_members: [] as string[],
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<'individual' | 'team'>('individual');
  const [assignedTeamId, setAssignedTeamId] = useState<string>('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        type: project.type,
        status: project.status,
        phase: project.phase,
        client_id: project.client_id || '',
        budget: project.budget?.toString() || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        team_members: project.team_members,
      });
      if (project.start_date) setStartDate(new Date(project.start_date));
      if (project.end_date) setEndDate(new Date(project.end_date));
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'Commercial',
        status: 'Active',
        phase: 'Pre-production',
        client_id: '',
        budget: '',
        start_date: '',
        end_date: '',
        team_members: [],
      });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      };

      if (isEditing) {
        await updateProject(project.id, projectData);
        toast.success('Project updated successfully');
      } else {
        await createProject(projectData);
        toast.success('Project created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save project');
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientOptions = contacts ? contacts.filter(c => c.status === 'Active') : [];
  const memberOptions = teamMembers ? teamMembers.filter(m => m.is_active !== false) : [];
  console.log('Team Members:', memberOptions);
  const teamOptions = teams || [];

  // Helper function to get member display name
  const getMemberName = (member: any) => {
    if (member.name) return member.name;
    if (member.first_name && member.last_name) return `${member.first_name} ${member.last_name}`;
    if (member.first_name) return member.first_name;
    if (member.last_name) return member.last_name;
    return 'Unknown Member';
  };

  // Helper function to get member initials
  const getMemberInitials = (member: any) => {
    const name = getMemberName(member);
    if (name === 'Unknown Member') return 'TM';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Filter members based on search query
  const filteredMembers = memberOptions.filter(member => {
    const name = getMemberName(member).toLowerCase();
    const role = (member.role || member.position || '').toLowerCase();
    const email = (member.email || '').toLowerCase();
    const searchLower = memberSearchQuery.toLowerCase();
    
    return name.includes(searchLower) || 
           role.includes(searchLower) || 
           email.includes(searchLower);
  });

  const toggleTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.includes(memberId)
        ? prev.team_members.filter(id => id !== memberId)
        : [...prev.team_members, memberId]
    }));
  };

  const selectedMembers = memberOptions.filter(c => formData.team_members.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update project details' : 'Fill in the information to create a new project'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Project Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as ProjectType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(projectTypeIcons).map(([type, icon]) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {icon}
                          <span>{type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phase">Phase *</Label>
                <Select
                  value={formData.phase}
                  onValueChange={(value) => setFormData({ ...formData, phase: value as ProjectPhase })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-production">Pre-production</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Post-production">Post-production</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={clientSearchOpen}
                      className="w-full justify-between"
                    >
                      {formData.client_id
                        ? clientOptions.find((client) => client.id === formData.client_id)?.name
                        : "Select client..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search contacts..." />
                      <CommandList>
                        <CommandEmpty>
                          {contactsLoading ? "Loading contacts..." : "No contact found."}
                        </CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-48">
                            {contactsLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <div className="text-sm text-muted-foreground">Loading contacts...</div>
                              </div>
                            ) : (
                              clientOptions.map((client) => (
                                <CommandItem
                                  key={client.id}
                                  onSelect={() => {
                                    setFormData({ ...formData, client_id: client.id });
                                    setClientSearchOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{client.name}</p>
                                      <p className="text-xs text-muted-foreground">{client.role} • {client.email}</p>
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        formData.client_id === client.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                  </div>
                                </CommandItem>
                              ))
                            )}
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Enter budget amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={assignMode} onValueChange={(value) => setAssignMode(value as 'individual' | 'team')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Members</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignMode === 'team' ? (
              <div className="space-y-2">
                <Label>Team</Label>
                <Select value={assignedTeamId} onValueChange={(value) => setAssignedTeamId(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamsLoading ? (
                      <SelectItem value="" disabled>Loading teams...</SelectItem>
                    ) : (
                      teamOptions.map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Team Members</Label>
                <Input
                  placeholder="Search team members..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-slate-50",
                        formData.team_members.includes(member.id) && "bg-blue-50 hover:bg-blue-100"
                      )}
                      onClick={() => toggleTeamMember(member.id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getMemberInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{getMemberName(member)}</p>
                        <p className="text-xs text-slate-600">{member.role || member.position || 'No Role'}</p>
                      </div>
                      {formData.team_members.includes(member.id) && (
                        <Badge className="bg-blue-600">Selected</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {filteredMembers.length === 0 && memberSearchQuery && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No members found matching "{memberSearchQuery}"
                  </p>
                )}
                {formData.team_members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {memberOptions.filter(m => formData.team_members.includes(m.id)).map((member) => (
                      <Badge key={member.id} variant="secondary" className="gap-1">
                        {getMemberName(member)}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => toggleTeamMember(member.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            </form>
          </ScrollArea>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
