import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Expense, Income } from '@/services/api/accounting';
import { DollarSign, Download, FileText, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import ExpenseDialog from '../components/accounting/ExpenseDialog';
import ExpenseTracker from '../components/accounting/ExpenseTracker';
import FinancialDashboard from '../components/accounting/FinancialDashboard';
import FinancialReports from '../components/accounting/FinancialReports';
import IncomeDialog from '../components/accounting/IncomeDialog';
import IncomeManager from '../components/accounting/IncomeManager';
import { useAccounting } from '../contexts/AccountingContext';

export default function Accounting() {
  const { 
    expenses, 
    income
  } = useAccounting();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>(undefined);

  // Calculate summary metrics
  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const totalIncome = income.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
  const pendingExpenses = expenses
    .filter(exp => ['Draft', 'Submitted'].includes(exp.status))
    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
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
    setEditingExpense(undefined);
  };

  const handleCloseIncomeDialog = () => {
    setShowIncomeDialog(false);
    setEditingIncome(undefined);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 px-1 sm:px-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
            Accounting
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage expenses, income, and financial reporting
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none min-h-[40px]">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="text-xs sm:text-sm">Export Data</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowIncomeDialog(true)}
            className="flex-1 sm:flex-none min-h-[40px]"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="text-xs sm:text-sm">Add Income</span>
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowExpenseDialog(true)}
            className="flex-1 sm:flex-none min-h-[40px]"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="text-xs sm:text-sm">Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-green-600 break-all">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-xl md:text-2xl font-bold text-red-600 break-all">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Including pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className={`text-base sm:text-xl md:text-2xl font-bold break-all ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIncome - totalExpenses).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-xl md:text-2xl font-bold">
              {pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${pendingExpenses.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm py-2">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs sm:text-sm py-2">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="income" className="text-xs sm:text-sm py-2">
            Income
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm py-2">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <ExpenseTracker onEditExpense={handleEditExpense} />
        </TabsContent>

        <TabsContent value="income" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <IncomeManager onEditIncome={handleEditIncome} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
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
