import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByAssignee: (contactId: string) => Task[];
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Task | null> => {
    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

      if (createError) throw createError;
      if (data) {
        setTasks((prev) => [data, ...prev]);
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error('Error creating task:', err);
      return null;
    }
  };

  const updateTask = async (
    id: string,
    updates: Partial<Task>
  ): Promise<Task | null> => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
        return data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error('Error updating task:', err);
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error('Error deleting task:', err);
      return false;
    }
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find((t) => t.id === id);
  };

  const getTasksByProject = (projectId: string): Task[] => {
    return tasks.filter((t) => t.project_id === projectId);
  };

  const getTasksByAssignee = (contactId: string): Task[] => {
    return tasks.filter((t) => t.assigned_to === contactId);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        getTaskById,
        getTasksByProject,
        getTasksByAssignee,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
