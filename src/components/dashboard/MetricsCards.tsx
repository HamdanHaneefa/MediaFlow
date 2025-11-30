import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Clapperboard, DollarSign, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

function MetricCard({ title, value, icon: Icon, trend, subtitle }: MetricCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
            )}
            <span
              className={cn(
                'text-xs sm:text-sm font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.value}
            </span>
            <span className="text-xs sm:text-sm text-slate-500">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricsCardsProps {
  activeProjects: number;
  totalClients: number;
  newClientsThisMonth: number;
  revenueThisMonth: number;
  revenueChange: number;
  overdueTasks: number;
}

export function MetricsCards({
  activeProjects,
  totalClients,
  newClientsThisMonth,
  revenueThisMonth,
  revenueChange,
  overdueTasks,
}: MetricsCardsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Projects"
        value={activeProjects}
        icon={Clapperboard}
        trend={{
          value: `+${activeProjects > 5 ? 3 : 1}`,
          isPositive: true,
        }}
      />
      <MetricCard
        title="Total Clients"
        value={totalClients}
        icon={Users}
        subtitle={`${newClientsThisMonth} new this month`}
      />
      <MetricCard
        title="Revenue This Month"
        value={`$${revenueThisMonth.toLocaleString()}`}
        icon={DollarSign}
        trend={{
          value: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
          isPositive: revenueChange >= 0,
        }}
      />
      <MetricCard
        title="Overdue Tasks"
        value={overdueTasks}
        icon={AlertCircle}
        subtitle={overdueTasks > 0 ? 'Needs attention' : 'All on track'}
      />
    </div>
  );
}
