import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lead, LeadStatus, LeadSource, LeadPriority } from '@/types';
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
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LeadFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  estimated_value: number;
  estimated_close_date: string;
  notes: string;
  tags: string;
  contact_date: string;
  follow_up_date: string;
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
      source: 'Other',
      priority: 'Medium',
      estimated_value: 0,
      estimated_close_date: '',
      notes: '',
      tags: '',
      contact_date: '',
      follow_up_date: '',
    },
  });

  const contactDate = watch('contact_date');
  const followUpDate = watch('follow_up_date');
  const estimatedCloseDate = watch('estimated_close_date');

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        company: lead.company || '',
        email: lead.email,
        phone: lead.phone || '',
        status: lead.status,
        source: lead.source,
        priority: lead.priority,
        estimated_value: lead.estimated_value || 0,
        estimated_close_date: lead.estimated_close_date || '',
        notes: lead.notes || '',
        tags: lead.tags.join(', '),
        contact_date: lead.contact_date ? lead.contact_date.split('T')[0] : '',
        follow_up_date: lead.follow_up_date ? lead.follow_up_date.split('T')[0] : '',
      });
    } else {
      reset({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        source: 'Other',
        priority: 'Medium',
        estimated_value: 0,
        estimated_close_date: '',
        notes: '',
        tags: '',
        contact_date: '',
        follow_up_date: '',
      });
    }
  }, [lead, reset]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      await onSave({
        name: data.name,
        company: data.company || undefined,
        email: data.email,
        phone: data.phone || undefined,
        status: data.status,
        source: data.source,
        priority: data.priority,
        estimated_value: data.estimated_value || undefined,
        estimated_close_date: data.estimated_close_date || undefined,
        notes: data.notes || undefined,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        contact_date: data.contact_date ? new Date(data.contact_date).toISOString() : undefined,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date).toISOString() : undefined,
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
                  <SelectItem value="Negotiating">Negotiating</SelectItem>
                  <SelectItem value="Won">Won</SelectItem>
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
                  <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
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
              <Label htmlFor="estimated_value">Estimated Value</Label>
              <Input
                id="estimated_value"
                type="number"
                step="0.01"
                {...register('estimated_value')}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="contact_date">Contact Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !contactDate && 'text-muted-foreground'
                    )}
                  >
                    {contactDate ? format(new Date(contactDate), 'PPP') : 'Pick a date'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={contactDate ? new Date(contactDate) : undefined}
                    onSelect={(date) => setValue('contact_date', date ? date.toISOString().split('T')[0] : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="follow_up_date">Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !followUpDate && 'text-muted-foreground'
                    )}
                  >
                    {followUpDate ? format(new Date(followUpDate), 'PPP') : 'Pick a date'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={followUpDate ? new Date(followUpDate) : undefined}
                    onSelect={(date) => setValue('follow_up_date', date ? date.toISOString().split('T')[0] : '')}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="estimated_close_date">Estimated Close Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !estimatedCloseDate && 'text-muted-foreground'
                    )}
                  >
                    {estimatedCloseDate ? format(new Date(estimatedCloseDate), 'PPP') : 'Pick a date'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={estimatedCloseDate ? new Date(estimatedCloseDate) : undefined}
                    onSelect={(date) => setValue('estimated_close_date', date ? date.toISOString().split('T')[0] : '')}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
