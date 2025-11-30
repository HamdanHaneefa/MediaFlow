import { Proposal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Send, 
  Copy,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface ProposalCardProps {
  proposal: Proposal;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
  onDuplicate: () => void;
  onAccept: () => void;
  onReject: (reason: string) => void;
}

export function ProposalCard({ 
  proposal, 
  onView, 
  onEdit, 
  onDelete, 
  onSend, 
  onDuplicate, 
  onAccept, 
  onReject 
}: ProposalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Viewed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isExpiringSoon = proposal.valid_until && 
    new Date(proposal.valid_until) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const handleReject = () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      onReject(reason);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-slate-900 truncate">
              {proposal.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getStatusColor(proposal.status)}>
                {proposal.status}
              </Badge>
              <span className="text-sm text-slate-500">#{proposal.proposal_number}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {proposal.status === 'Draft' && (
                <DropdownMenuItem onClick={onSend}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </DropdownMenuItem>
              )}
              {(proposal.status === 'Sent' || proposal.status === 'Viewed') && (
                <>
                  <DropdownMenuItem onClick={onAccept} className="text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Accepted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReject} className="text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark as Rejected
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0" onClick={onView}>
        <div className="space-y-3">
          {proposal.description && (
            <p className="text-sm text-slate-600 line-clamp-2">
              {proposal.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-slate-900">
                ${(proposal.amount || 0).toLocaleString()}
              </span>
              <span className="text-sm text-slate-500">{proposal.currency || 'USD'}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {proposal.type}
            </Badge>
          </div>

          {proposal.valid_until && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                Valid until {format(new Date(proposal.valid_until), 'MMM dd, yyyy')}
              </span>
              {isExpiringSoon && (
                <Badge variant="destructive" className="text-xs ml-auto">
                  Expiring Soon
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500">
                Created {format(new Date(proposal.created_at), 'MMM dd')}
              </span>
            </div>
            {proposal.version > 1 && (
              <Badge variant="secondary" className="text-xs">
                v{proposal.version}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
