import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  projectsAPI, 
  type CreateProjectData,
  type UpdateProjectData,
  type ProjectStats
} from '@/services/api';
import { type Project } from '@/types';

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; totalPages: number };
  fetchProjects: (page?: number, limit?: number) => Promise<void>;
  searchProjects: (query: string) => Promise<void>;
  createProject: (project: CreateProjectData) => Promise<Project | null>;
  updateProject: (id: string, updates: UpdateProjectData) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  updateProjectStatus: (id: string, status: Project['status']) => Promise<Project | null>;
  addTeamMember: (projectId: string, userId: string, role: string) => Promise<void>;
  removeTeamMember: (projectId: string, userId: string) => Promise<void>;
  updateBudget: (projectId: string, budget: number, spent: number) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  getProjectStats: () => Promise<ProjectStats | null>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Transform API Project to Frontend Project type
const transformProject = (apiProject: Record<string, any>): Project => {
  return {
    id: apiProject.id,
    title: apiProject.title || apiProject.name || '', // Use title if available, fallback to name
    description: apiProject.description,
    type: apiProject.type || 'Commercial',
    status: apiProject.status || 'Active',
    phase: apiProject.phase || 'Pre-production',
    client_id: apiProject.client_id || apiProject.contact_id,
    budget: apiProject.budget,
    start_date: apiProject.start_date,
    end_date: apiProject.end_date,
    team_members: apiProject.team_members || [],
    created_at: apiProject.created_at,
    updated_at: apiProject.updated_at,
  };
};

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load projects from database on init (don't use localStorage for initial load)
  useEffect(() => {
    // Always fetch fresh data from database on mount
    fetchProjects();
  }, []);

  const fetchProjects = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsAPI.getAll({ page, limit });
      const transformedProjects = response.items.map(transformProject);
      
      setProjects(transformedProjects);
      setPagination(response.pagination);
      
      // Save to localStorage for offline access only
      localStorage.setItem('mediaflow_projects', JSON.stringify(transformedProjects));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
      
      // Only use localStorage as fallback if API fails
      const savedProjects = localStorage.getItem('mediaflow_projects');
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          setProjects(parsed);
        } catch (parseErr) {
          console.error('Failed to parse saved projects:', parseErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const searchProjects = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsAPI.search(query, { page: 1, limit: 50 });
      const transformedProjects = response.items.map(transformProject);
      setProjects(transformedProjects);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search projects');
      console.error('Error searching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (
    projectData: CreateProjectData
  ): Promise<Project | null> => {
    try {
      setError(null);
      const newProject = await projectsAPI.create(projectData);
      const transformedProject = transformProject(newProject);
      setProjects((prev) => [transformedProject, ...prev]);
      return transformedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      console.error('Error creating project:', err);
      return null;
    }
  };

  const updateProject = async (
    id: string,
    updates: UpdateProjectData
  ): Promise<Project | null> => {
    try {
      setError(null);
      const updatedProject = await projectsAPI.update(id, updates);
      const transformedProject = transformProject(updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === id ? transformedProject : p)));
      return transformedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      console.error('Error updating project:', err);
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await projectsAPI.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      console.error('Error deleting project:', err);
      return false;
    }
  };

  const updateProjectStatus = async (
    id: string,
    status: Project['status']
  ): Promise<Project | null> => {
    try {
      setError(null);
      const updatedProject = await projectsAPI.updateStatus(id, status);
      const transformedProject = transformProject(updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === id ? transformedProject : p)));
      return transformedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project status');
      console.error('Error updating project status:', err);
      return null;
    }
  };

  const addTeamMember = async (projectId: string, userId: string, role: string) => {
    try {
      setError(null);
      
      // Optimistically update the UI first
      setProjects((prev) => {
        const updated = prev.map((p) => 
          p.id === projectId 
            ? { ...p, team_members: [...p.team_members, userId] }
            : p
        );
        
        // Persist to localStorage as backup
        localStorage.setItem('mediaflow_projects', JSON.stringify(updated));
        return updated;
      });
      
      console.log(`Adding team member ${userId} (${role}) to project ${projectId}`);
      
      // Try to update the backend
      await projectsAPI.addMember(projectId, userId, role);
      console.log(`Successfully added team member ${userId} to project ${projectId} in database`);
    } catch (err) {
      // If API fails, keep the local update but log the error
      console.error('Failed to add team member to database, but keeping local update:', err);
      setError('Team member added locally - database sync failed');
      
      // Note: We're keeping the optimistic update even if API fails
      // This ensures the UI works even when the backend is unavailable
    }
  };

  const removeTeamMember = async (projectId: string, userId: string) => {
    try {
      setError(null);
      await projectsAPI.removeMember(projectId, userId);
      // Refresh project data to get updated team members
      await fetchProjects(pagination.page, pagination.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
      console.error('Error removing team member:', err);
    }
  };

  const updateBudget = async (projectId: string, budget: number, spent: number) => {
    try {
      setError(null);
      const updatedProject = await projectsAPI.updateBudget(projectId, { budget, actual_cost: spent });
      const transformedProject = transformProject(updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? transformedProject : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      console.error('Error updating budget:', err);
    }
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find((p) => p.id === id);
  };

  const getProjectStats = async (): Promise<ProjectStats | null> => {
    try {
      const stats = await projectsAPI.getStats();
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get project stats');
      console.error('Error getting project stats:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loading,
        error,
        pagination,
        fetchProjects,
        searchProjects,
        createProject,
        updateProject,
        deleteProject,
        updateProjectStatus,
        addTeamMember,
        removeTeamMember,
        updateBudget,
        getProjectById,
        getProjectStats,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
