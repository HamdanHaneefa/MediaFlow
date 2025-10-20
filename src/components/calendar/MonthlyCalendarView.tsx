import { useState } from 'react';
import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface MonthlyCalendarViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

const eventTypeColors = {
  Shoot: 'bg-red-100 text-red-800 border-red-200',
  Meeting: 'bg-blue-100 text-blue-800 border-blue-200',
  Deadline: 'bg-orange-100 text-orange-800 border-orange-200',
  Milestone: 'bg-green-100 text-green-800 border-green-200',
  Delivery: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function MonthlyCalendarView({ events, onEventClick, onDateClick }: MonthlyCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getEventsForDay = (date: Date): Event[] => {
    return events.filter((event) => {
      const eventDate = parseISO(event.start_time);
      return isSameDay(eventDate, date);
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-slate-600 border-b border-slate-200"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                'min-h-[120px] border-b border-r border-slate-200 p-2 cursor-pointer hover:bg-slate-50 transition-colors',
                !isCurrentMonth && 'bg-slate-50/50',
                index % 7 === 6 && 'border-r-0'
              )}
              onClick={() => onDateClick(day)}
            >
              <div
                className={cn(
                  'text-sm font-medium mb-1',
                  isCurrentMonth ? 'text-slate-900' : 'text-slate-400',
                  isCurrentDay && 'inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full'
                )}
              >
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="group"
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-xs px-1.5 py-0.5 cursor-pointer hover:shadow-sm transition-shadow',
                        eventTypeColors[event.event_type]
                      )}
                    >
                      <span className="truncate">
                        {format(parseISO(event.start_time), 'HH:mm')} {event.title}
                      </span>
                    </Badge>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500 px-1.5">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
