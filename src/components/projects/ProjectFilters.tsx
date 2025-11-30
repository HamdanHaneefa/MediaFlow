import { ProjectStatus, ProjectType, ProjectPhase } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ProjectStatus | 'All';
  onStatusChange: (value: ProjectStatus | 'All') => void;
  typeFilter: ProjectType | 'All';
  onTypeChange: (value: ProjectType | 'All') => void;
  phaseFilter: ProjectPhase | 'All';
  onPhaseChange: (value: ProjectPhase | 'All') => void;
  onClearFilters: () => void;
}

export function ProjectFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  phaseFilter,
  onPhaseChange,
  onClearFilters,
}: ProjectFiltersProps) {
  const hasActiveFilters = searchQuery || statusFilter !== 'All' || typeFilter !== 'All' || phaseFilter !== 'All';

  return (
    <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2 md:gap-3">
      {/* Search Input - Full width on mobile */}
      <div className="relative flex-1 w-full sm:max-w-xs md:max-w-sm">
        <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 sm:pl-9 h-9 text-sm"
        />
      </div>

      {/* Filter Dropdowns - Stack on mobile, inline on tablet+ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[120px] sm:w-[140px] md:w-[160px] h-9 text-xs sm:text-sm flex-shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[120px] sm:w-[150px] md:w-[180px] h-9 text-xs sm:text-sm flex-shrink-0">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
            <SelectItem value="Documentary">Documentary</SelectItem>
            <SelectItem value="Music Video">Music Video</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
            <SelectItem value="Short Film">Short Film</SelectItem>
            <SelectItem value="Event Coverage">Event Coverage</SelectItem>
            <SelectItem value="Social Media">Social Media</SelectItem>
          </SelectContent>
        </Select>

        <Select value={phaseFilter} onValueChange={onPhaseChange}>
          <SelectTrigger className="w-[130px] sm:w-[150px] md:w-[180px] h-9 text-xs sm:text-sm flex-shrink-0">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Phases</SelectItem>
            <SelectItem value="Pre-production">Pre-production</SelectItem>
            <SelectItem value="Production">Production</SelectItem>
            <SelectItem value="Post-production">Post-production</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-600 h-9 px-2 sm:px-3 flex-shrink-0"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline text-xs sm:text-sm">Clear</span>
          </Button>
        )}
      </div>
    </div>
  );
}
