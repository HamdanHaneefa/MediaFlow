import { useState, useEffect } from 'react';
import { Event, EventType, EventStatus, Contact } from '@/types';
import { useEvents } from '@/contexts/EventsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useContacts } from '@/contexts/ContactsContext';
import { useResources } from '@/contexts/ResourcesContext';
import { useCrewAvailability } from '@/contexts/CrewAvailabilityContext';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Users, Package, Video, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EventDialogEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
  defaultDate?: Date;
  defaultTime?: number;
  defaultProjectId?: string;
}

interface MediaOptions {
  resolution?: string;
  format?: string;
  duration?: string;
  shotCount?: number;
  stylePreferences?: string;
  deliveryMethod?: string;
  recipientInfo?: string;
  fileSpecs?: string;
  agenda?: string;
  meetingRoom?: string;
  deliverables?: string[];
  submissionDetails?: string;
  milestoneCriteria?: string;
  dependencies?: string;
}

export function EventDialogEnhanced({
  open,
  onOpenChange,
  event,
  defaultDate,
  defaultTime,
  defaultProjectId,
}: EventDialogEnhancedProps) {
  const { createEvent, updateEvent, checkConflicts } = useEvents();
  const { projects } = useProjects();
  const { contacts } = useContacts();
  const { locations, equipment, createBooking, checkEquipmentConflicts, getAvailableEquipment } = useResources();
  const { checkCrewAvailability, getAvailableCrewForDateRange } = useCrewAvailability();
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

  const [mediaOptions, setMediaOptions] = useState<MediaOptions>({});
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<Event[]>([]);
  const [crewConflicts, setCrewConflicts] = useState<Map<string, { status: string; conflicts: any[] }>>(new Map());
  const [equipmentConflicts, setEquipmentConflicts] = useState<Map<string, any[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [allowOverbooking, setAllowOverbooking] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

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
      setSelectedAttendees(event.attendees || []);
      setSelectedCrew([]);
      setSelectedEquipment(event.equipment_needed || []);
      setMediaOptions({});
      setAllowOverbooking(false);
    } else {
      const startHour = defaultTime !== undefined ? defaultTime : 9;
      const startDateTime = defaultDate ? new Date(defaultDate) : new Date();
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
      setSelectedCrew([]);
      setSelectedEquipment([]);
      setMediaOptions({});
      setAllowOverbooking(false);
    }
  }, [event, defaultDate, defaultTime, defaultProjectId, open]);

  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const attendeeConflicts = checkConflicts(
        formData.start_time,
        formData.end_time,
        selectedAttendees,
        event?.id
      );
      setConflicts(attendeeConflicts);

      const crewConflictMap = new Map();
      selectedCrew.forEach((crewId) => {
        const result = checkCrewAvailability(crewId, formData.start_time.split('T')[0], formData.end_time.split('T')[0]);
        if (!result.isAvailable || result.status === 'Tentative') {
          crewConflictMap.set(crewId, result);
        }
      });
      setCrewConflicts(crewConflictMap);

      const equipmentConflictMap = new Map();
      selectedEquipment.forEach((equipId) => {
        const conflicts = checkEquipmentConflicts(equipId, formData.start_time, formData.end_time, event?.id);
        if (conflicts.length > 0) {
          equipmentConflictMap.set(equipId, conflicts);
        }
      });
      setEquipmentConflicts(equipmentConflictMap);
    } else {
      setConflicts([]);
      setCrewConflicts(new Map());
      setEquipmentConflicts(new Map());
    }
  }, [formData.start_time, formData.end_time, selectedAttendees, selectedCrew, selectedEquipment, event?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasCriticalConflicts = crewConflicts.size > 0 || equipmentConflicts.size > 0;

    if (hasCriticalConflicts && !allowOverbooking) {
      toast.error('Resource conflicts detected. Please review and approve overbooking if necessary.');
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        ...formData,
        project_id: formData.project_id === 'none' ? undefined : formData.project_id,
        location_id: formData.location_id === 'none' ? undefined : formData.location_id,
        attendees: [...selectedAttendees, ...selectedCrew],
        equipment_needed: selectedEquipment,
        notes: formData.notes + (mediaOptions ? `\n\nMedia Options: ${JSON.stringify(mediaOptions, null, 2)}` : ''),
      };

      let savedEvent: Event | null = null;

      if (isEditing) {
        savedEvent = await updateEvent(event.id, eventData);
        toast.success('Event updated successfully');
      } else {
        savedEvent = await createEvent(eventData);
        toast.success('Event created successfully');
      }

      if (savedEvent && selectedEquipment.length > 0) {
        for (const equipmentId of selectedEquipment) {
          await createBooking({
            equipment_id: equipmentId,
            event_id: savedEvent.id,
            start_time: formData.start_time,
            end_time: formData.end_time,
            status: 'Reserved',
            notes: allowOverbooking ? 'Approved overbooking' : '',
          });
        }
        toast.success('Equipment bookings created');
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

  const toggleCrew = (contactId: string) => {
    setSelectedCrew((prev) =>
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
  const crewMembers = activeContacts.filter((c) =>
    c.role === 'Freelancer' || c.role === 'Vendor'
  );
  const attendeeContacts = activeContacts.filter((c) =>
    c.role === 'Client' || c.role === 'Partner'
  );

  const availableCrew = formData.start_time && formData.end_time
    ? getAvailableCrewForDateRange(formData.start_time.split('T')[0], formData.end_time.split('T')[0])
    : [];

  const availableEquipmentList = formData.start_time && formData.end_time
    ? getAvailableEquipment(formData.start_time, formData.end_time)
    : [];

  const getSuggestedAlternativeCrew = (currentCrewId: string): Contact[] => {
    const currentCrew = contacts.find(c => c.id === currentCrewId);
    if (!currentCrew) return [];

    return crewMembers.filter(c =>
      c.id !== currentCrewId &&
      availableCrew.includes(c.id) &&
      c.role === currentCrew.role
    ).slice(0, 3);
  };

  const getSuggestedAlternativeEquipment = (currentEquipId: string) => {
    const currentEquip = equipment.find(e => e.id === currentEquipId);
    if (!currentEquip) return [];

    return availableEquipmentList.filter(e =>
      e.id !== currentEquipId &&
      e.category === currentEquip.category
    ).slice(0, 3);
  };

  const totalConflicts = conflicts.length + crewConflicts.size + equipmentConflicts.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update event details' : 'Schedule a new event for your production'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="people">
                <Users className="w-4 h-4 mr-1" />
                People
                {(selectedAttendees.length + selectedCrew.length > 0) && (
                  <Badge variant="secondary" className="ml-1">{selectedAttendees.length + selectedCrew.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resources">
                <Package className="w-4 h-4 mr-1" />
                Resources
                {selectedEquipment.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{selectedEquipment.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="details">
                <FileText className="w-4 h-4 mr-1" />
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
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
              </div>
            </TabsContent>

            <TabsContent value="people" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Attendees (Clients & Partners)</Label>
                  <div className="border border-slate-200 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                    {attendeeContacts.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-2">No attendees available</p>
                    ) : (
                      attendeeContacts.map((contact) => (
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
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Crew Assignment (Freelancers & Vendors)</Label>
                  <div className="border border-slate-200 rounded-lg p-3 max-h-[250px] overflow-y-auto space-y-2">
                    {crewMembers.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-2">No crew members available</p>
                    ) : (
                      crewMembers.map((contact) => {
                        const isAvailable = availableCrew.includes(contact.id);
                        const conflict = crewConflicts.get(contact.id);
                        const suggestions = conflict ? getSuggestedAlternativeCrew(contact.id) : [];

                        return (
                          <div key={contact.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`crew-${contact.id}`}
                                checked={selectedCrew.includes(contact.id)}
                                onCheckedChange={() => toggleCrew(contact.id)}
                              />
                              <label
                                htmlFor={`crew-${contact.id}`}
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-green-600 text-white text-xs">
                                    {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{contact.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {contact.role}
                                </Badge>
                                {isAvailable ? (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Available
                                  </Badge>
                                ) : conflict ? (
                                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {conflict.status}
                                  </Badge>
                                ) : null}
                              </label>
                            </div>
                            {conflict && suggestions.length > 0 && (
                              <div className="ml-8 pl-2 border-l-2 border-slate-200 text-xs text-slate-600">
                                <span className="font-medium">Suggested alternatives:</span>
                                {suggestions.map(alt => (
                                  <div key={alt.id} className="ml-2">• {alt.name}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Equipment Checklist</Label>
                <div className="border border-slate-200 rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-2">
                  {equipment.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-2">No equipment available</p>
                  ) : (
                    equipment.map((item) => {
                      const isAvailable = availableEquipmentList.some(e => e.id === item.id);
                      const conflict = equipmentConflicts.get(item.id);
                      const suggestions = conflict ? getSuggestedAlternativeEquipment(item.id) : [];

                      return (
                        <div key={item.id} className="space-y-1">
                          <div className="flex items-center gap-2">
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
                              {item.status === 'Available' && isAvailable ? (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Available
                                </Badge>
                              ) : conflict ? (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Booked
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {item.status}
                                </Badge>
                              )}
                            </label>
                          </div>
                          {conflict && suggestions.length > 0 && (
                            <div className="ml-8 pl-2 border-l-2 border-slate-200 text-xs text-slate-600">
                              <span className="font-medium">Suggested alternatives:</span>
                              {suggestions.map(alt => (
                                <div key={alt.id} className="ml-2">• {alt.name} ({alt.category})</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              {formData.event_type === 'Shoot' && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Shoot Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Resolution</Label>
                      <Input
                        placeholder="e.g., 4K, 1080p"
                        value={mediaOptions.resolution || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, resolution: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Input
                        placeholder="e.g., MP4, ProRes"
                        value={mediaOptions.format || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, format: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Duration</Label>
                      <Input
                        placeholder="e.g., 30s, 2min"
                        value={mediaOptions.duration || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, duration: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Shot Count</Label>
                      <Input
                        type="number"
                        placeholder="Number of shots"
                        value={mediaOptions.shotCount || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, shotCount: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Style Preferences</Label>
                      <Textarea
                        placeholder="Describe the visual style, mood, and aesthetic preferences"
                        value={mediaOptions.stylePreferences || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, stylePreferences: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.event_type === 'Meeting' && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Meeting Details
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Meeting Room</Label>
                      <Input
                        placeholder="e.g., Conference Room A"
                        value={mediaOptions.meetingRoom || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, meetingRoom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Agenda</Label>
                      <Textarea
                        placeholder="Enter meeting agenda and topics"
                        value={mediaOptions.agenda || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, agenda: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.event_type === 'Deadline' && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Deadline Details
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Deliverables</Label>
                      <Textarea
                        placeholder="List deliverables (one per line)"
                        value={mediaOptions.deliverables?.join('\n') || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, deliverables: e.target.value.split('\n').filter(Boolean) })}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Submission Details</Label>
                      <Textarea
                        placeholder="How and where to submit deliverables"
                        value={mediaOptions.submissionDetails || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, submissionDetails: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.event_type === 'Milestone' && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Milestone Details
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Milestone Criteria</Label>
                      <Textarea
                        placeholder="Define the criteria for completing this milestone"
                        value={mediaOptions.milestoneCriteria || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, milestoneCriteria: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dependencies</Label>
                      <Textarea
                        placeholder="List any dependencies or prerequisites"
                        value={mediaOptions.dependencies || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, dependencies: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.event_type === 'Delivery' && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Delivery Details
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Delivery Method</Label>
                      <Input
                        placeholder="e.g., Email, FTP, Cloud Storage"
                        value={mediaOptions.deliveryMethod || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, deliveryMethod: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Recipient Information</Label>
                      <Textarea
                        placeholder="Recipient name, email, and contact details"
                        value={mediaOptions.recipientInfo || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, recipientInfo: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>File Specifications</Label>
                      <Textarea
                        placeholder="File formats, naming conventions, and technical requirements"
                        value={mediaOptions.fileSpecs || ''}
                        onChange={(e) => setMediaOptions({ ...mediaOptions, fileSpecs: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes or special instructions"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          {totalConflicts > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-900 mb-1">
                    Resource Conflicts Detected ({totalConflicts})
                  </h4>

                  {conflicts.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-yellow-800 font-medium">Attendee Conflicts:</p>
                      <div className="space-y-1 ml-2">
                        {conflicts.map((conflict) => (
                          <div key={conflict.id} className="text-xs text-yellow-800">
                            • {conflict.title} ({format(new Date(conflict.start_time), 'MMM d, HH:mm')})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {crewConflicts.size > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-yellow-800 font-medium">Crew Conflicts:</p>
                      <div className="space-y-1 ml-2">
                        {Array.from(crewConflicts.entries()).map(([crewId, conflict]) => {
                          const crew = contacts.find(c => c.id === crewId);
                          return (
                            <div key={crewId} className="text-xs text-yellow-800">
                              • {crew?.name} - {conflict.status}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {equipmentConflicts.size > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-yellow-800 font-medium">Equipment Conflicts:</p>
                      <div className="space-y-1 ml-2">
                        {Array.from(equipmentConflicts.entries()).map(([equipId, conflicts]) => {
                          const equip = equipment.find(e => e.id === equipId);
                          return (
                            <div key={equipId} className="text-xs text-yellow-800">
                              • {equip?.name} - {conflicts.length} booking(s)
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-yellow-200">
                    <Checkbox
                      id="allow-overbooking"
                      checked={allowOverbooking}
                      onCheckedChange={(checked) => setAllowOverbooking(checked as boolean)}
                    />
                    <label htmlFor="allow-overbooking" className="text-sm text-yellow-900 cursor-pointer">
                      I approve overbooking and will manually resolve conflicts
                    </label>
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
