import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Lead, LeadStatus, LeadPriority } from '@/types';
import { MoreVertical, Edit, Trash2, UserPlus, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onConvert: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
}

const statusColors: Record<LeadStatus, string> = {
  'New': 'bg-blue-100 text-blue-800 border-blue-200',
  'Contacted': 'bg-purple-100 text-purple-800 border-purple-200',
  'Qualified': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Proposal Sent': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Negotiation': 'bg-orange-100 text-orange-800 border-orange-200',
  'Lost': 'bg-red-100 text-red-800 border-red-200',
  'Converted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const priorityColors: Record<LeadPriority, string> = {
  'Low': 'bg-slate-100 text-slate-800 border-slate-200',
  'Medium': 'bg-blue-100 text-blue-800 border-blue-200',
  'High': 'bg-orange-100 text-orange-800 border-orange-200',
  'Hot': 'bg-red-100 text-red-800 border-red-200',
};

export function LeadsTable({
  leads,
  onEdit,
  onDelete,
  onConvert,
  onUpdateStatus,
}: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No leads found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.company || '-'}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{lead.email}</div>
                  {lead.phone && (
                    <div className="text-slate-500">{lead.phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[lead.status]}
                >
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={priorityColors[lead.priority]}
                >
                  {lead.priority}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {lead.source}
              </TableCell>
              <TableCell>
                {lead.budget
                  ? `$${lead.budget.toLocaleString()}`
                  : '-'}
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {format(new Date(lead.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEdit(lead)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Lead
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(lead.id, 'Contacted')}
                      disabled={lead.status === 'Contacted'}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Mark Contacted
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(lead.id, 'Qualified')}
                      disabled={lead.status === 'Qualified'}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Mark Qualified
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => onConvert(lead)}
                      disabled={lead.status === 'Converted'}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Convert to Client
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => onDelete(lead.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
