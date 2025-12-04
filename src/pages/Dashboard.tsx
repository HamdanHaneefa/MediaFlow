import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { ProjectStatusOverview } from '@/components/dashboard/ProjectStatusOverview';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounting } from '@/contexts/AccountingContext';
import { useContacts } from '@/contexts/ContactsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTasks } from '@/contexts/TasksContext';
import { isPast, isToday, parseISO, startOfMonth } from 'date-fns';

export function Dashboard() {
  const { projects, loading: projectsLoading } = useProjects();
  const { contacts, loading: contactsLoading } = useContacts();
  const { tasks, loading: tasksLoading } = useTasks();
  const { income, loading: accountingLoading } = useAccounting();

  const loading = projectsLoading || contactsLoading || tasksLoading || accountingLoading;

  const activeProjects = projects.filter((p) => p.status === 'Active').length;

  const totalClients = contacts.filter((c) => c.role === 'Client').length;

  const newClientsThisMonth = contacts.filter((c) => {
    const createdDate = parseISO(c.created_at);
    return createdDate >= startOfMonth(new Date()) && c.role === 'Client';
  }).length;

  const revenueThisMonth = income
    .filter((inc) => {
      // Filter income received this month
      const receivedDate = inc.received_date ? parseISO(inc.received_date) : null;
      return (
        receivedDate &&
        receivedDate >= startOfMonth(new Date()) &&
        inc.status === 'Received'
      );
    })
    .reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);

  // Calculate last month's revenue for comparison
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  const lastMonthStartOfMonth = startOfMonth(lastMonthStart);
  const lastMonthEnd = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1, 0);
  
  const revenueLastMonth = income
    .filter((inc) => {
      const receivedDate = inc.received_date ? parseISO(inc.received_date) : null;
      return (
        receivedDate &&
        receivedDate >= lastMonthStartOfMonth &&
        receivedDate <= lastMonthEnd &&
        inc.status === 'Received'
      );
    })
    .reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);

  // Debug logging
  console.log('Revenue Debug:', {
    currentMonth: new Date().toLocaleString('en-US', { year: 'numeric', month: 'long' }),
    thisMonthRevenue: revenueThisMonth,
    lastMonthRevenue: revenueLastMonth,
    incomeData: income.map(inc => ({
      title: inc.title,
      amount: inc.amount,
      received_date: inc.received_date,
      status: inc.status
    }))
  });

  const revenueChange = revenueLastMonth > 0 
    ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
    : revenueThisMonth > 0 ? 100 : 0;

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
