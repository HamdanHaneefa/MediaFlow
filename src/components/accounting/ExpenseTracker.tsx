import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Filter, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAccounting } from '../../contexts/AccountingContext';
import { ExpenseCategory, ExpenseStatus, Expense } from '../../types';
import { format } from 'date-fns';
import ExpenseDetailsDialog from './ExpenseDetailsDialog';

interface ExpenseTrackerProps {
  onEditExpense: (expense: Expense) => void;
}

export default function ExpenseTracker({ onEditExpense }: ExpenseTrackerProps) {
  const { 
    filteredExpenses, 
    setExpenseFilters, 
    approveExpense, 
    rejectExpense,
    deleteExpense 
  } = useAccounting();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Apply search filter to context
  };

  const handleStatusFilter = (status: ExpenseStatus | 'all') => {
    setStatusFilter(status);
    setExpenseFilters({
      status: status === 'all' ? undefined : status
    });
  };

  const handleCategoryFilter = (category: ExpenseCategory | 'all') => {
    setCategoryFilter(category);
    setExpenseFilters({
      category: category === 'all' ? undefined : category
    });
  };

  const getStatusBadgeVariant = (status: ExpenseStatus) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Submitted': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Draft': return 'outline';
      case 'Paid': return 'default';
      case 'Reimbursed': return 'default';
      default: return 'outline';
    }
  };

  const handleApprove = async (expenseId: string) => {
    await approveExpense(expenseId);
  };

  const handleReject = async (expenseId: string) => {
    await rejectExpense(expenseId, 'Rejected by manager');
  };

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      try {
        await deleteExpense(expenseId);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense. Please try again.');
      }
    }
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetailsDialog(true);
  };

  // Filter expenses based on search query
  const searchFilteredExpenses = filteredExpenses.filter(expense =>
    expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Reimbursed">Reimbursed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Equipment Rental">Equipment Rental</SelectItem>
                <SelectItem value="Location">Location</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Catering">Catering</SelectItem>
                <SelectItem value="Crew">Crew</SelectItem>
                <SelectItem value="Post Production">Post Production</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Expenses ({searchFilteredExpenses.length})</CardTitle>
            <div className="text-sm text-muted-foreground">
              Total: ${searchFilteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchFilteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{expense.title}</div>
                      {expense.description && (
                        <div className="text-sm text-muted-foreground">{expense.description}</div>
                      )}
                      {expense.vendor && (
                        <div className="text-xs text-muted-foreground">Vendor: {expense.vendor}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {expense.amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(expense.status)}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{expense.submitted_by || 'Unknown'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {expense.status === 'Submitted' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(expense.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleReject(expense.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {expense.status === 'Draft' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onEditExpense(expense)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditExpense(expense)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {expense.receipt_url && (
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Receipt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expense Details Dialog */}
      <ExpenseDetailsDialog 
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        expense={selectedExpense}
      />
    </div>
  );
}
