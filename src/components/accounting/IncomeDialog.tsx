import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounting } from '../../contexts/AccountingContext';
import { IncomeType, IncomeStatus, Income } from '../../types';

interface IncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income?: Income; // For editing existing income
}

export default function IncomeDialog({ open, onOpenChange, income }: IncomeDialogProps) {
  const { addIncome, updateIncome } = useAccounting();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    income_type: '' as IncomeType,
    expected_date: new Date().toISOString().split('T')[0],
    received_date: '',
    status: 'Expected' as IncomeStatus,
    project_id: '',
    client_id: '',
    invoice_number: ''
  });

  const [loading, setLoading] = useState(false);

  // Update form when income prop changes
  useEffect(() => {
    if (income) {
      setFormData({
        title: income.title || '',
        description: income.description || '',
        amount: income.amount?.toString() || '',
        income_type: income.income_type || '' as IncomeType,
        expected_date: income.expected_date || new Date().toISOString().split('T')[0],
        received_date: income.received_date || '',
        status: income.status || 'Expected' as IncomeStatus,
        project_id: income.project_id || '',
        client_id: income.client_id || '',
        invoice_number: income.invoice_number || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        amount: '',
        income_type: '' as IncomeType,
        expected_date: new Date().toISOString().split('T')[0],
        received_date: '',
        status: 'Expected' as IncomeStatus,
        project_id: '',
        client_id: '',
        invoice_number: ''
      });
    }
  }, [income, open]);

  const handleInputChange = (field: string, value: string | number | IncomeType | IncomeStatus) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.income_type) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const incomeData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount.toString()),
        income_type: formData.income_type,
        expected_date: formData.expected_date || undefined,
        received_date: formData.received_date || undefined,
        status: formData.status,
        project_id: formData.project_id || undefined,
        client_id: formData.client_id || undefined,
        invoice_number: formData.invoice_number || undefined
      };

      if (income) {
        await updateIncome(income.id, incomeData);
      } else {
        await addIncome(incomeData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Error saving income. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {income ? 'Edit Income' : 'Add New Income'}
          </DialogTitle>
          <DialogDescription>
            {income 
              ? 'Update the income information below.'
              : 'Enter the details for your new income entry.'
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
                placeholder="e.g., Corporate Video - Initial Payment"
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

            {/* Income Type */}
            <div>
              <Label htmlFor="income_type">Type *</Label>
              <Select value={formData.income_type} onValueChange={(value) => handleInputChange('income_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project Payment">Project Payment</SelectItem>
                  <SelectItem value="Deposit">Deposit</SelectItem>
                  <SelectItem value="Final Payment">Final Payment</SelectItem>
                  <SelectItem value="Additional Services">Additional Services</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expected Date */}
            <div>
              <Label htmlFor="expected_date">Expected Date</Label>
              <Input
                id="expected_date"
                type="date"
                value={formData.expected_date}
                onChange={(e) => handleInputChange('expected_date', e.target.value)}
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
                  <SelectItem value="Expected">Expected</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Received Date */}
            {formData.status === 'Received' && (
              <div>
                <Label htmlFor="received_date">Received Date</Label>
                <Input
                  id="received_date"
                  type="date"
                  value={formData.received_date}
                  onChange={(e) => handleInputChange('received_date', e.target.value)}
                />
              </div>
            )}

            {/* Invoice Number */}
            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                placeholder="e.g., INV-2024-001"
              />
            </div>

            {/* Project */}
            <div>
              <Label htmlFor="project">Project (Optional)</Label>
              <Input
                id="project"
                value={formData.project_id}
                onChange={(e) => handleInputChange('project_id', e.target.value)}
                placeholder="Enter project ID or name"
              />
            </div>

            {/* Client */}
            <div>
              <Label htmlFor="client">Client (Optional)</Label>
              <Input
                id="client"
                value={formData.client_id}
                onChange={(e) => handleInputChange('client_id', e.target.value)}
                placeholder="Enter client ID or name"
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
              placeholder="Additional details about this income..."
              rows={3}
            />
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
              {loading ? 'Saving...' : income ? 'Update Income' : 'Add Income'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
