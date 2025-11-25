import { Proposal } from '@/types';
import { useContacts } from '@/contexts/ContactsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { useProposals } from '@/contexts/ProposalsContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Copy,
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
  FileText,
  User,
  Building2,
  Clock,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';

interface ProposalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal?: Proposal;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
  onDuplicate: () => void;
  onAccept: () => void;
  onReject: (reason: string) => void;
}

export function ProposalDetailsDialog({
  open,
  onOpenChange,
  proposal,
  onEdit,
  onDelete,
  onSend,
  onDuplicate,
  onAccept,
  onReject,
}: ProposalDetailsDialogProps) {
  const { contacts } = useContacts();
  const { projects } = useProjects();
  const { leads, getItemsByProposal, getActivitiesByProposal, getRevisionsByProposal } = useProposals();

  if (!proposal) return null;

  const lead = proposal.lead_id ? leads.find(l => l.id === proposal.lead_id) : undefined;
  const client = proposal.client_id ? contacts.find(c => c.id === proposal.client_id) : undefined;
  const project = proposal.project_id ? projects.find(p => p.id === proposal.project_id) : undefined;
  const items = getItemsByProposal(proposal.id);
  const activities = getActivitiesByProposal(proposal.id);
  const revisions = getRevisionsByProposal(proposal.id);

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

  const handleReject = () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      onReject(reason);
    }
  };

  const isExpiringSoon = proposal.valid_until && 
    new Date(proposal.valid_until) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {proposal.title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Proposal #{proposal.proposal_number} • Created {format(new Date(proposal.created_at), 'MMM dd, yyyy')}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(proposal.status)}>
                {proposal.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="revisions">Revisions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Amount</span>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">${proposal.amount.toLocaleString()}</span>
                      <span className="text-sm text-slate-500">{proposal.currency}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Type</span>
                    <Badge variant="outline">{proposal.type}</Badge>
                  </div>
                  
                  {proposal.valid_until && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Valid Until</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{format(new Date(proposal.valid_until), 'MMM dd, yyyy')}</span>
                        {isExpiringSoon && (
                          <Badge variant="destructive" className="text-xs">
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {proposal.version > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Version</span>
                      <Badge variant="secondary">v{proposal.version}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Relationships */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Relationships
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-slate-500">Lead • {lead.company}</div>
                      </div>
                    </div>
                  )}
                  
                  {client && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-slate-500">Client • {client.company}</div>
                      </div>
                    </div>
                  )}
                  
                  {project && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-slate-500">Project</div>
                      </div>
                    </div>
                  )}
                  
                  {!lead && !client && !project && (
                    <p className="text-sm text-slate-500">No relationships linked</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {proposal.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{proposal.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Terms */}
            {proposal.terms && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{proposal.terms}</p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {proposal.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{proposal.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Items</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium">${item.total.toLocaleString()}</div>
                          <div className="text-sm text-slate-500">
                            {item.quantity} × ${item.unit_price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>${items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No items added to this proposal yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No activity recorded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revisions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revision History</CardTitle>
              </CardHeader>
              <CardContent>
                {revisions.length > 0 ? (
                  <div className="space-y-4">
                    {revisions.map((revision) => (
                      <div key={revision.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Version {revision.version}</h4>
                          <span className="text-sm text-slate-500">
                            {format(new Date(revision.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{revision.changes_summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No revisions created yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
