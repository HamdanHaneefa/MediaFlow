import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Lead, 
  Proposal, 
  ProposalItem, 
  ProposalRevision, 
  ProposalActivity, 
  ProposalSignature,
  ProposalStatus,
  Contact
} from '@/types';

interface ProposalsContextType {
  // Lead management
  leads: Lead[];
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<Lead | null>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  deleteLead: (id: string) => Promise<boolean>;
  convertLeadToContact: (leadId: string) => Promise<Contact | null>;

  // Proposal management
  proposals: Proposal[];
  proposalItems: ProposalItem[];
  proposalRevisions: ProposalRevision[];
  proposalActivities: ProposalActivity[];
  proposalSignatures: ProposalSignature[];
  
  createProposal: (proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'proposal_number' | 'version'>) => Promise<Proposal | null>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<Proposal | null>;
  deleteProposal: (id: string) => Promise<boolean>;
  duplicateProposal: (id: string) => Promise<Proposal | null>;
  
  // Proposal items
  addProposalItem: (proposalId: string, item: Omit<ProposalItem, 'id' | 'proposal_id' | 'created_at'>) => Promise<ProposalItem | null>;
  updateProposalItem: (id: string, updates: Partial<ProposalItem>) => Promise<ProposalItem | null>;
  deleteProposalItem: (id: string) => Promise<boolean>;
  
  // Proposal actions
  sendProposal: (id: string) => Promise<boolean>;
  acceptProposal: (id: string, signatureData?: string) => Promise<boolean>;
  rejectProposal: (id: string, reason: string) => Promise<boolean>;
  createRevision: (proposalId: string, changes: string) => Promise<Proposal | null>;
  
  // Utility functions
  getProposalById: (id: string) => Proposal | undefined;
  getProposalsByLead: (leadId: string) => Proposal[];
  getProposalsByProject: (projectId: string) => Proposal[];
  getProposalsByStatus: (status: ProposalStatus) => Proposal[];
  getItemsByProposal: (proposalId: string) => ProposalItem[];
  getRevisionsByProposal: (proposalId: string) => ProposalRevision[];
  getActivitiesByProposal: (proposalId: string) => ProposalActivity[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Data fetching
  fetchProposals: () => Promise<void>;
  fetchLeads: () => Promise<void>;
  fetchProposalItems: (proposalId?: string) => Promise<void>;
  fetchProposalRevisions: (proposalId?: string) => Promise<void>;
  fetchProposalActivities: (proposalId?: string) => Promise<void>;
}

const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined);

export function ProposalsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);
  const [proposalRevisions, setProposalRevisions] = useState<ProposalRevision[]>([]);
  const [proposalActivities, setProposalActivities] = useState<ProposalActivity[]>([]);
  const [proposalSignatures] = useState<ProposalSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lead management
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For development, use mock data
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'John Smith',
          company: 'TechCorp Inc',
          email: 'john.smith@techcorp.com',
          phone: '(555) 123-4567',
          status: 'Qualified',
          source: 'Website',
          priority: 'High',
          estimated_value: 50000,
          estimated_close_date: '2024-12-15',
          notes: 'Interested in corporate video production',
          tags: ['corporate', 'video production', 'high value'],
          assigned_to: '1',
          contact_date: '2024-11-15T10:00:00Z',
          follow_up_date: '2024-11-30T14:00:00Z',
          created_at: '2024-11-10T09:00:00Z',
          updated_at: '2024-11-22T16:30:00Z',
        },
        {
          id: '2',
          name: 'Sarah Davis',
          company: 'Creative Studio',
          email: 'sarah@creativestudio.com',
          phone: '(555) 987-6543',
          status: 'Proposal Sent',
          source: 'Referral',
          priority: 'Medium',
          estimated_value: 25000,
          estimated_close_date: '2024-12-01',
          notes: 'Looking for wedding videography package',
          tags: ['wedding', 'videography', 'package'],
          assigned_to: '2',
          contact_date: '2024-11-20T14:00:00Z',
          follow_up_date: '2024-11-28T10:00:00Z',
          created_at: '2024-11-18T11:00:00Z',
          updated_at: '2024-11-25T09:15:00Z',
        }
      ];
      
      setLeads(mockLeads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead | null> => {
    try {
      const newLead: Lead = {
        ...leadData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      console.error('Error creating lead:', err);
      return null;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead | null> => {
    try {
      const updatedLead = {
        ...leads.find(l => l.id === id)!,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
      return updatedLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
      console.error('Error updating lead:', err);
      return null;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      setLeads(prev => prev.filter(lead => lead.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
      console.error('Error deleting lead:', err);
      return false;
    }
  };

  const convertLeadToContact = async (leadId: string): Promise<Contact | null> => {
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) throw new Error('Lead not found');

      // Create contact from lead data
      const contact: Contact = {
        id: Math.random().toString(36).substr(2, 9),
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        role: 'Client',
        status: 'Active',
        notes: lead.notes,
        tags: lead.tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update lead status to converted
      await updateLead(leadId, { status: 'Converted' });

      return contact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert lead');
      console.error('Error converting lead:', err);
      return null;
    }
  };

  // Proposal management
  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For development, use mock data
      const mockProposals: Proposal[] = [
        {
          id: '1',
          title: 'Corporate Video Production',
          description: 'Complete corporate video production for TechCorp Inc annual meeting',
          proposal_number: 'PROP-0001',
          status: 'Sent',
          type: 'Standard',
          lead_id: '1',
          client_id: undefined,
          project_id: undefined,
          amount: 50000,
          currency: 'USD',
          valid_until: '2024-12-30',
          sent_date: '2024-11-22T10:00:00Z',
          viewed_date: undefined,
          accepted_date: undefined,
          rejected_date: undefined,
          rejection_reason: undefined,
          terms: 'Payment terms: 50% upfront, 50% on completion',
          notes: 'Rush project - client needs completion by end of year',
          created_by: '1',
          assigned_team_members: ['1', '2'],
          document_url: undefined,
          version: 1,
          parent_proposal_id: undefined,
          created_at: '2024-11-20T09:00:00Z',
          updated_at: '2024-11-22T10:00:00Z',
        },
        {
          id: '2',
          title: 'Wedding Videography Package',
          description: 'Complete wedding videography and editing package',
          proposal_number: 'PROP-0002',
          status: 'Draft',
          type: 'Package Deal',
          lead_id: '2',
          client_id: undefined,
          project_id: undefined,
          amount: 25000,
          currency: 'USD',
          valid_until: '2024-12-15',
          sent_date: undefined,
          viewed_date: undefined,
          accepted_date: undefined,
          rejected_date: undefined,
          rejection_reason: undefined,
          terms: 'Payment terms: 30% booking fee, 70% on delivery',
          notes: 'Include drone footage and highlight reel',
          created_by: '2',
          assigned_team_members: ['2', '3'],
          document_url: undefined,
          version: 1,
          parent_proposal_id: undefined,
          created_at: '2024-11-25T14:00:00Z',
          updated_at: '2024-11-25T14:00:00Z',
        },
        {
          id: '3',
          title: 'Social Media Content Package',
          description: 'Monthly social media content creation and management',
          proposal_number: 'PROP-0003',
          status: 'Accepted',
          type: 'Retainer',
          lead_id: undefined,
          client_id: '3',
          project_id: '1',
          amount: 15000,
          currency: 'USD',
          valid_until: '2024-11-30',
          sent_date: '2024-11-15T09:00:00Z',
          viewed_date: '2024-11-16T14:30:00Z',
          accepted_date: '2024-11-18T11:00:00Z',
          rejected_date: undefined,
          rejection_reason: undefined,
          terms: 'Monthly retainer with 3-month minimum commitment',
          notes: 'Client wants to start January 2025',
          created_by: '1',
          assigned_team_members: ['1', '4'],
          document_url: undefined,
          version: 1,
          parent_proposal_id: undefined,
          created_at: '2024-11-10T08:00:00Z',
          updated_at: '2024-11-18T11:00:00Z',
        }
      ];
      
      setProposals(mockProposals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposalData: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'proposal_number' | 'version'>): Promise<Proposal | null> => {
    try {
      const proposalNumber = `PROP-${String(proposals.length + 1).padStart(4, '0')}`;
      
      const newProposal: Proposal = {
        ...proposalData,
        id: Math.random().toString(36).substr(2, 9),
        proposal_number: proposalNumber,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setProposals(prev => [newProposal, ...prev]);
      
      // Create activity record
      const activity: ProposalActivity = {
        id: Math.random().toString(36).substr(2, 9),
        proposal_id: newProposal.id,
        activity_type: 'Created',
        description: `Proposal ${proposalNumber} created`,
        performed_by: newProposal.created_by,
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setProposalActivities(prev => [activity, ...prev]);
      
      return newProposal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
      console.error('Error creating proposal:', err);
      return null;
    }
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>): Promise<Proposal | null> => {
    try {
      const updatedProposal = {
        ...proposals.find(p => p.id === id)!,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      setProposals(prev => prev.map(proposal => proposal.id === id ? updatedProposal : proposal));
      return updatedProposal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update proposal');
      console.error('Error updating proposal:', err);
      return null;
    }
  };

  const deleteProposal = async (id: string): Promise<boolean> => {
    try {
      setProposals(prev => prev.filter(proposal => proposal.id !== id));
      setProposalItems(prev => prev.filter(item => item.proposal_id !== id));
      setProposalRevisions(prev => prev.filter(revision => revision.proposal_id !== id));
      setProposalActivities(prev => prev.filter(activity => activity.proposal_id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete proposal');
      console.error('Error deleting proposal:', err);
      return false;
    }
  };

  const duplicateProposal = async (id: string): Promise<Proposal | null> => {
    try {
      const original = proposals.find(p => p.id === id);
      if (!original) throw new Error('Proposal not found');

      const duplicateData = {
        ...original,
        title: `${original.title} (Copy)`,
        status: 'Draft' as ProposalStatus,
        sent_date: undefined,
        viewed_date: undefined,
        accepted_date: undefined,
        rejected_date: undefined,
        rejection_reason: undefined,
      };

      // Remove fields that will be auto-generated
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, created_at, updated_at, proposal_number, version, ...dataForDuplicate } = duplicateData;
      
      return await createProposal(dataForDuplicate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate proposal');
      console.error('Error duplicating proposal:', err);
      return null;
    }
  };

  const sendProposal = async (id: string): Promise<boolean> => {
    try {
      const proposal = proposals.find(p => p.id === id);
      if (!proposal) throw new Error('Proposal not found');

      await updateProposal(id, {
        status: 'Sent',
        sent_date: new Date().toISOString(),
      });

      // Create activity record
      const activity: ProposalActivity = {
        id: Math.random().toString(36).substr(2, 9),
        proposal_id: id,
        activity_type: 'Sent',
        description: `Proposal ${proposal.proposal_number} sent to client`,
        performed_by: proposal.created_by,
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setProposalActivities(prev => [activity, ...prev]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send proposal');
      console.error('Error sending proposal:', err);
      return false;
    }
  };

  const acceptProposal = async (id: string, signatureData?: string): Promise<boolean> => {
    try {
      const proposal = proposals.find(p => p.id === id);
      if (!proposal) throw new Error('Proposal not found');

      await updateProposal(id, {
        status: 'Accepted',
        accepted_date: new Date().toISOString(),
      });

      // Create activity record
      const activity: ProposalActivity = {
        id: Math.random().toString(36).substr(2, 9),
        proposal_id: id,
        activity_type: 'Accepted',
        description: `Proposal ${proposal.proposal_number} accepted by client`,
        performed_by: undefined,
        metadata: { signatureData },
        created_at: new Date().toISOString(),
      };
      setProposalActivities(prev => [activity, ...prev]);

      // Convert lead to contact if linked to a lead
      if (proposal.lead_id) {
        await convertLeadToContact(proposal.lead_id);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept proposal');
      console.error('Error accepting proposal:', err);
      return false;
    }
  };

  const rejectProposal = async (id: string, reason: string): Promise<boolean> => {
    try {
      const proposal = proposals.find(p => p.id === id);
      if (!proposal) throw new Error('Proposal not found');

      await updateProposal(id, {
        status: 'Rejected',
        rejected_date: new Date().toISOString(),
        rejection_reason: reason,
      });

      // Create activity record
      const activity: ProposalActivity = {
        id: Math.random().toString(36).substr(2, 9),
        proposal_id: id,
        activity_type: 'Rejected',
        description: `Proposal ${proposal.proposal_number} rejected: ${reason}`,
        performed_by: undefined,
        metadata: { reason },
        created_at: new Date().toISOString(),
      };
      setProposalActivities(prev => [activity, ...prev]);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject proposal');
      console.error('Error rejecting proposal:', err);
      return false;
    }
  };

  const createRevision = async (proposalId: string, changes: string): Promise<Proposal | null> => {
    try {
      const original = proposals.find(p => p.id === proposalId);
      if (!original) throw new Error('Proposal not found');

      const revision: Proposal = {
        ...original,
        id: Math.random().toString(36).substr(2, 9),
        version: original.version + 1,
        parent_proposal_id: original.id,
        status: 'Draft',
        sent_date: undefined,
        viewed_date: undefined,
        accepted_date: undefined,
        rejected_date: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setProposals(prev => [revision, ...prev]);

      // Create revision record
      const revisionRecord: ProposalRevision = {
        id: Math.random().toString(36).substr(2, 9),
        proposal_id: proposalId,
        version: revision.version,
        changes_summary: changes,
        created_by: revision.created_by,
        document_url: undefined,
        created_at: new Date().toISOString(),
      };
      setProposalRevisions(prev => [revisionRecord, ...prev]);

      // Create activity record
      const activity: ProposalActivity = {
        id: Math.random().toString(36).substr(2, 9),
        proposal_id: revision.id,
        activity_type: 'Revised',
        description: `Proposal revised (v${revision.version}): ${changes}`,
        performed_by: revision.created_by,
        metadata: { originalProposalId: proposalId, changes },
        created_at: new Date().toISOString(),
      };
      setProposalActivities(prev => [activity, ...prev]);

      return revision;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create revision');
      console.error('Error creating revision:', err);
      return null;
    }
  };

  // Proposal items
  const fetchProposalItems = async (proposalId?: string) => {
    try {
      // Mock data for development
      const mockItems: ProposalItem[] = [
        {
          id: '1',
          proposal_id: '1',
          name: 'Video Production - Main Event',
          description: '8-hour video coverage of corporate annual meeting',
          quantity: 1,
          unit_price: 25000,
          total: 25000,
          sort_order: 1,
          created_at: '2024-11-20T09:30:00Z',
        },
        {
          id: '2',
          proposal_id: '1',
          name: 'Post-Production Editing',
          description: 'Video editing, color correction, and audio mixing',
          quantity: 40,
          unit_price: 150,
          total: 6000,
          sort_order: 2,
          created_at: '2024-11-20T09:30:00Z',
        },
        {
          id: '3',
          proposal_id: '1',
          name: 'Equipment Rental',
          description: 'Professional camera and audio equipment rental',
          quantity: 8,
          unit_price: 500,
          total: 4000,
          sort_order: 3,
          created_at: '2024-11-20T09:30:00Z',
        }
      ];

      setProposalItems(proposalId ? mockItems.filter(item => item.proposal_id === proposalId) : mockItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proposal items');
      console.error('Error fetching proposal items:', err);
    }
  };

  const addProposalItem = async (proposalId: string, itemData: Omit<ProposalItem, 'id' | 'proposal_id' | 'created_at'>): Promise<ProposalItem | null> => {
    try {
      const newItem: ProposalItem = {
        ...itemData,
        id: Math.random().toString(36).substr(2, 9),
        proposal_id: proposalId,
        total: itemData.quantity * itemData.unit_price,
        created_at: new Date().toISOString(),
      };

      setProposalItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add proposal item');
      console.error('Error adding proposal item:', err);
      return null;
    }
  };

  const updateProposalItem = async (id: string, updates: Partial<ProposalItem>): Promise<ProposalItem | null> => {
    try {
      const updatedItem = {
        ...proposalItems.find(item => item.id === id)!,
        ...updates,
      };

      // Recalculate total if quantity or unit_price changed
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
      }

      setProposalItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update proposal item');
      console.error('Error updating proposal item:', err);
      return null;
    }
  };

  const deleteProposalItem = async (id: string): Promise<boolean> => {
    try {
      setProposalItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete proposal item');
      console.error('Error deleting proposal item:', err);
      return false;
    }
  };

  const fetchProposalRevisions = async (proposalId?: string) => {
    // Mock data for development
    const mockRevisions: ProposalRevision[] = [];
    setProposalRevisions(proposalId ? mockRevisions.filter(rev => rev.proposal_id === proposalId) : mockRevisions);
  };

  const fetchProposalActivities = async (proposalId?: string) => {
    // Mock data for development
    const mockActivities: ProposalActivity[] = [];
    setProposalActivities(proposalId ? mockActivities.filter(act => act.proposal_id === proposalId) : mockActivities);
  };

  // Utility functions
  const getProposalById = (id: string): Proposal | undefined => {
    return proposals.find(p => p.id === id);
  };

  const getProposalsByLead = (leadId: string): Proposal[] => {
    return proposals.filter(p => p.lead_id === leadId);
  };

  const getProposalsByProject = (projectId: string): Proposal[] => {
    return proposals.filter(p => p.project_id === projectId);
  };

  const getProposalsByStatus = (status: ProposalStatus): Proposal[] => {
    return proposals.filter(p => p.status === status);
  };

  const getItemsByProposal = (proposalId: string): ProposalItem[] => {
    return proposalItems.filter(item => item.proposal_id === proposalId);
  };

  const getRevisionsByProposal = (proposalId: string): ProposalRevision[] => {
    return proposalRevisions.filter(rev => rev.proposal_id === proposalId);
  };

  const getActivitiesByProposal = (proposalId: string): ProposalActivity[] => {
    return proposalActivities.filter(act => act.proposal_id === proposalId);
  };

  useEffect(() => {
    fetchLeads();
    fetchProposals();
    fetchProposalItems();
    fetchProposalRevisions();
    fetchProposalActivities();
  }, []);

  return (
    <ProposalsContext.Provider
      value={{
        // Lead management
        leads,
        createLead,
        updateLead,
        deleteLead,
        convertLeadToContact,
        
        // Proposal management
        proposals,
        proposalItems,
        proposalRevisions,
        proposalActivities,
        proposalSignatures,
        
        createProposal,
        updateProposal,
        deleteProposal,
        duplicateProposal,
        
        // Proposal items
        addProposalItem,
        updateProposalItem,
        deleteProposalItem,
        
        // Proposal actions
        sendProposal,
        acceptProposal,
        rejectProposal,
        createRevision,
        
        // Utility functions
        getProposalById,
        getProposalsByLead,
        getProposalsByProject,
        getProposalsByStatus,
        getItemsByProposal,
        getRevisionsByProposal,
        getActivitiesByProposal,
        
        // Loading states
        loading,
        error,
        
        // Data fetching
        fetchProposals,
        fetchLeads,
        fetchProposalItems,
        fetchProposalRevisions,
        fetchProposalActivities,
      }}
    >
      {children}
    </ProposalsContext.Provider>
  );
}

export function useProposals() {
  const context = useContext(ProposalsContext);
  if (context === undefined) {
    throw new Error('useProposals must be used within a ProposalsProvider');
  }
  return context;
}
