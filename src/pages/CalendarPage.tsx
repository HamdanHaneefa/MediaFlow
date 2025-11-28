import { useState } from 'react';
// import { useEvents } from '@/contexts/EventsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Calendar, List, Clock, AlertCircle } from 'lucide-react';
import { MonthlyCalendarView } from '@/components/calendar/MonthlyCalendarView';
import { WeeklyScheduleView } from '@/components/calendar/WeeklyScheduleView';
import { TimelineView } from '@/components/calendar/TimelineView';
import { EventDialogEnhanced } from '@/components/calendar/EventDialogEnhanced';
import { Event } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ViewMode = 'month' | 'week' | 'timeline';

export function CalendarPage() {
  // const { events, loading } = useEvents(); // Temporarily disabled - uses Supabase
  const events: Event[] = []; // Temporary empty array
  const loading = false;
  const { projects } = useProjects();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [defaultTime, setDefaultTime] = useState<number | undefined>();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setDefaultDate(undefined);
    setDefaultTime(undefined);
    setEventDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedEvent(undefined);
    setDefaultDate(date);
    setDefaultTime(undefined);
    setEventDialogOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedEvent(undefined);
    setDefaultDate(date);
    setDefaultTime(hour);
    setEventDialogOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setDefaultDate(new Date());
    setDefaultTime(undefined);
    setEventDialogOpen(true);
  };

  const handleProjectClick = (project: any) => {
    navigate(`/projects/${project.id}`);
  };

  const eventStats = {
    total: events.length,
    scheduled: events.filter((e) => e.status === 'Scheduled').length,
    inProgress: events.filter((e) => e.status === 'In Progress').length,
    completed: events.filter((e) => e.status === 'Completed').length,
    shoots: events.filter((e) => e.event_type === 'Shoot').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Calendar</h2>
            <p className="text-slate-600 mt-1">Loading schedule...</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-500">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-900">Calendar Feature Under Development</h3>
            <p className="text-sm text-yellow-700 mt-1">
              The calendar feature is currently being migrated from Supabase to the backend API. 
              This page will be fully functional once the events API endpoint is implemented.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Calendar</h2>
          <p className="text-slate-600 mt-1">Schedule shoots, meetings, and track production milestones</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddEvent}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Total Events</div>
          <div className="text-2xl font-bold text-slate-900">{eventStats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Scheduled</div>
          <div className="text-2xl font-bold text-blue-600">{eventStats.scheduled}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-orange-600">{eventStats.inProgress}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">{eventStats.completed}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Shoots</div>
          <div className="text-2xl font-bold text-red-600">{eventStats.shoots}</div>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="month" className="gap-2">
            <Calendar className="w-4 h-4" />
            Month
          </TabsTrigger>
          <TabsTrigger value="week" className="gap-2">
            <List className="w-4 h-4" />
            Week
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="w-4 h-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-6">
          <MonthlyCalendarView
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          <WeeklyScheduleView
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineView
            projects={projects}
            events={events}
            onEventClick={handleEventClick}
            onProjectClick={handleProjectClick}
          />
        </TabsContent>
      </Tabs>

      <EventDialogEnhanced
        open={eventDialogOpen}
        onOpenChange={(open) => {
          setEventDialogOpen(open);
          if (!open) {
            setSelectedEvent(undefined);
            setDefaultDate(undefined);
            setDefaultTime(undefined);
          }
        }}
        event={selectedEvent}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
      />
    </div>
  );
}
