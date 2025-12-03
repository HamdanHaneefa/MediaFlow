import { useState, useEffect } from 'react';
import { Event, EventType, EventStatus } from '@/types';
import { useEvents } from '@/contexts/EventsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useContacts } from '@/contexts/ContactsContext';
// import { useResources } from '@/contexts/ResourcesContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
  defaultDate?: Date;
  defaultTime?: number;
  defaultProjectId?: string;
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  defaultTime,
  defaultProjectId,
}: EventDialogProps) {
  const { createEvent, updateEvent, checkConflicts } = useEvents();
  const { projects } = useProjects();
  const { contacts } = useContacts();
  // const { locations, equipment } = useResources();
  
  // Temporary mock data for disabled contexts
  const locations: Array<{ id: string; name: string }> = [];
  const equipment: Array<{ id: string; name: string; category: string }> = [];
  
  const isEditing = !!event;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Meeting' as EventType,
    start_time: '',
    end_time: '',
    project_id: defaultProjectId || 'none',
    location_id: 'none',
    status: 'Scheduled' as EventStatus,
    notes: '',
  });

  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"),
        project_id: event.project_id || 'none',
        location_id: event.location_id || 'none',
        status: event.status,
        notes: event.notes || '',
      });
      setSelectedAttendees(event.attendees);
      setSelectedEquipment(event.equipment_needed || []);
    } else if (defaultDate) {
      const startHour = defaultTime !== undefined ? defaultTime : 9;
      const startDateTime = new Date(defaultDate);
      startDateTime.setHours(startHour, 0, 0, 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startHour + 1, 0, 0, 0);

      setFormData({
        title: '',
        description: '',
        event_type: 'Meeting',
        start_time: format(startDateTime, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endDateTime, "yyyy-MM-dd'T'HH:mm"),
        project_id: defaultProjectId || 'none',
        location_id: 'none',
        status: 'Scheduled',
        notes: '',
      });
      setSelectedAttendees([]);
      setSelectedEquipment([]);
    }
  }, [event, defaultDate, defaultTime, defaultProjectId, open]);

  useEffect(() => {
    if (formData.start_time && formData.end_time && selectedAttendees.length > 0) {
      const foundConflicts = checkConflicts(
        formData.start_time,
        formData.end_time,
        selectedAttendees,
        event?.id
      );
      setConflicts(foundConflicts);
    } else {
      setConflicts([]);
    }
  }, [formData.start_time, formData.end_time, selectedAttendees, event?.id, checkConflicts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        project_id: formData.project_id === 'none' ? undefined : formData.project_id,
        location_id: formData.location_id === 'none' ? undefined : formData.location_id,
        attendees: selectedAttendees,
        equipment_needed: selectedEquipment,
        is_all_day: false,
      };

      if (isEditing) {
        await updateEvent(event.id, eventData);
        toast.success('Event updated successfully');
      } else {
        await createEvent(eventData);
        toast.success('Event created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save event');
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendee = (contactId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipmentId)
        ? prev.filter((id) => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const activeContacts = contacts.filter((c) => c.status === 'Active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update event details' : 'Schedule a new event for your production'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value as EventType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shoot">Shoot</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Deadline">Deadline</SelectItem>
                  <SelectItem value="Milestone">Milestone</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as EventStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Project</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_id">Location</Label>
              <Select
                value={formData.location_id}
                onValueChange={(value) => setFormData({ ...formData, location_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No location</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Attendees</Label>
              <div className="border border-slate-200 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                {activeContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`attendee-${contact.id}`}
                      checked={selectedAttendees.includes(contact.id)}
                      onCheckedChange={() => toggleAttendee(contact.id)}
                    />
                    <label
                      htmlFor={`attendee-${contact.id}`}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{contact.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {contact.role}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {formData.event_type === 'Shoot' && (
              <div className="col-span-2 space-y-2">
                <Label>Equipment Needed</Label>
                <div className="border border-slate-200 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {equipment.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`equipment-${item.id}`}
                        checked={selectedEquipment.includes(item.id)}
                        onCheckedChange={() => toggleEquipment(item.id)}
                      />
                      <label
                        htmlFor={`equipment-${item.id}`}
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                      >
                        <span className="text-sm">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-900 mb-1">
                    Scheduling Conflicts Detected
                  </h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    {conflicts.length} event{conflicts.length > 1 ? 's' : ''} conflict with this schedule
                  </p>
                  <div className="space-y-1">
                    {conflicts.map((conflict) => (
                      <div key={conflict.id} className="text-xs text-yellow-800">
                        • {conflict.title} ({format(new Date(conflict.start_time), 'MMM d, HH:mm')})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
