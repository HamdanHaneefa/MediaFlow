import { useProjects } from '@/contexts/ProjectsContext';
import { useContacts } from '@/contexts/ContactsContext';
import { useTasks } from '@/contexts/TasksContext';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ProjectStatusOverview } from '@/components/dashboard/ProjectStatusOverview';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { Skeleton } from '@/components/ui/skeleton';
import { isPast, isToday, parseISO, startOfMonth } from 'date-fns';

export function Dashboard() {
  const { projects, loading: projectsLoading } = useProjects();
  const { contacts, loading: contactsLoading } = useContacts();
  const { tasks, loading: tasksLoading } = useTasks();

  const loading = projectsLoading || contactsLoading || tasksLoading;

  const activeProjects = projects.filter((p) => p.status === 'Active').length;

  const totalClients = contacts.filter((c) => c.role === 'Client').length;

  const newClientsThisMonth = contacts.filter((c) => {
    const createdDate = parseISO(c.created_at);
    return createdDate >= startOfMonth(new Date()) && c.role === 'Client';
  }).length;

  const revenueThisMonth = projects
    .filter((p) => {
      const startDate = p.start_date ? parseISO(p.start_date) : null;
      return (
        startDate &&
        startDate >= startOfMonth(new Date()) &&
        p.budget
      );
    })
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  const revenueChange = 15;

  const overdueTasks = tasks.filter(
    (t) =>
      t.due_date &&
      isPast(parseISO(t.due_date)) &&
      !isToday(parseISO(t.due_date)) &&
      t.status !== 'Done'
  ).length;

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <Skeleton className="h-8 sm:h-9 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-4 sm:h-5 w-72 sm:w-96" />
        </div>
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 sm:h-32" />
          ))}
        </div>
        <Skeleton className="h-40 sm:h-48" />
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 sm:h-96" />
          <Skeleton className="h-80 sm:h-96" />
        </div>
        <Skeleton className="h-96 sm:h-[32rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="px-1 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
          Welcome back! Here's your production overview.
        </p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards
        activeProjects={activeProjects}
        totalClients={totalClients}
        newClientsThisMonth={newClientsThisMonth}
        revenueThisMonth={revenueThisMonth}
        revenueChange={revenueChange}
        overdueTasks={overdueTasks}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity & Upcoming Deadlines */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <RecentActivity projects={projects} contacts={contacts} tasks={tasks} />
        <UpcomingDeadlines tasks={tasks} contacts={contacts} />
      </div>

      {/* Project Status Overview */}
      <ProjectStatusOverview projects={projects} />
    </div>
  );
}
