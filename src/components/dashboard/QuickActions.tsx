import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Calendar, Upload } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      label: 'New Project',
      icon: Plus,
      variant: 'default' as const,
      onClick: () => console.log('New Project'),
    },
    {
      label: 'Add Contact',
      icon: UserPlus,
      variant: 'outline' as const,
      onClick: () => console.log('Add Contact'),
    },
    {
      label: 'Schedule Meeting',
      icon: Calendar,
      variant: 'outline' as const,
      onClick: () => console.log('Schedule Meeting'),
    },
    {
      label: 'Upload Asset',
      icon: Upload,
      variant: 'outline' as const,
      onClick: () => console.log('Upload Asset'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto flex-col gap-2 py-4"
              onClick={action.onClick}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
