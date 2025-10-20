import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Target, Package } from 'lucide-react';

interface ProjectOverviewTabProps {
  project: Project;
}

export function ProjectOverviewTab({ project }: ProjectOverviewTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {project.description || 'No description provided.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Project Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-600 space-y-2">
            <p>Define project goals and objectives here.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Goal tracking coming soon</li>
              <li>Milestone management</li>
              <li>KPI monitoring</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-600 space-y-2">
            <p>Track project deliverables and outputs here.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Deliverable tracking coming soon</li>
              <li>Version management</li>
              <li>Approval workflows</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
