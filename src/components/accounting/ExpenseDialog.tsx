import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { useAccounting } from '../../contexts/AccountingContext';
import { ExpenseCategory, ExpenseStatus, Expense } from '../../types';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense; // For editing existing expenses
}

export default function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  const { addExpense, updateExpense } = useAccounting();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '' as ExpenseCategory,
    expense_date: new Date().toISOString().split('T')[0],
    vendor: '',
    status: 'Draft' as ExpenseStatus,
    project_id: '',
    receipt_file: null as File | null
  });

  const [loading, setLoading] = useState(false);

  // Update form when expense prop changes
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || '',
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || '' as ExpenseCategory,
        expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
        vendor: expense.vendor || '',
        status: expense.status || 'Draft' as ExpenseStatus,
        project_id: expense.project_id || '',
        receipt_file: null
      });
    } else {
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: '' as ExpenseCategory,
        expense_date: new Date().toISOString().split('T')[0],
        vendor: '',
        status: 'Draft' as ExpenseStatus,
        project_id: '',
        receipt_file: null
      });
    }
  }, [expense, open]);

  const handleInputChange = (field: string, value: string | number | ExpenseCategory | ExpenseStatus) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, receipt_file: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const expenseData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount.toString()),
        category: formData.category,
        expense_date: formData.expense_date,
        vendor: formData.vendor,
        status: formData.status,
        project_id: formData.project_id || undefined,
        submitted_by: 'current-user@example.com', // Replace with actual user
        receipt_url: formData.receipt_file ? `/receipts/${formData.receipt_file.name}` : undefined,
        receipt_filename: formData.receipt_file?.name
      };

      if (expense) {
        await updateExpense(expense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <DialogDescription>
            {expense 
              ? 'Update the expense information below.'
              : 'Enter the details for your new expense.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Camera Equipment Rental"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Expense Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => handleInputChange('expense_date', e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submit for Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vendor */}
            <div className="col-span-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="e.g., Pro Camera Rental"
              />
            </div>

            {/* Project */}
            <div className="col-span-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Input
                id="project"
                value={formData.project_id}
                onChange={(e) => handleInputChange('project_id', e.target.value)}
                placeholder="Enter project ID or name"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about this expense..."
              rows={3}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <Label htmlFor="receipt">Receipt</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="receipt" className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:underline">
                      Upload a receipt
                    </span>
                    <input
                      id="receipt"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
              
              {formData.receipt_file && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">{formData.receipt_file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInputChange('receipt_file', null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
