import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import {
  ProjectAsset,
  AssetReview,
  ReviewComment,
  ProjectMessage,
  ApprovalHistory,
  ClientPreferences,
} from '../types';

interface ClientPortalContextType {
  assets: ProjectAsset[];
  reviews: AssetReview[];
  comments: ReviewComment[];
  messages: ProjectMessage[];
  approvalHistory: ApprovalHistory[];
  clientPreferences: ClientPreferences | null;
  loading: boolean;

  fetchAssetsByProject: (projectId: string) => Promise<void>;
  fetchReviewsByProject: (projectId: string) => Promise<void>;
  fetchCommentsByReview: (reviewId: string) => Promise<void>;
  fetchMessagesByProject: (projectId: string) => Promise<void>;
  fetchApprovalHistory: (assetId: string) => Promise<void>;
  fetchClientPreferences: (contactId: string) => Promise<void>;

  createAsset: (asset: Omit<ProjectAsset, 'id' | 'created_at' | 'updated_at'>) => Promise<ProjectAsset | null>;
  updateAsset: (id: string, updates: Partial<ProjectAsset>) => Promise<ProjectAsset | null>;
  deleteAsset: (id: string) => Promise<boolean>;

  createReview: (review: Omit<AssetReview, 'id' | 'created_at' | 'updated_at' | 'review_link'>) => Promise<AssetReview | null>;
  updateReview: (id: string, updates: Partial<AssetReview>) => Promise<AssetReview | null>;
  submitReview: (reviewId: string, status: 'Approved' | 'Rejected' | 'Changes Requested', feedback?: string) => Promise<boolean>;

  createComment: (comment: Omit<ReviewComment, 'id' | 'created_at' | 'updated_at'>) => Promise<ReviewComment | null>;
  updateComment: (id: string, updates: Partial<ReviewComment>) => Promise<ReviewComment | null>;
  deleteComment: (id: string) => Promise<boolean>;

  sendMessage: (message: Omit<ProjectMessage, 'id' | 'created_at'>) => Promise<ProjectMessage | null>;
  markMessageAsRead: (id: string) => Promise<boolean>;

  updateClientPreferences: (contactId: string, preferences: Partial<ClientPreferences>) => Promise<ClientPreferences | null>;
}

const ClientPortalContext = createContext<ClientPortalContextType | undefined>(undefined);

export const ClientPortalProvider = ({ children }: { children: ReactNode }) => {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [reviews, setReviews] = useState<AssetReview[]>([]);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [clientPreferences, setClientPreferences] = useState<ClientPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssetsByProject = async (projectId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsByProject = async (projectId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_reviews')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsByReview = async (reviewId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('review_comments')
        .select('*')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesByProject = async (projectId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async (assetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovalHistory(data || []);
    } catch (error) {
      console.error('Error fetching approval history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientPreferences = async (contactId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_preferences')
        .select('*')
        .eq('contact_id', contactId)
        .maybeSingle();

      if (error) throw error;
      setClientPreferences(data);
    } catch (error) {
      console.error('Error fetching client preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async (asset: Omit<ProjectAsset, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_assets')
        .insert([asset])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setAssets((prev) => [data, ...prev]);

        await supabase.from('approval_history').insert([{
          asset_id: data.id,
          action: 'Submitted',
          performed_by: asset.uploaded_by,
          feedback: 'Asset uploaded',
        }]);
      }
      return data;
    } catch (error) {
      console.error('Error creating asset:', error);
      return null;
    }
  };

  const updateAsset = async (id: string, updates: Partial<ProjectAsset>) => {
    try {
      const { data, error } = await supabase
        .from('project_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setAssets((prev) => prev.map((a) => (a.id === id ? data : a)));
      }
      return data;
    } catch (error) {
      console.error('Error updating asset:', error);
      return null;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase.from('project_assets').delete().eq('id', id);
      if (error) throw error;
      setAssets((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      return false;
    }
  };

  const createReview = async (review: Omit<AssetReview, 'id' | 'created_at' | 'updated_at' | 'review_link'>) => {
    try {
      const { data, error } = await supabase
        .from('asset_reviews')
        .insert([review])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setReviews((prev) => [data, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      return null;
    }
  };

  const updateReview = async (id: string, updates: Partial<AssetReview>) => {
    try {
      const { data, error } = await supabase
        .from('asset_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setReviews((prev) => prev.map((r) => (r.id === id ? data : r)));
      }
      return data;
    } catch (error) {
      console.error('Error updating review:', error);
      return null;
    }
  };

  const submitReview = async (
    reviewId: string,
    status: 'Approved' | 'Rejected' | 'Changes Requested',
    feedback?: string
  ) => {
    try {
      const review = reviews.find((r) => r.id === reviewId);
      if (!review) return false;

      const { data: updatedReview, error: reviewError } = await supabase
        .from('asset_reviews')
        .update({
          status,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (reviewError) throw reviewError;

      const assetStatus = status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Pending Review';
      await supabase
        .from('project_assets')
        .update({ status: assetStatus })
        .eq('id', review.asset_id);

      await supabase.from('approval_history').insert([{
        asset_id: review.asset_id,
        review_id: reviewId,
        action: status,
        performed_by: review.reviewer_id,
        feedback: feedback || '',
      }]);

      if (updatedReview) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? updatedReview : r)));
      }

      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      return false;
    }
  };

  const createComment = async (comment: Omit<ReviewComment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('review_comments')
        .insert([comment])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setComments((prev) => [...prev, data]);
      }
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  };

  const updateComment = async (id: string, updates: Partial<ReviewComment>) => {
    try {
      const { data, error } = await supabase
        .from('review_comments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setComments((prev) => prev.map((c) => (c.id === id ? data : c)));
      }
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      return null;
    }
  };

  const deleteComment = async (id: string) => {
    try {
      const { error } = await supabase.from('review_comments').delete().eq('id', id);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  };

  const sendMessage = async (message: Omit<ProjectMessage, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setMessages((prev) => [data, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const markMessageAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true, read_at: new Date().toISOString() } : m))
      );
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };

  const updateClientPreferences = async (contactId: string, preferences: Partial<ClientPreferences>) => {
    try {
      const { data: existing } = await supabase
        .from('client_preferences')
        .select('*')
        .eq('contact_id', contactId)
        .maybeSingle();

      let data;
      if (existing) {
        const { data: updated, error } = await supabase
          .from('client_preferences')
          .update(preferences)
          .eq('contact_id', contactId)
          .select()
          .single();
        if (error) throw error;
        data = updated;
      } else {
        const { data: created, error } = await supabase
          .from('client_preferences')
          .insert([{ contact_id: contactId, ...preferences }])
          .select()
          .single();
        if (error) throw error;
        data = created;
      }

      if (data) {
        setClientPreferences(data);
      }
      return data;
    } catch (error) {
      console.error('Error updating client preferences:', error);
      return null;
    }
  };

  return (
    <ClientPortalContext.Provider
      value={{
        assets,
        reviews,
        comments,
        messages,
        approvalHistory,
        clientPreferences,
        loading,
        fetchAssetsByProject,
        fetchReviewsByProject,
        fetchCommentsByReview,
        fetchMessagesByProject,
        fetchApprovalHistory,
        fetchClientPreferences,
        createAsset,
        updateAsset,
        deleteAsset,
        createReview,
        updateReview,
        submitReview,
        createComment,
        updateComment,
        deleteComment,
        sendMessage,
        markMessageAsRead,
        updateClientPreferences,
      }}
    >
      {children}
    </ClientPortalContext.Provider>
  );
};

export const useClientPortal = () => {
  const context = useContext(ClientPortalContext);
  if (!context) {
    throw new Error('useClientPortal must be used within ClientPortalProvider');
  }
  return context;
};
