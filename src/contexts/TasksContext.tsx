import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  tasksAPI, 
  type Task, 
  type CreateTaskData,
  type UpdateTaskData,
  type TaskStats
} from '@/services/api';
import { useAuth } from './AuthContext';

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; totalPages: number };
  fetchTasks: (params?: { page?: number; limit?: number; status?: string; priority?: string; project_id?: string; assigned_to?: string }) => Promise<void>;
  createTask: (task: CreateTaskData) => Promise<Task | null>;
  updateTask: (id: string, updates: UpdateTaskData) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<Task | null>;
  updateTaskPriority: (id: string, priority: Task['priority']) => Promise<Task | null>;
  assignTask: (taskId: string, userId: string) => Promise<Task | null>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByAssignee: (userId: string) => Task[];
  getMyTasks: () => Promise<void>;
  getOverdueTasks: () => Promise<void>;
  getTaskStats: () => Promise<TaskStats | null>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const { isAuthenticated, loading: authLoading } = useAuth();

  const fetchTasks = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    project_id?: string;
    assigned_to?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.getAll(params);
      setTasks(response.items);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskData): Promise<Task | null> => {
    try {
      setError(null);
      const newTask = await tasksAPI.create(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error('Error creating task:', err);
      return null;
    }
  };

  const updateTask = async (
    id: string,
    updates: UpdateTaskData
  ): Promise<Task | null> => {
    try {
      setError(null);
      const updatedTask = await tasksAPI.update(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error('Error updating task:', err);
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await tasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error('Error deleting task:', err);
      return false;
    }
  };

  const updateTaskStatus = async (
    id: string,
    status: Task['status']
  ): Promise<Task | null> => {
    try {
      setError(null);
      const updatedTask = await tasksAPI.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
      console.error('Error updating task status:', err);
      return null;
    }
  };

  const updateTaskPriority = async (
    id: string,
    priority: Task['priority']
  ): Promise<Task | null> => {
    try {
      setError(null);
      const updatedTask = await tasksAPI.updatePriority(id, priority);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task priority');
      console.error('Error updating task priority:', err);
      return null;
    }
  };

  const assignTask = async (taskId: string, userId: string): Promise<Task | null> => {
    try {
      setError(null);
      const updatedTask = await tasksAPI.assign(taskId, userId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
      console.error('Error assigning task:', err);
      return null;
    }
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find((t) => t.id === id);
  };

  const getTasksByProject = (projectId: string): Task[] => {
    return tasks.filter((t) => t.project_id === projectId);
  };

  const getTasksByAssignee = (userId: string): Task[] => {
    return tasks.filter((t) => t.assigned_to === userId);
  };

  const getMyTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.getMyTasks({ page: 1, limit: 100 });
      setTasks(response.items);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch my tasks');
      console.error('Error fetching my tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOverdueTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.getOverdue({ page: 1, limit: 100 });
      setTasks(response.items);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overdue tasks');
      console.error('Error fetching overdue tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStats = async (): Promise<TaskStats | null> => {
    try {
      const stats = await tasksAPI.getStats();
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get task stats');
      console.error('Error getting task stats:', err);
      return null;
    }
  };

  useEffect(() => {
    // Only fetch tasks if user is authenticated and auth check is complete
    if (isAuthenticated && !authLoading) {
      fetchTasks();
    }
  }, [isAuthenticated, authLoading]);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        error,
        pagination,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        updateTaskPriority,
        assignTask,
        getTaskById,
        getTasksByProject,
        getTasksByAssignee,
        getMyTasks,
        getOverdueTasks,
        getTaskStats,
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
