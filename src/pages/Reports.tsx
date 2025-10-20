import { useState, useMemo } from 'react';
import { useProjects } from '../contexts/ProjectsContext';
import { useTasks } from '../contexts/TasksContext';
import { useContacts } from '../contexts/ContactsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Clock,
  Download,
  Target,
  Award,
  Activity,
} from 'lucide-react';
import { differenceInDays } from 'date-fns';

export function Reports() {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { contacts } = useContacts();

  const [timeRange, setTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');

  const mockRevenue = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const revenue = 45000 + Math.random() * 35000;
      const expenses = revenue * (0.6 + Math.random() * 0.15);

      data.push({
        month: months[monthIndex],
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(revenue - expenses),
      });
    }
    return data;
  }, []);

  const clients = contacts.filter(c => c.role === 'Client');
  const activeProjects = projects.filter(p => p.status === 'Active');
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  const totalRevenue = mockRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalProfit = mockRevenue.reduce((sum, m) => sum + m.profit, 0);
  const avgProjectValue = totalRevenue / (projects.length || 1);
  const profitMargin = ((totalProfit / totalRevenue) * 100);

  const projectsByStatus = [
    { name: 'Active', value: activeProjects.length, color: '#3b82f6' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'On Hold').length, color: '#f59e0b' },
    { name: 'Completed', value: completedProjects.length, color: '#10b981' },
    { name: 'Cancelled', value: projects.filter(p => p.status === 'Cancelled').length, color: '#ef4444' },
  ];

  const projectsByType = [
    { name: 'Commercial', value: projects.filter(p => p.type === 'Commercial').length },
    { name: 'Documentary', value: projects.filter(p => p.type === 'Documentary').length },
    { name: 'Music Video', value: projects.filter(p => p.type === 'Music Video').length },
    { name: 'Corporate', value: projects.filter(p => p.type === 'Corporate').length },
    { name: 'Other', value: projects.filter(p => !['Commercial', 'Documentary', 'Music Video', 'Corporate'].includes(p.type)).length },
  ].filter(item => item.value > 0);

  const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const clientMetrics = clients.map(client => {
    const clientProjects = projects.filter(p => p.client_id === client.id);
    const totalValue = clientProjects.length * avgProjectValue;
    return {
      name: client.name,
      projects: clientProjects.length,
      value: Math.round(totalValue),
      satisfaction: 8 + Math.random() * 2,
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  const teamProductivity = useMemo(() => {
    const members = contacts.filter(c => c.role !== 'Client').slice(0, 6);
    return members.map(member => {
      const memberTasks = tasks.filter(t => t.assigned_to === member.id);
      const completed = memberTasks.filter(t => t.status === 'Completed').length;
      const completion = memberTasks.length > 0 ? (completed / memberTasks.length) * 100 : 0;

      return {
        name: member.name.split(' ')[0],
        completed,
        total: memberTasks.length,
        completion: Math.round(completion),
      };
    });
  }, [contacts, tasks]);

  const projectTimelines = useMemo(() => {
    return projects.slice(0, 8).map(project => {
      if (!project.start_date || !project.end_date) return null;

      const start = new Date(project.start_date);
      const end = new Date(project.end_date);
      const today = new Date();
      const totalDays = differenceInDays(end, start);
      const elapsedDays = differenceInDays(today, start);
      const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

      return {
        name: project.title.substring(0, 25),
        progress: Math.round(progress),
        status: project.status,
        onTime: progress <= 100,
      };
    }).filter(Boolean);
  }, [projects]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+2.3% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeProjects.length}</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
              <Activity className="h-3 w-3" />
              <span>{completedProjects.length} completed this period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Task Completion</CardTitle>
            <Award className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{taskCompletionRate.toFixed(0)}%</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
              <Clock className="h-3 w-3" />
              <span>{completedTasks.length} of {tasks.length} tasks</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Trends</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projects by Status</CardTitle>
                <CardDescription>Current project distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {projectsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Productivity</CardTitle>
                <CardDescription>Task completion by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamProductivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projects by Type</CardTitle>
                <CardDescription>Project category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectsByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="Projects" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg Project Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(avgProjectValue)}</div>
                <p className="text-sm text-gray-500 mt-2">Based on {projects.length} projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
                <p className="text-sm text-gray-500 mt-2">Last 6 months</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{formatCurrency(totalRevenue - totalProfit)}</div>
                <p className="text-sm text-gray-500 mt-2">Operating costs</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Monthly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Generating Projects</CardTitle>
              <CardDescription>Highest value projects this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project, index) => {
                  const value = project.budget || avgProjectValue;
                  return (
                    <div key={project.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{project.title}</p>
                          <p className="text-sm text-gray-500">{project.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(value)}</p>
                        <Badge variant={project.status === 'Completed' ? 'secondary' : 'default'}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline Adherence</CardTitle>
                <CardDescription>Progress vs planned timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectTimelines.map((project, index) => {
                    if (!project) return null;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">{project.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{project.progress}%</span>
                            {project.onTime ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              project.onTime ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(project.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Completion Statistics</CardTitle>
                <CardDescription>Tasks by status and priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Completed</span>
                    <Badge className="bg-green-100 text-green-700">{tasks.filter(t => t.status === 'Completed').length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">In Progress</span>
                    <Badge className="bg-blue-100 text-blue-700">{tasks.filter(t => t.status === 'In Progress').length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">In Review</span>
                    <Badge className="bg-orange-100 text-orange-700">{tasks.filter(t => t.status === 'In Review').length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">To Do</span>
                    <Badge className="bg-gray-100 text-gray-700">{tasks.filter(t => t.status === 'To Do').length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>Team workload distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamProductivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" label={{ value: 'Tasks', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total Tasks" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Revenue</CardTitle>
                <CardDescription>Most valuable client relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientMetrics.map((client) => (
                    <div key={client.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.projects} projects</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(client.value)}</p>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <span>{client.satisfaction.toFixed(1)}/10</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Satisfaction Scores</CardTitle>
                <CardDescription>Average ratings by client</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientMetrics} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 10]} stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                    <Tooltip />
                    <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Activity Overview</CardTitle>
              <CardDescription>Project engagement and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Active Clients</span>
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{clients.filter(c => c.status === 'Active').length}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900">Repeat Clients</span>
                    <Award className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">{Math.round(clients.length * 0.6)}</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-900">Prospects</span>
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-900">{clients.filter(c => c.status === 'Prospect').length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
