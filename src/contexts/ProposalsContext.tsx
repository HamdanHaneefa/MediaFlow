import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  proposalsAPI,
  type Lead,
  type Proposal,
  type CreateLeadData,
  type CreateProposalData,
  type LeadStats,
  type ProposalStats,
  type Contact
} from '@/services/api';
import type { UpdateLeadData, UpdateProposalData } from '@/services/api/proposals';

interface ProposalsContextType {
  // Lead management
  leads: Lead[];
  loading: boolean;
  error: string | null;
  pagination: {
    leads: { page: number; limit: number; total: number; totalPages: number };
    proposals: { page: number; limit: number; total: number; totalPages: number };
  };
  fetchLeads: (params?: { page?: number; limit?: number; search?: string; status?: string; source?: string; assigned_to?: string }) => Promise<void>;
  createLead: (data: CreateLeadData) => Promise<Lead | null>;
  updateLead: (id: string, data: UpdateLeadData) => Promise<Lead | null>;
  deleteLead: (id: string) => Promise<boolean>;
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<Lead | null>;
  assignLead: (leadId: string, userId: string) => Promise<Lead | null>;
  convertLeadToClient: (leadId: string) => Promise<Contact | null>;
  getLeadStats: () => Promise<LeadStats | null>;
  exportLeads: (params?: { status?: string; source?: string; assigned_to?: string }) => Promise<void>;

  // Proposal management
  proposals: Proposal[];
  fetchProposals: (params?: { page?: number; limit?: number; search?: string; status?: string; client_id?: string }) => Promise<void>;
  createProposal: (data: CreateProposalData) => Promise<Proposal | null>;
  updateProposal: (id: string, data: UpdateProposalData) => Promise<Proposal | null>;
  deleteProposal: (id: string) => Promise<boolean>;
  sendProposal: (id: string) => Promise<Proposal | null>;
  acceptProposal: (id: string) => Promise<Proposal | null>;
  rejectProposal: (id: string, reason?: string) => Promise<Proposal | null>;
  downloadProposalPDF: (id: string) => Promise<void>;
  duplicateProposal: (id: string) => Promise<Proposal | null>;
  getProposalStats: () => Promise<ProposalStats | null>;
  getProposalById: (id: string) => Proposal | undefined;
}

const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined);

export function ProposalsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    leads: { page: 1, limit: 10, total: 0, totalPages: 0 },
    proposals: { page: 1, limit: 10, total: 0, totalPages: 0 },
  });

  // Lead management
  const fetchLeads = async (params?: { page?: number; limit?: number; search?: string; status?: string; source?: string; assigned_to?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await proposalsAPI.leads.getAll(params);
      setLeads(response.items);
      setPagination(prev => ({
        ...prev,
        leads: {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: CreateLeadData): Promise<Lead | null> => {
    try {
      const newLead = await proposalsAPI.leads.create(leadData);
      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      console.error('Error creating lead:', err);
      return null;
    }
  };

  const updateLead = async (id: string, updates: UpdateLeadData): Promise<Lead | null> => {
    try {
      const updatedLead = await proposalsAPI.leads.update(id, updates);
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
      await proposalsAPI.leads.delete(id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
      console.error('Error deleting lead:', err);
      return false;
    }
  };

  const updateLeadStatus = async (id: string, status: Lead['status']): Promise<Lead | null> => {
    try {
      const updatedLead = await proposalsAPI.leads.updateStatus(id, status);
      setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
      return updatedLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead status');
      console.error('Error updating lead status:', err);
      return null;
    }
  };

  const assignLead = async (leadId: string, userId: string): Promise<Lead | null> => {
    try {
      const updatedLead = await proposalsAPI.leads.assign(leadId, userId);
      setLeads(prev => prev.map(lead => lead.id === leadId ? updatedLead : lead));
      return updatedLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign lead');
      console.error('Error assigning lead:', err);
      return null;
    }
  };

  const convertLeadToClient = async (leadId: string): Promise<Contact | null> => {
    try {
      const client = await proposalsAPI.leads.convertToClient(leadId);
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      return client;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert lead');
      console.error('Error converting lead:', err);
      return null;
    }
  };

  const getLeadStats = async (): Promise<LeadStats | null> => {
    try {
      return await proposalsAPI.leads.getStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get lead stats');
      console.error('Error getting lead stats:', err);
      return null;
    }
  };

  const exportLeads = async (params?: { status?: string; source?: string; assigned_to?: string }) => {
    try {
      const blob = await proposalsAPI.leads.exportCSV(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export leads');
      console.error('Error exporting leads:', err);
    }
  };

  // Proposal management
  const fetchProposals = async (params?: { page?: number; limit?: number; search?: string; status?: string; client_id?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await proposalsAPI.proposals.getAll(params);
      setProposals(response.items);
      setPagination(prev => ({
        ...prev,
        proposals: {
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposalData: CreateProposalData): Promise<Proposal | null> => {
    try {
      const newProposal = await proposalsAPI.proposals.create(proposalData);
      setProposals(prev => [newProposal, ...prev]);
      return newProposal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
      console.error('Error creating proposal:', err);
      return null;
    }
  };

  const updateProposal = async (id: string, updates: UpdateProposalData): Promise<Proposal | null> => {
    try {
      const updatedProposal = await proposalsAPI.proposals.update(id, updates);
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
      await proposalsAPI.proposals.delete(id);
      setProposals(prev => prev.filter(proposal => proposal.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete proposal');
      console.error('Error deleting proposal:', err);
      return false;
    }
  };

  const sendProposal = async (id: string): Promise<Proposal | null> => {
    try {
      const updatedProposal = await proposalsAPI.proposals.send(id);
      setProposals(prev => prev.map(proposal => proposal.id === id ? updatedProposal : proposal));
      return updatedProposal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send proposal');
      console.error('Error sending proposal:', err);
      return null;
    }
  };

  const acceptProposal = async (id: string): Promise<Proposal | null> => {
    try {
      const updatedProposal = await proposalsAPI.proposals.accept(id);
      setProposals(prev => prev.map(proposal => proposal.id === id ? updatedProposal : proposal));
      return updatedProposal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept proposal');
      console.error('Error accepting proposal:', err);
      return null;
    }
  };

  const rejectProposal = async (id: string, reason?: string): Promise<Proposal | null> => {
    try {
      const updatedProposal = await proposalsAPI.proposals.reject(id, reason);
      setProposals(prev => prev.map(proposal => proposal.id === id ? updatedProposal : proposal));
      return updatedProposal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject proposal');
      console.error('Error rejecting proposal:', err);
      return null;
    }
  };

  const downloadProposalPDF = async (id: string) => {
    try {
      const blob = await proposalsAPI.proposals.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const proposal = proposals.find(p => p.id === id);
      a.download = `proposal_${proposal?.proposal_number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download proposal PDF');
      console.error('Error downloading proposal PDF:', err);
    }
  };

  const duplicateProposal = async (id: string): Promise<Proposal | null> => {
    try {
      const duplicatedProposal = await proposalsAPI.proposals.duplicate(id);
      setProposals(prev => [duplicatedProposal, ...prev]);
      return duplicatedProposal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate proposal');
      console.error('Error duplicating proposal:', err);
      return null;
    }
  };

  const getProposalStats = async (): Promise<ProposalStats | null> => {
    try {
      return await proposalsAPI.proposals.getStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get proposal stats');
      console.error('Error getting proposal stats:', err);
      return null;
    }
  };

  // Utility functions
  const getProposalById = (id: string): Proposal | undefined => {
    return proposals.find(p => p.id === id);
  };

  useEffect(() => {
    fetchLeads();
    fetchProposals();
  }, []);

  return (
    <ProposalsContext.Provider
      value={{
        // Lead management
        leads,
        loading,
        error,
        pagination,
        fetchLeads,
        createLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        assignLead,
        convertLeadToClient,
        getLeadStats,
        exportLeads,
        
        // Proposal management
        proposals,
        fetchProposals,
        createProposal,
        updateProposal,
        deleteProposal,
        sendProposal,
        acceptProposal,
        rejectProposal,
        downloadProposalPDF,
        duplicateProposal,
        getProposalStats,
        getProposalById,
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
