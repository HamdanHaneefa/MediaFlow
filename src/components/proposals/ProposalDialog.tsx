import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Proposal, ProposalType } from '@/types';
import { useContacts } from '@/contexts/ContactsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useProposals } from '@/contexts/ProposalsContext';
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

interface ProposalFormData {
  title: string;
  description: string;
  type: ProposalType;
  lead_id: string;
  client_id: string;
  project_id: string;
  amount: number;
  currency: string;
  valid_until: string;
  terms: string;
  notes: string;
}

interface ProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal?: Proposal;
  onSave: (data: Omit<Proposal, 'id' | 'proposal_number' | 'version' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function ProposalDialog({
  open,
  onOpenChange,
  proposal,
  onSave,
}: ProposalDialogProps) {
  const { contacts } = useContacts();
  const { projects } = useProjects();
  const { leads } = useProposals();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProposalFormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'Standard',
      lead_id: '',
      client_id: '',
      project_id: '',
      amount: 0,
      currency: 'USD',
      valid_until: '',
      terms: '',
      notes: '',
    },
  });

  const validUntil = watch('valid_until');

  useEffect(() => {
    if (proposal) {
      reset({
        title: proposal.title,
        description: proposal.description || '',
        type: proposal.type,
        lead_id: proposal.lead_id || '',
        client_id: proposal.client_id || '',
        project_id: proposal.project_id || '',
        amount: proposal.amount,
        currency: proposal.currency,
        valid_until: proposal.valid_until || '',
        terms: proposal.terms || '',
        notes: proposal.notes || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        type: 'Standard',
        lead_id: '',
        client_id: '',
        project_id: '',
        amount: 0,
        currency: 'USD',
        valid_until: '',
        terms: '',
        notes: '',
      });
    }
  }, [proposal, reset]);

  const onSubmit = async (data: ProposalFormData) => {
    try {
      await onSave({
        title: data.title,
        description: data.description,
        status: 'Draft',
        type: data.type,
        lead_id: data.lead_id || undefined,
        client_id: data.client_id || undefined,
        project_id: data.project_id || undefined,
        amount: Number(data.amount),
        currency: data.currency,
        valid_until: data.valid_until || undefined,
        terms: data.terms || undefined,
        notes: data.notes || undefined,
        assigned_team_members: [],
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving proposal:', error);
    }
  };

  const clients = contacts.filter(c => c.role === 'Client');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {proposal ? 'Edit Proposal' : 'Create New Proposal'}
          </DialogTitle>
          <DialogDescription>
            {proposal
              ? 'Update the proposal details below.'
              : 'Fill in the details to create a new proposal.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter proposal title"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter proposal description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(value: ProposalType) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                  <SelectItem value="Quick Quote">Quick Quote</SelectItem>
                  <SelectItem value="Retainer">Retainer</SelectItem>
                  <SelectItem value="Package Deal">Package Deal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={watch('currency')}
                onValueChange={(value) => setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="valid_until">Valid Until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !validUntil && 'text-muted-foreground'
                    )}
                  >
                    {validUntil ? format(new Date(validUntil), 'PPP') : 'Pick a date'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validUntil ? new Date(validUntil) : undefined}
                    onSelect={(date) => setValue('valid_until', date ? date.toISOString().split('T')[0] : '')}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="lead_id">Lead</Label>
              <Select
                value={watch('lead_id')}
                onValueChange={(value) => setValue('lead_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} {lead.company && `(${lead.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="client_id">Client</Label>
              <Select
                value={watch('client_id')}
                onValueChange={(value) => setValue('client_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project_id">Project</Label>
              <Select
                value={watch('project_id')}
                onValueChange={(value) => setValue('project_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                {...register('terms')}
                placeholder="Enter terms and conditions"
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Enter internal notes"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : proposal ? 'Update' : 'Create'} Proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
