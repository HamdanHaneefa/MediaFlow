import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types';

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  getProjectById: (id: string) => Project | undefined;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project | null> => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setProjects((prev) => [data, ...prev]);
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      console.error('Error creating project:', err);
      return null;
    }
  };

  const updateProject = async (
    id: string,
    updates: Partial<Project>
  ): Promise<Project | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      console.error('Error updating project:', err);
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      console.error('Error deleting project:', err);
      return false;
    }
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find((p) => p.id === id);
  };

  useEffect(() => {
    // For demo purposes, add some mock projects
    const mockProjects: Project[] = [
      {
        id: 'proj-1',
        title: 'Nike Commercial Campaign',
        description: 'High-energy commercial for Nike\'s new athletic line',
        type: 'Commercial',
        status: 'Active',
        phase: 'Production',
        client_id: 'client-1',
        budget: 50000,
        start_date: '2024-11-01',
        end_date: '2024-12-15',
        team_members: ['1', '2', '4'],
        created_at: '2024-11-01T00:00:00Z',
        updated_at: '2024-11-25T00:00:00Z',
      },
      {
        id: 'proj-2',
        title: 'Tech Startup Documentary',
        description: 'Behind-the-scenes documentary about a growing tech startup',
        type: 'Documentary',
        status: 'Active',
        phase: 'Post-production',
        client_id: 'client-2',
        budget: 30000,
        start_date: '2024-10-15',
        end_date: '2024-12-01',
        team_members: ['1', '3'],
        created_at: '2024-10-15T00:00:00Z',
        updated_at: '2024-11-20T00:00:00Z',
      },
      {
        id: 'proj-3',
        title: 'Music Video - Indie Artist',
        description: 'Creative music video for an upcoming indie artist',
        type: 'Music Video',
        status: 'Active',
        phase: 'Post-production',
        client_id: 'client-3',
        budget: 15000,
        start_date: '2024-11-10',
        end_date: '2024-11-30',
        team_members: ['2', '3'],
        created_at: '2024-11-10T00:00:00Z',
        updated_at: '2024-11-22T00:00:00Z',
      },
    ];
    
    setProjects(mockProjects);
    setLoading(false);
  }, []);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loading,
        error,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        getProjectById,
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
