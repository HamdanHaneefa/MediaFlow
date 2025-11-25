import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  FileText
} from 'lucide-react';
import { useAccounting } from '../../contexts/AccountingContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FinancialReports() {
  const { 
    expenses, 
    income, 
    getExpensesByCategory,
    getExpensesByProject 
  } = useAccounting();
  
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });
  const [reportType, setReportType] = useState('profit-loss');

  // Calculate financial metrics
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Prepare chart data
  const expensesByCategory = getExpensesByCategory();
  const categoryData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      name: category.replace(' ', '\n'),
      value: amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1)
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Monthly trend data
  const monthlyData = [
    { month: 'Jan', income: 8000, expenses: 5500, profit: 2500 },
    { month: 'Feb', income: 9500, expenses: 6200, profit: 3300 },
    { month: 'Mar', income: 11000, expenses: 7000, profit: 4000 },
    { month: 'Apr', income: 10200, expenses: 6800, profit: 3400 },
    { month: 'May', income: 12500, expenses: 8000, profit: 4500 },
    { month: 'Jun', income: 13800, expenses: 9200, profit: 4600 },
    { month: 'Jul', income: 15000, expenses: 9800, profit: 5200 },
    { month: 'Aug', income: 14200, expenses: 9500, profit: 4700 },
    { month: 'Sep', income: 16000, expenses: 10500, profit: 5500 },
    { month: 'Oct', income: 17500, expenses: 11200, profit: 6300 },
    { month: 'Nov', income: totalIncome, expenses: totalExpenses, profit: netProfit },
  ];

  // Project profitability
  const expensesByProject = getExpensesByProject();
  const projectProfitData = Object.keys(expensesByProject).map(projectId => {
    const projectIncome = income
      .filter(inc => inc.project_id === projectId)
      .reduce((sum, inc) => sum + inc.amount, 0);
    const projectExpenses = expensesByProject[projectId];
    
    return {
      name: projectId || 'Unassigned',
      income: projectIncome,
      expenses: projectExpenses,
      profit: projectIncome - projectExpenses,
      margin: projectIncome > 0 ? ((projectIncome - projectExpenses) / projectIncome * 100).toFixed(1) : '0'
    };
  }).filter(project => project.income > 0 || project.expenses > 0);

  // Expense trends by category over time
  const categoryTrendData = monthlyData.map(month => {
    const base = { month: month.month };
    // Simulate category breakdown for each month
    categoryData.forEach(category => {
      base[category.name.replace('\n', ' ')] = Math.round(month.expenses * (category.value / totalExpenses));
    });
    return base;
  });

  const handleExportReport = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Customize your financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                  <SelectItem value="expense-analysis">Expense Analysis</SelectItem>
                  <SelectItem value="income-tracking">Income Tracking</SelectItem>
                  <SelectItem value="project-profitability">Project Profitability</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExportReport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profit-loss">P&L</TabsTrigger>
          <TabsTrigger value="expense-analysis">Expenses</TabsTrigger>
          <TabsTrigger value="income-tracking">Income</TabsTrigger>
          <TabsTrigger value="project-profitability">Projects</TabsTrigger>
        </TabsList>

        {/* Profit & Loss Report */}
        <TabsContent value="profit-loss" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Income</span>
                    <span className="text-green-600 font-bold">${totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Expenses</span>
                    <span className="text-red-600 font-bold">${totalExpenses.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Net Profit</span>
                    <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profit Margin</span>
                    <span className="text-sm">
                      {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="profit" stroke="#0088FE" fill="#0088FE" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
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
        </TabsContent>

        {/* Expense Analysis Report */}
        <TabsContent value="expense-analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
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

            <Card>
              <CardHeader>
                <CardTitle>Top Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{category.name.replace('\n', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${category.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense Trends by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryTrendData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {categoryData.slice(0, 5).map((category, index) => (
                    <Bar 
                      key={category.name}
                      dataKey={category.name.replace('\n', ' ')} 
                      stackId="a" 
                      fill={COLORS[index % COLORS.length]}
                      name={category.name.replace('\n', ' ')}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tracking Report */}
        <TabsContent value="income-tracking" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Income Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Expected</span>
                    <span className="font-medium">
                      ${income.filter(inc => inc.status === 'Expected').reduce((sum, inc) => sum + inc.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Received</span>
                    <span className="font-medium text-green-600">
                      ${income.filter(inc => inc.status === 'Received').reduce((sum, inc) => sum + inc.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Overdue</span>
                    <span className="font-medium text-red-600">
                      ${income.filter(inc => inc.status === 'Overdue').reduce((sum, inc) => sum + inc.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {income.length > 0 ? (
                      (income.filter(inc => inc.status === 'Received').length / income.length * 100).toFixed(1)
                    ) : '0'}%
                  </div>
                  <p className="text-sm text-muted-foreground">Payment success rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Payment Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold">15</div>
                  <p className="text-sm text-muted-foreground">Days average</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Project Profitability Report */}
        <TabsContent value="project-profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Financial Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={projectProfitData}>
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

          <Card>
            <CardHeader>
              <CardTitle>Project Profit Margins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectProfitData.map((project) => (
                  <div key={project.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Income: ${project.income.toLocaleString()} | 
                        Expenses: ${project.expenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${project.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${project.profit.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">{project.margin}% margin</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
