import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lead } from '@/services/api/proposals';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost' | 'Converted';
type LeadSource = 'website' | 'referral' | 'social_media' | 'cold_call' | 'event' | 'other';
type LeadPriority = 'Low' | 'Medium' | 'High';

interface LeadFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  budget: number;
  notes: string;
  tags: string;
}

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  onSave: (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function LeadDialog({
  open,
  onOpenChange,
  lead,
  onSave,
}: LeadDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<LeadFormData>({
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'New',
      source: 'other',
      priority: 'Medium',
      budget: 0,
      notes: '',
      tags: '',
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        company: lead.company || '',
        email: lead.email,
        phone: lead.phone || '',
        status: lead.status,
        source: lead.source as LeadSource,
        priority: lead.priority,
        budget: lead.budget || 0,
        notes: lead.notes || '',
        tags: lead.tags.join(', '),
      });
    } else {
      reset({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        source: 'other',
        priority: 'Medium',
        budget: 0,
        notes: '',
        tags: '',
      });
    }
  }, [lead, reset]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      await onSave({
        name: data.name,
        first_name: data.name.split(' ')[0],
        last_name: data.name.split(' ').slice(1).join(' ') || '',
        company: data.company || undefined,
        email: data.email,
        phone: data.phone || undefined,
        status: data.status,
        source: data.source,
        priority: data.priority,
        budget: data.budget || undefined,
        notes: data.notes || undefined,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lead ? 'Edit Lead' : 'Create New Lead'}
          </DialogTitle>
          <DialogDescription>
            {lead
              ? 'Update the lead details below.'
              : 'Fill in the details to create a new lead.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter lead name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: LeadStatus) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Select
                value={watch('source')}
                onValueChange={(value: LeadSource) => setValue('source', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value: LeadPriority) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Hot">Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                {...register('budget')}
                placeholder="0.00"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Enter notes about this lead"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : lead ? 'Update' : 'Create'} Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
