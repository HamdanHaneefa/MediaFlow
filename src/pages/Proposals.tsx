import { useState, useMemo } from 'react';
import { useProposals } from '@/contexts/ProposalsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  DollarSign, 
  TrendingUp,
  CheckCircle2,
  Users
} from 'lucide-react';
import { ProposalCard } from '@/components/proposals/ProposalCard';
import { ProposalDialog } from '@/components/proposals/ProposalDialog';
import { ProposalDetailsDialog } from '@/components/proposals/ProposalDetailsDialog';
import { ProposalTable } from '@/components/proposals/ProposalTable';
import { LeadDialog } from '@/components/proposals/LeadDialog';
import { LeadsTable } from '@/components/proposals/LeadsTable';
import { Proposal, Lead, ProposalStatus, LeadStatus } from '@/types';
import { toast } from 'sonner';

type ViewMode = 'cards' | 'table';
type SortOption = 'created' | 'amount' | 'status' | 'due_date';

interface ProposalFilters {
  search: string;
  status: ProposalStatus | 'all';
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

interface LeadFilters {
  search: string;
  status: LeadStatus | 'all';
  source: string;
}

export default function Proposals() {
  const { 
    proposals,
    leads,
    loading,
    createProposal,
    updateProposal,
    deleteProposal,
    sendProposal,
    duplicateProposal,
    acceptProposal,
    rejectProposal,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    convertLeadToClient
  } = useProposals();

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filters, setFilters] = useState<ProposalFilters>({
    search: '',
    status: 'all',
    sortBy: 'created',
    sortOrder: 'desc',
  });
  const [leadFilters, setLeadFilters] = useState<LeadFilters>({
    search: '',
    status: 'all',
    source: 'all',
  });
  const [selectedProposal, setSelectedProposal] = useState<Proposal | undefined>();
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('proposals');

  // Filter and sort proposals
  const filteredProposals = useMemo(() => {
    let filtered = proposals;

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(proposal =>
        proposal.title.toLowerCase().includes(searchLower) ||
        proposal.description?.toLowerCase().includes(searchLower) ||
        proposal.proposal_number.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === filters.status);
    }

    // Sort proposals
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (filters.sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'due_date':
          aValue = a.valid_until || '9999-12-31';
          bValue = b.valid_until || '9999-12-31';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [proposals, filters]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Apply search filter
    if (leadFilters.search) {
      const searchLower = leadFilters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (leadFilters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === leadFilters.status);
    }

    // Apply source filter
    if (leadFilters.source !== 'all') {
      filtered = filtered.filter(lead => lead.source === leadFilters.source);
    }

    return filtered;
  }, [leads, leadFilters]);

  // Calculate metrics
  const totalProposals = proposals.length;
  const sentProposals = proposals.filter(p => p.status === 'Sent').length;
  const acceptedProposals = proposals.filter(p => p.status === 'Accepted').length;
  const totalValue = proposals.reduce((sum, p) => sum + (p.amount || 0), 0);
  const acceptedValue = proposals.filter(p => p.status === 'Accepted').reduce((sum, p) => sum + (p.amount || 0), 0);
  const winRate = sentProposals > 0 ? Math.round((acceptedProposals / sentProposals) * 100) : 0;

  const handleCreateProposal = () => {
    setSelectedProposal(undefined);
    setShowProposalDialog(true);
  };

  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowProposalDialog(true);
  };

  const handleViewDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowDetailsDialog(true);
  };

  const handleSaveProposal = async (data: Omit<Proposal, 'id' | 'proposal_number' | 'version' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedProposal) {
        await updateProposal(selectedProposal.id, data);
        toast.success('Proposal updated successfully');
      } else {
        await createProposal(data);
        toast.success('Proposal created successfully');
      }
      setShowProposalDialog(false);
    } catch {
      toast.error('Failed to save proposal');
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    
    try {
      await deleteProposal(proposalId);
      toast.success('Proposal deleted successfully');
    } catch {
      toast.error('Failed to delete proposal');
    }
  };

  const handleSendProposal = async (proposalId: string) => {
    try {
      await sendProposal(proposalId);
      toast.success('Proposal sent successfully');
    } catch {
      toast.error('Failed to send proposal');
    }
  };

  const handleDuplicateProposal = async (proposalId: string) => {
    try {
      await duplicateProposal(proposalId);
      toast.success('Proposal duplicated successfully');
    } catch {
      toast.error('Failed to duplicate proposal');
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await acceptProposal(proposalId);
      toast.success('Proposal accepted');
    } catch {
      toast.error('Failed to accept proposal');
    }
  };

  const handleRejectProposal = async (proposalId: string, reason: string) => {
    try {
      await rejectProposal(proposalId, reason);
      toast.success('Proposal rejected');
    } catch {
      toast.error('Failed to reject proposal');
    }
  };

  const handleCreateLead = () => {
    setSelectedLead(undefined);
    setShowLeadDialog(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDialog(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await deleteLead(leadId);
      toast.success('Lead deleted successfully');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: LeadStatus) => {
    try {
      await updateLeadStatus(leadId, status);
      toast.success('Lead status updated');
    } catch {
      toast.error('Failed to update lead status');
    }
  };

  const handleConvertLead = async (lead: Lead) => {
    if (!confirm(`Convert ${lead.name} to a client?`)) return;
    
    try {
      await convertLeadToClient(lead.id);
      toast.success('Lead converted to client successfully');
    } catch {
      toast.error('Failed to convert lead');
    }
  };

  const handleSaveLead = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedLead) {
        await updateLead(selectedLead.id, data);
        toast.success('Lead updated successfully');
      } else {
        await createLead(data);
        toast.success('Lead created successfully');
      }
      setShowLeadDialog(false);
    } catch {
      toast.error('Failed to save lead');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads & Proposals</h1>
          <p className="text-slate-600 mt-1">Manage your project proposals and track their progress</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateLead} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Lead
          </Button>
          <Button onClick={handleCreateProposal}>
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Proposals</p>
                    <p className="text-2xl font-bold text-slate-900">{totalProposals}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${totalValue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Accepted Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${acceptedValue.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Win Rate</p>
                    <p className="text-2xl font-bold text-slate-900">{winRate}%</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search proposals..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as ProposalStatus | 'all' }))}
                  >
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Viewed">Viewed</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split('-');
                      setFilters(prev => ({ 
                        ...prev, 
                        sortBy: sortBy as SortOption, 
                        sortOrder: sortOrder as 'asc' | 'desc' 
                      }));
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created-desc">Newest First</SelectItem>
                      <SelectItem value="created-asc">Oldest First</SelectItem>
                      <SelectItem value="amount-desc">Highest Value</SelectItem>
                      <SelectItem value="amount-asc">Lowest Value</SelectItem>
                      <SelectItem value="due_date-asc">Due Date</SelectItem>
                      <SelectItem value="status-asc">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposals List */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onView={() => handleViewDetails(proposal)}
                  onEdit={() => handleEditProposal(proposal)}
                  onDelete={() => handleDeleteProposal(proposal.id)}
                  onSend={() => handleSendProposal(proposal.id)}
                  onDuplicate={() => handleDuplicateProposal(proposal.id)}
                  onAccept={() => handleAcceptProposal(proposal.id)}
                  onReject={(reason) => handleRejectProposal(proposal.id, reason)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <ProposalTable
                proposals={filteredProposals}
                onView={handleViewDetails}
                onEdit={handleEditProposal}
                onDelete={handleDeleteProposal}
                onSend={handleSendProposal}
                onDuplicate={handleDuplicateProposal}
                onAccept={handleAcceptProposal}
                onReject={handleRejectProposal}
              />
            </Card>
          )}

          {filteredProposals.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No proposals found</h3>
                <p className="text-slate-600 mb-4">
                  {filters.search || filters.status !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Get started by creating your first proposal'}
                </p>
                <Button onClick={handleCreateProposal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Proposal
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          {/* Lead Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Leads</p>
                    <p className="text-2xl font-bold text-slate-900">{leads.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">New Leads</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {leads.filter(l => l.status === 'New').length}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Qualified</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {leads.filter(l => l.status === 'Qualified').length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Value</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${leads.reduce((sum, l) => sum + (l.budget || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search leads..."
                    value={leadFilters.search}
                    onChange={(e) => setLeadFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={leadFilters.status}
                  onValueChange={(value) => setLeadFilters(prev => ({ ...prev, status: value as LeadStatus | 'all' }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={leadFilters.source}
                  onValueChange={(value) => setLeadFilters(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
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
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leads Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLeads.length > 0 ? (
                <LeadsTable
                  leads={filteredLeads}
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                  onConvert={handleConvertLead}
                  onUpdateStatus={handleUpdateLeadStatus}
                />
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads found</h3>
                  <p className="text-slate-600 mb-4">
                    {leadFilters.search || leadFilters.status !== 'all' || leadFilters.source !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by creating your first lead'}
                  </p>
                  <Button onClick={handleCreateLead}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Lead
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-slate-600">Analytics dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProposalDialog
        open={showProposalDialog}
        onOpenChange={setShowProposalDialog}
        proposal={selectedProposal}
        onSave={handleSaveProposal}
      />

      <ProposalDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        proposal={selectedProposal}
        onEdit={() => {
          setShowDetailsDialog(false);
          if (selectedProposal) handleEditProposal(selectedProposal);
        }}
        onDelete={() => {
          if (selectedProposal) handleDeleteProposal(selectedProposal.id);
          setShowDetailsDialog(false);
        }}
        onSend={() => {
          if (selectedProposal) handleSendProposal(selectedProposal.id);
        }}
        onDuplicate={() => {
          if (selectedProposal) handleDuplicateProposal(selectedProposal.id);
        }}
        onAccept={() => {
          if (selectedProposal) handleAcceptProposal(selectedProposal.id);
        }}
        onReject={(reason) => {
          if (selectedProposal) handleRejectProposal(selectedProposal.id, reason);
        }}
      />

      <LeadDialog
        open={showLeadDialog}
        onOpenChange={setShowLeadDialog}
        lead={selectedLead}
        onSave={handleSaveLead}
      />
    </div>
  );
}
