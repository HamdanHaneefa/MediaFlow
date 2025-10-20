import { Project } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, StickyNote } from 'lucide-react';

interface ProjectNotesTabProps {
  project: Project;
}

export function ProjectNotesTab({}: ProjectNotesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Project Notes
        </h3>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Quick Note
            </label>
            <Textarea
              placeholder="Add project notes, meeting minutes, or important information..."
              className="min-h-[200px]"
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm">Save Note</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <StickyNote className="w-12 h-12 text-slate-300" />
          </div>
          <p className="text-slate-600 font-medium mb-2">
            No notes yet
          </p>
          <p className="text-sm text-slate-500">
            Start adding notes to keep track of important project information
          </p>
        </Card>
      </div>
    </div>
  );
}
