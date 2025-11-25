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
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { useAccounting } from '../../contexts/AccountingContext';
import { IncomeStatus, Income } from '../../types';
import { format } from 'date-fns';
import IncomeDetailsDialog from './IncomeDetailsDialog';

interface IncomeManagerProps {
  onEditIncome: (income: Income) => void;
}

export default function IncomeManager({ onEditIncome }: IncomeManagerProps) {
  const { 
    filteredIncome, 
    setIncomeFilters, 
    updateIncome,
    deleteIncome 
  } = useAccounting();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncomeStatus | 'all'>('all');
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Apply search filter to context
  };

  const handleStatusFilter = (status: IncomeStatus | 'all') => {
    setStatusFilter(status);
    setIncomeFilters({
      status: status === 'all' ? undefined : status
    });
  };

  const getStatusBadgeVariant = (status: IncomeStatus) => {
    switch (status) {
      case 'Received': return 'default';
      case 'Expected': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'Cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const handleMarkReceived = async (incomeId: string) => {
    await updateIncome(incomeId, { 
      status: 'Received',
      received_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = async (incomeId: string) => {
    if (window.confirm('Are you sure you want to delete this income entry? This action cannot be undone.')) {
      try {
        await deleteIncome(incomeId);
      } catch (error) {
        console.error('Error deleting income:', error);
        alert('Error deleting income. Please try again.');
      }
    }
  };

  const handleViewDetails = (income: Income) => {
    setSelectedIncome(income);
    setShowDetailsDialog(true);
  };

  // Filter income based on search query
  const searchFilteredIncome = filteredIncome.filter(income =>
    income.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    income.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    income.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totalExpected = searchFilteredIncome
    .filter(inc => inc.status === 'Expected')
    .reduce((sum, inc) => sum + inc.amount, 0);
  
  const totalReceived = searchFilteredIncome
    .filter(inc => inc.status === 'Received')
    .reduce((sum, inc) => sum + inc.amount, 0);

  const totalOverdue = searchFilteredIncome
    .filter(inc => inc.status === 'Overdue')
    .reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Income</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalExpected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending receipts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received Income</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalReceived.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Already received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires follow-up
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Income Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search income..."
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
                <SelectItem value="Expected">Expected</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Income Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Income Entries ({searchFilteredIncome.length})</CardTitle>
            <div className="text-sm text-muted-foreground">
              Total: ${searchFilteredIncome.reduce((sum, inc) => sum + inc.amount, 0).toLocaleString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Income</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchFilteredIncome.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{income.title}</div>
                      {income.description && (
                        <div className="text-sm text-muted-foreground">{income.description}</div>
                      )}
                      {income.project_id && (
                        <div className="text-xs text-muted-foreground">Project: {income.project_id}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{income.income_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {income.amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {income.expected_date 
                        ? format(new Date(income.expected_date), 'MMM dd, yyyy')
                        : 'Not set'
                      }
                    </div>
                    {income.received_date && (
                      <div className="text-xs text-muted-foreground">
                        Received: {format(new Date(income.received_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(income.status)}>
                      {income.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{income.invoice_number || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {income.status === 'Expected' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleMarkReceived(income.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {['Expected', 'Overdue'].includes(income.status) && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onEditIncome(income)}
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
                          <DropdownMenuItem onClick={() => handleViewDetails(income)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditIncome(income)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(income.id)}
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

      {/* Income Details Dialog */}
      <IncomeDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        income={selectedIncome}
      />
    </div>
  );
}
