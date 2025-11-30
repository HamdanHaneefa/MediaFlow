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
    <div className="space-y-4 sm:space-y-6">
      {/* Financial Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{profitMargin}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={Math.max(0, Math.min(100, parseFloat(profitMargin)))} className="flex-1" />
              <span className="text-xs text-muted-foreground">{profitMargin}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Expense Status</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">Pending</span>
                <Badge variant="outline" className="text-xs">{pendingExpenses.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">Approved</span>
                <Badge variant="default" className="text-xs">{approvedExpenses.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">Rejected</span>
                <Badge variant="destructive" className="text-xs">{rejectedExpenses.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Income Status</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">Expected</span>
                <Badge variant="outline" className="text-xs">{pendingIncome.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">Received</span>
                <Badge variant="default" className="text-xs">{receivedIncome.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm">Overdue</span>
                <Badge variant="destructive" className="text-xs">{overdueIncome.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Monthly Financial Trends</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
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
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Expenses by Category</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Distribution of spending across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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
                  {categoryData.map((_, index) => (
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
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Project Profitability</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Income vs Expenses by project</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, '']} />
              <Bar dataKey="income" fill="#00C49F" name="Income" />
              <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 bg-red-100 rounded-full flex-shrink-0">
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate">{expense.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{expense.category}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-xs sm:text-sm">${expense.amount.toLocaleString()}</p>
                    <Badge variant={expense.status === 'Approved' ? 'default' : 'outline'} className="text-xs">
                      {expense.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Recent Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {income.slice(0, 5).map((incomeItem) => (
                <div key={incomeItem.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 bg-green-100 rounded-full flex-shrink-0">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate">{incomeItem.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{incomeItem.income_type}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-xs sm:text-sm">${incomeItem.amount.toLocaleString()}</p>
                    <Badge variant={incomeItem.status === 'Received' ? 'default' : 'outline'} className="text-xs">
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
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
              <span>Action Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {pendingExpenses.length > 0 && (
                <div className="flex items-center justify-between p-2 sm:p-3 bg-yellow-50 rounded-lg gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm">Pending Expense Approvals</p>
                    <p className="text-xs text-muted-foreground">
                      {pendingExpenses.length} expenses waiting for approval
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{pendingExpenses.length}</Badge>
                </div>
              )}
              
              {overdueIncome.length > 0 && (
                <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm">Overdue Payments</p>
                    <p className="text-xs text-muted-foreground">
                      {overdueIncome.length} payments are overdue
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs flex-shrink-0">{overdueIncome.length}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
