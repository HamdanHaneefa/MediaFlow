import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Building, 
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import type { Expense } from '@/services/api/accounting';
import { format } from 'date-fns';

interface ExpenseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}

export default function ExpenseDetailsDialog({ open, onOpenChange, expense }: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Submitted':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Expense Details
          </DialogTitle>
          <DialogDescription>
            Complete information for expense #{expense.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{expense.title}</h3>
              {expense.description && (
                <p className="text-muted-foreground mt-1">{expense.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(expense.status)}
              <Badge variant={getStatusBadgeVariant(expense.status)}>
                {expense.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Financial Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-medium">${expense.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <Badge variant="outline">{expense.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {format(new Date(expense.expense_date), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {expense.vendor && (
                <div>
                  <h4 className="font-medium mb-2">Vendor Information</h4>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{expense.vendor}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Workflow Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Submitted by:</span>
                    <span className="font-medium">{expense.submitted_by || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {format(new Date(expense.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  {expense.updated_at !== expense.created_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last updated:</span>
                      <span className="font-medium">
                        {format(new Date(expense.updated_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Information */}
              {expense.status === 'Approved' && expense.approved_by && (
                <div>
                  <h4 className="font-medium mb-2">Approval Details</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Approved by:</span>
                      <span className="font-medium">{expense.approved_by}</span>
                    </div>
                    {expense.approved_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Approved on:</span>
                        <span className="font-medium">
                          {format(new Date(expense.approved_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Information */}
              {expense.status === 'Rejected' && expense.rejection_reason && (
                <div>
                  <h4 className="font-medium mb-2">Rejection Details</h4>
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <span className="text-sm text-muted-foreground">Reason:</span>
                      <p className="font-medium text-red-700">{expense.rejection_reason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Information */}
          {expense.project_id && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Project Information</h4>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Project ID:</span>
                  <span className="font-medium">{expense.project_id}</span>
                </div>
              </div>
            </>
          )}

          {/* Receipt Information */}
          {expense.receipt_url && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Receipt & Documentation</h4>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">
                        {expense.receipt_filename || 'Receipt.pdf'}
                      </span>
                      <p className="text-sm text-muted-foreground">Attached receipt</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
