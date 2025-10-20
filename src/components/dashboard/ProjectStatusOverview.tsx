import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, ProjectPhase } from '@/types';
import { cn } from '@/lib/utils';

interface PhaseData {
  phase: ProjectPhase;
  count: number;
  color: string;
  bgColor: string;
  projects: Project[];
}

interface ProjectStatusOverviewProps {
  projects: Project[];
}

export function ProjectStatusOverview({ projects }: ProjectStatusOverviewProps) {
  const phases: ProjectPhase[] = ['Pre-production', 'Production', 'Post-production', 'Delivered'];

  const phaseColors = {
    'Pre-production': { color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-300' },
    'Production': { color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
    'Post-production': { color: 'text-violet-700', bgColor: 'bg-violet-100', borderColor: 'border-violet-300' },
    'Delivered': { color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300' },
  };

  const phaseData: PhaseData[] = phases.map((phase) => {
    const phaseProjects = projects.filter((p) => p.phase === phase && p.status === 'Active');
    return {
      phase,
      count: phaseProjects.length,
      color: phaseColors[phase].color,
      bgColor: phaseColors[phase].bgColor,
      projects: phaseProjects,
    };
  });

  const totalActiveProjects = projects.filter((p) => p.status === 'Active').length;

  if (totalActiveProjects === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-slate-500 font-medium">No active projects</p>
            <p className="text-sm text-slate-400 mt-1">
              Create a new project to see your pipeline
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Pipeline</span>
          <Badge variant="secondary" className="text-xs">
            {totalActiveProjects} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-3">
            {phaseData.map((data) => (
              <div key={data.phase} className="text-center">
                <div
                  className={cn(
                    'w-full h-24 rounded-lg flex items-center justify-center mb-2 border-2 transition-all hover:shadow-md',
                    data.bgColor,
                    phaseColors[data.phase].borderColor
                  )}
                >
                  <span className={cn('text-3xl font-bold', data.color)}>
                    {data.count}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700">{data.phase}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Projects by Phase</h4>
            <div className="space-y-3">
              {phaseData
                .filter((data) => data.count > 0)
                .map((data) => (
                  <div key={data.phase}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{data.phase}</span>
                      <span className="text-xs text-slate-500">{data.count} projects</span>
                    </div>
                    <div className="space-y-2">
                      {data.projects.slice(0, 2).map((project) => (
                        <div
                          key={project.id}
                          className={cn(
                            'p-2 rounded-md border text-sm',
                            data.bgColor,
                            phaseColors[data.phase].borderColor
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900 truncate">
                              {project.title}
                            </span>
                            <Badge variant="outline" className="text-xs ml-2">
                              {project.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {data.count > 2 && (
                        <p className="text-xs text-slate-500 text-center">
                          +{data.count - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
