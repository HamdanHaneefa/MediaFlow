import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface ProjectTimelineTabProps {
  project: Project;
}

export function ProjectTimelineTab({ project }: ProjectTimelineTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-600 pl-4 space-y-6">
              <div className="relative">
                <div className="absolute -left-[21px] w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <p className="font-semibold text-slate-900">Project Start</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {project.start_date || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] w-3 h-3 bg-purple-600 rounded-full border-2 border-white"></div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <p className="font-semibold text-slate-900">Current Phase: {project.phase}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    In progress
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] w-3 h-3 bg-slate-300 rounded-full border-2 border-white"></div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <p className="font-semibold text-slate-900">Project End</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {project.end_date || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Coming soon:</span> Gantt chart view, milestone tracking, and custom timeline events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
