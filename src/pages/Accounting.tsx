import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAccounting } from '../contexts/AccountingContext';
import { Expense, Income } from '../types';
import ExpenseTracker from '../components/accounting/ExpenseTracker';
import FinancialDashboard from '../components/accounting/FinancialDashboard';
import IncomeManager from '../components/accounting/IncomeManager';
import ExpenseDialog from '../components/accounting/ExpenseDialog';
import IncomeDialog from '../components/accounting/IncomeDialog';
import FinancialReports from '../components/accounting/FinancialReports';

export default function Accounting() {
  const { 
    expenses, 
    income
  } = useAccounting();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Calculate summary metrics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const pendingExpenses = expenses
    .filter(exp => ['Draft', 'Submitted'].includes(exp.status))
    .reduce((sum, exp) => sum + exp.amount, 0);
  const pendingApprovals = expenses.filter(exp => exp.status === 'Submitted').length;

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseDialog(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setShowIncomeDialog(true);
  };

  const handleCloseExpenseDialog = () => {
    setShowExpenseDialog(false);
    setEditingExpense(null);
  };

  const handleCloseIncomeDialog = () => {
    setShowIncomeDialog(false);
    setEditingIncome(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground">
            Manage expenses, income, and financial reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowIncomeDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowExpenseDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Including pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIncome - totalExpenses).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              ${pendingExpenses.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <ExpenseTracker onEditExpense={handleEditExpense} />
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <IncomeManager onEditIncome={handleEditIncome} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <FinancialReports />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ExpenseDialog 
        open={showExpenseDialog}
        onOpenChange={handleCloseExpenseDialog}
        expense={editingExpense}
      />
      
      <IncomeDialog 
        open={showIncomeDialog}
        onOpenChange={handleCloseIncomeDialog}
        income={editingIncome}
      />
    </div>
  );
}
