import { useState, useMemo } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTeamProjects } from '@/hooks/useTeamProjects';
import { ProjectStatus, ProjectType, ProjectPhase } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Grid3x3, List, ArrowUpDown } from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectListItem } from '@/components/projects/ProjectListItem';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectDialog } from '@/components/projects/ProjectDialog';

type ViewMode = 'grid' | 'list';
type SortOption = 'created' | 'due_date' | 'budget' | 'title';

export function Projects() {
  const { loading } = useProjects();
  // For demo purposes, using '1' as current user ID (Sarah Johnson - Manager)
  // In a real app, this would come from authentication context
  const currentUserId = '1';
  const { accessibleProjects } = useTeamProjects(currentUserId);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'All'>('All');
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('created');

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = accessibleProjects;

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter(project => project.type === typeFilter);
    }

    if (phaseFilter !== 'All') {
      filtered = filtered.filter(project => project.phase === phaseFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'due_date':
          if (!a.end_date) return 1;
          if (!b.end_date) return -1;
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        case 'created':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [accessibleProjects, searchQuery, statusFilter, typeFilter, phaseFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setPhaseFilter('All');
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between px-1 sm:px-0">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Projects
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Track your active productions
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base text-slate-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1 sm:px-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 truncate">
            Projects
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
            {filteredAndSortedProjects.length} {filteredAndSortedProjects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 min-h-[40px] sm:min-h-[44px] shrink-0 px-3 sm:px-4"
          onClick={() => setDialogOpen(true)}
          size="sm"
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Filters and Content */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-3 sm:p-4 border-b border-slate-200 space-y-3 sm:space-y-4">
          <ProjectFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            phaseFilter={phaseFilter}
            onPhaseChange={setPhaseFilter}
            onClearFilters={clearFilters}
          />

          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="grid" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Grid3x3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">List</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 hidden sm:block" />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Recently Created</SelectItem>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {filteredAndSortedProjects.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-slate-500 mb-3 sm:mb-4">
                {accessibleProjects.length === 0
                  ? 'No projects assigned to your team yet.'
                  : 'No projects match your filters.'
                }
              </p>
              {accessibleProjects.length === 0 && (
                <p className="text-xs sm:text-sm text-slate-400">
                  Contact your manager to get assigned to projects.
                </p>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAndSortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="space-y-0 overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
              {/* Hide header on mobile, show on desktop */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 rounded-t-lg border-b border-slate-200 text-sm font-medium text-slate-600 min-w-[800px]">
                <div className="col-span-3">Project</div>
                <div className="col-span-2">Client</div>
                <div className="col-span-2">Status & Phase</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-1">Team</div>
                <div className="col-span-2">Budget & Deadline</div>
              </div>
              <div className="min-w-[800px] lg:min-w-0">
                {filteredAndSortedProjects.map((project) => (
                  <ProjectListItem key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
