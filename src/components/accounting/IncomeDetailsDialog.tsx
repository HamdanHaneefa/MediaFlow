import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  DollarSign, 
  FileText,  
  Building, 
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard
} from 'lucide-react';
import { Income } from '../../types';
import { format } from 'date-fns';

interface IncomeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: Income | null;
}

export default function IncomeDetailsDialog({ open, onOpenChange, income }: IncomeDetailsDialogProps) {
  if (!income) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Overdue':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'Expected':
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Received': return 'default';
      case 'Expected': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'Cancelled': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Income Details
          </DialogTitle>
          <DialogDescription>
            Complete information for income #{income.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{income.title}</h3>
              {income.description && (
                <p className="text-muted-foreground mt-1">{income.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(income.status)}
              <Badge variant={getStatusBadgeVariant(income.status)}>
                {income.status}
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
                    <span className="font-medium text-green-600">${income.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="outline">{income.income_type}</Badge>
                  </div>
                  {income.invoice_number && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Invoice:</span>
                      <span className="font-medium">{income.invoice_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {income.client_id && (
                <div>
                  <h4 className="font-medium mb-2">Client Information</h4>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{income.client_id}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Timeline Information</h4>
                <div className="space-y-2">
                  {income.expected_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Expected:</span>
                      <span className="font-medium">
                        {format(new Date(income.expected_date), 'MMMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {income.received_date && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Received:</span>
                      <span className="font-medium text-green-600">
                        {format(new Date(income.received_date), 'MMMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {format(new Date(income.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  {income.updated_at !== income.created_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last updated:</span>
                      <span className="font-medium">
                        {format(new Date(income.updated_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Timeline */}
              {income.expected_date && income.received_date && (
                <div>
                  <h4 className="font-medium mb-2">Payment Timeline</h4>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {(() => {
                        const expected = new Date(income.expected_date);
                        const received = new Date(income.received_date);
                        const diffDays = Math.round((received.getTime() - expected.getTime()) / (1000 * 3600 * 24));
                        
                        if (diffDays === 0) {
                          return <span className="text-green-600">✓ Received on time</span>;
                        } else if (diffDays > 0) {
                          return <span className="text-red-600">⚠ {diffDays} days late</span>;
                        } else {
                          return <span className="text-green-600">✓ {Math.abs(diffDays)} days early</span>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Information */}
          {income.project_id && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Project Information</h4>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Project ID:</span>
                  <span className="font-medium">{income.project_id}</span>
                </div>
              </div>
            </>
          )}

          {/* Status Information */}
          {income.status === 'Overdue' && (
            <>
              <Separator />
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-red-800">Payment Overdue</h4>
                </div>
                <p className="text-sm text-red-700">
                  This payment is past its expected date and may require follow-up with the client.
                </p>
              </div>
            </>
          )}

          {income.status === 'Received' && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-green-800">Payment Received</h4>
                </div>
                <p className="text-sm text-green-700">
                  This payment has been successfully received and processed.
                </p>
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
