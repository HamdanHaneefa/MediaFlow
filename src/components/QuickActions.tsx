import { useState } from 'react';
import { Plus, X, CheckSquare, Briefcase, Users, Calendar, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const quickActions = [
  { icon: CheckSquare, label: 'New Task', color: 'bg-green-600 hover:bg-green-700' },
  { icon: Briefcase, label: 'New Project', color: 'bg-blue-600 hover:bg-blue-700' },
  { icon: Users, label: 'Add Contact', color: 'bg-purple-600 hover:bg-purple-700' },
  { icon: Calendar, label: 'New Event', color: 'bg-orange-600 hover:bg-orange-700' },
  { icon: Upload, label: 'Upload Asset', color: 'bg-pink-600 hover:bg-pink-700' },
];

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
      <div
        className={cn(
          'flex flex-col-reverse gap-3 mb-3 transition-all duration-200',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {quickActions.map((action, index) => (
          <button
            key={action.label}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-full shadow-lg',
              'text-white font-medium text-sm transition-all',
              'touch-manipulation min-h-[48px]',
              action.color,
              'transform hover:scale-105 active:scale-95'
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <action.icon className="w-5 h-5" />
            <span className="whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>

      <Button
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg',
          'bg-blue-600 hover:bg-blue-700',
          'transition-transform touch-manipulation',
          isOpen && 'rotate-45'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
