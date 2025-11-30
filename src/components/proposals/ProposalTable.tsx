import { Proposal } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from 'lucide-react';
import { format } from 'date-fns';

interface ProposalTableProps {
  proposals: Proposal[];
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposalId: string) => void;
  onSend: (proposalId: string) => void;
  onDuplicate: (proposalId: string) => void;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string, reason: string) => void;
}

export function ProposalTable({
  proposals,
  onView,
  onEdit,
  onDelete,
  onSend,
  onDuplicate,
  onAccept,
  onReject,
}: ProposalTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReject = (proposalId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      onReject(proposalId, reason);
    }
  };

  const isExpiringSoon = (validUntil?: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proposal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell onClick={() => onView(proposal)}>
                <div>
                  <div className="font-medium">{proposal.title}</div>
                  <div className="text-sm text-muted-foreground">
                    #{proposal.proposal_number}
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={() => onView(proposal)}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(proposal.status)}>
                    {proposal.status}
                  </Badge>
                  {proposal.version > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      v{proposal.version}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={() => onView(proposal)}>
                <div className="font-medium">
                  ${(proposal.amount || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {proposal.currency || 'USD'}
                </div>
              </TableCell>
              <TableCell onClick={() => onView(proposal)}>
                <Badge variant="outline">{proposal.type}</Badge>
              </TableCell>
              <TableCell onClick={() => onView(proposal)}>
                {proposal.valid_until ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {format(new Date(proposal.valid_until), 'MMM dd, yyyy')}
                    </span>
                    {isExpiringSoon(proposal.valid_until) && (
                      <Badge variant="destructive" className="text-xs">
                        Soon
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell onClick={() => onView(proposal)}>
                <span className="text-sm">
                  {format(new Date(proposal.created_at), 'MMM dd, yyyy')}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onView(proposal)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(proposal)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(proposal.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {proposal.status === 'Draft' && (
                      <DropdownMenuItem onClick={() => onSend(proposal.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send to Client
                      </DropdownMenuItem>
                    )}
                    {(proposal.status === 'Sent' || proposal.status === 'Viewed') && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => onAccept(proposal.id)}
                          className="text-green-600"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark as Accepted
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleReject(proposal.id)}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Mark as Rejected
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(proposal.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {proposals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No proposals found</p>
        </div>
      )}
    </div>
  );
}
