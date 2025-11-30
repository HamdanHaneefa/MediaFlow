import { useState } from 'react';
import { Event } from '@/services/api/events'; // Use the backend Event type
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, isToday, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeeklyScheduleViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

const eventTypeColors = {
  Shoot: 'bg-red-100 text-red-800 border-red-200',
  Meeting: 'bg-blue-100 text-blue-800 border-blue-200',
  Deadline: 'bg-orange-100 text-orange-800 border-orange-200',
  Milestone: 'bg-green-100 text-green-800 border-green-200',
  Delivery: 'bg-purple-100 text-purple-800 border-purple-200',
};

const hours = Array.from({ length: 24 }, (_, i) => i);

export function WeeklyScheduleView({ events, onEventClick, onTimeSlotClick }: WeeklyScheduleViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const previousWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1));
  };

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const getEventsForDayAndHour = (date: Date, hour: number): Event[] => {
    return events.filter((event) => {
      const eventStart = parseISO(event.start_time);
      return isSameDay(eventStart, date) && eventStart.getHours() === hour;
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
          >
            This Week
          </Button>
          <Button variant="outline" size="sm" onClick={previousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-8 border-b border-slate-200">
            <div className="p-2 text-sm font-medium text-slate-600 border-r border-slate-200">
              Time
            </div>
            {days.map((day) => (
              <div
                key={day.toString()}
                className={cn(
                  'p-2 text-center border-r border-slate-200',
                  isToday(day) && 'bg-blue-50'
                )}
              >
                <div className="text-xs text-slate-600">{format(day, 'EEE')}</div>
                <div
                  className={cn(
                    'text-lg font-semibold',
                    isToday(day) ? 'text-blue-600' : 'text-slate-900'
                  )}
                >
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-slate-200">
                <div className="p-2 text-xs text-slate-600 border-r border-slate-200">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                {days.map((day) => {
                  const hourEvents = getEventsForDayAndHour(day, hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={cn(
                        'min-h-[60px] p-1 border-r border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors',
                        isToday(day) && 'bg-blue-50/50'
                      )}
                      onClick={() => onTimeSlotClick(day, hour)}
                    >
                      <div className="space-y-1">
                        {hourEvents.map((event) => {
                          const attendeeCount = event.attendees.length;

                          return (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event);
                              }}
                              className="group"
                            >
                              <div
                                className={cn(
                                  'text-xs rounded p-1.5 cursor-pointer hover:shadow-md transition-shadow border',
                                  eventTypeColors[event.event_type as keyof typeof eventTypeColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                                )}
                              >
                                <div className="font-medium truncate mb-1">{event.title}</div>
                                <div className="text-xs opacity-80">
                                  {format(parseISO(event.start_time), 'HH:mm')} -{' '}
                                  {format(parseISO(event.end_time), 'HH:mm')}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1 mt-1 opacity-80">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                )}
                                {attendeeCount > 0 && (
                                  <div className="flex items-center gap-1 mt-1 opacity-80">
                                    <Users className="w-3 h-3" />
                                    <span>{attendeeCount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
