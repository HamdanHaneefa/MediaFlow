import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock
} from 'lucide-react';
import { useAccounting } from '../../contexts/AccountingContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FinancialDashboard() {
  const { 
    expenses, 
    income, 
    getExpensesByCategory,
    getExpensesByProject 
  } = useAccounting();

  // Calculate metrics
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  
  const pendingExpenses = expenses.filter(exp => ['Draft', 'Submitted'].includes(exp.status));
  const approvedExpenses = expenses.filter(exp => exp.status === 'Approved');
  const rejectedExpenses = expenses.filter(exp => exp.status === 'Rejected');
  
  const pendingIncome = income.filter(inc => inc.status === 'Expected');
  const receivedIncome = income.filter(inc => inc.status === 'Received');
  const overdueIncome = income.filter(inc => inc.status === 'Overdue');

  // Prepare chart data
  const expensesByCategory = getExpensesByCategory();
  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  })).filter(item => item.value > 0);

  const expensesByProject = getExpensesByProject();
  const projectData = Object.entries(expensesByProject).map(([project, amount]) => ({
    name: project || 'Unassigned',
    expenses: amount,
    income: income.filter(inc => inc.project_id === project).reduce((sum, inc) => sum + inc.amount, 0)
  }));

  // Monthly trend data (mock data for demo)
  const monthlyData = [
    { month: 'Oct', income: 12000, expenses: 8500, profit: 3500 },
    { month: 'Nov', income: totalIncome, expenses: totalExpenses, profit: netProfit },
  ];

  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={Math.max(0, Math.min(100, parseFloat(profitMargin)))} className="flex-1" />
              <span className="text-xs text-muted-foreground">{profitMargin}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <Badge variant="outline">{pendingExpenses.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Approved</span>
                <Badge variant="default">{approvedExpenses.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rejected</span>
                <Badge variant="destructive">{rejectedExpenses.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Expected</span>
                <Badge variant="outline">{pendingIncome.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Received</span>
                <Badge variant="default">{receivedIncome.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <Badge variant="destructive">{overdueIncome.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Financial Trends</CardTitle>
            <CardDescription>Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="income" stroke="#00C49F" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#FF8042" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#0088FE" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Distribution of spending across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Profitability */}
      <Card>
        <CardHeader>
          <CardTitle>Project Profitability</CardTitle>
          <CardDescription>Income vs Expenses by project</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, '']} />
              <Bar dataKey="income" fill="#00C49F" name="Income" />
              <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-8 w-8 bg-red-100 rounded-full">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <p className="text-sm text-muted-foreground">{expense.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${expense.amount.toLocaleString()}</p>
                    <Badge variant={expense.status === 'Approved' ? 'default' : 'outline'}>
                      {expense.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {income.slice(0, 5).map((incomeItem) => (
                <div key={incomeItem.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-8 w-8 bg-green-100 rounded-full">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{incomeItem.title}</p>
                      <p className="text-sm text-muted-foreground">{incomeItem.income_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${incomeItem.amount.toLocaleString()}</p>
                    <Badge variant={incomeItem.status === 'Received' ? 'default' : 'outline'}>
                      {incomeItem.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(pendingExpenses.length > 0 || overdueIncome.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span>Action Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingExpenses.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Pending Expense Approvals</p>
                    <p className="text-sm text-muted-foreground">
                      {pendingExpenses.length} expenses waiting for approval
                    </p>
                  </div>
                  <Badge variant="outline">{pendingExpenses.length}</Badge>
                </div>
              )}
              
              {overdueIncome.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">Overdue Payments</p>
                    <p className="text-sm text-muted-foreground">
                      {overdueIncome.length} payments are overdue
                    </p>
                  </div>
                  <Badge variant="destructive">{overdueIncome.length}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
