import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import {
  AssetLibrary,
  AssetVersion,
  AssetShare,
  AssetUsage,
  AssetCollection,
  AssetDownload,
} from '../types';

interface AssetsContextType {
  assets: AssetLibrary[];
  versions: AssetVersion[];
  shares: AssetShare[];
  usage: AssetUsage[];
  collections: AssetCollection[];
  downloads: AssetDownload[];
  loading: boolean;

  fetchAssets: (projectId?: string) => Promise<void>;
  fetchAssetVersions: (assetId: string) => Promise<void>;
  fetchAssetShares: (assetId: string) => Promise<void>;
  fetchAssetUsage: (assetId: string) => Promise<void>;
  fetchCollections: (projectId?: string) => Promise<void>;
  fetchDownloads: (assetId: string) => Promise<void>;

  createAsset: (asset: Omit<AssetLibrary, 'id' | 'created_at' | 'updated_at'>) => Promise<AssetLibrary | null>;
  updateAsset: (id: string, updates: Partial<AssetLibrary>) => Promise<AssetLibrary | null>;
  deleteAsset: (id: string) => Promise<boolean>;

  createVersion: (version: Omit<AssetVersion, 'id' | 'created_at'>) => Promise<AssetVersion | null>;

  createShare: (share: Omit<AssetShare, 'id' | 'created_at' | 'share_link' | 'download_count'>) => Promise<AssetShare | null>;
  updateShare: (id: string, updates: Partial<AssetShare>) => Promise<AssetShare | null>;
  deleteShare: (id: string) => Promise<boolean>;

  trackUsage: (usage: Omit<AssetUsage, 'id' | 'created_at'>) => Promise<AssetUsage | null>;

  createCollection: (collection: Omit<AssetCollection, 'id' | 'created_at' | 'updated_at'>) => Promise<AssetCollection | null>;
  updateCollection: (id: string, updates: Partial<AssetCollection>) => Promise<AssetCollection | null>;
  deleteCollection: (id: string) => Promise<boolean>;
  addToCollection: (collectionId: string, assetId: string, sortOrder?: number) => Promise<boolean>;
  removeFromCollection: (collectionId: string, assetId: string) => Promise<boolean>;

  trackDownload: (download: Omit<AssetDownload, 'id' | 'created_at'>) => Promise<AssetDownload | null>;
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined);

export const AssetsProvider = ({ children }: { children: ReactNode }) => {
  const [assets, setAssets] = useState<AssetLibrary[]>([]);
  const [versions, setVersions] = useState<AssetVersion[]>([]);
  const [shares, setShares] = useState<AssetShare[]>([]);
  const [usage, setUsage] = useState<AssetUsage[]>([]);
  const [collections, setCollections] = useState<AssetCollection[]>([]);
  const [downloads, setDownloads] = useState<AssetDownload[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async (projectId?: string) => {
    setLoading(true);
    try {
      let query = supabase.from('asset_library').select('*').order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetVersions = async (assetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_versions')
        .select('*')
        .eq('asset_id', assetId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching asset versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetShares = async (assetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_shares')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error('Error fetching asset shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetUsage = async (assetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_usage')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsage(data || []);
    } catch (error) {
      console.error('Error fetching asset usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async (projectId?: string) => {
    setLoading(true);
    try {
      let query = supabase.from('asset_collections').select('*').order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloads = async (assetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_downloads')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async (asset: Omit<AssetLibrary, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('asset_library')
        .insert([asset])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setAssets((prev) => [data, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error creating asset:', error);
      return null;
    }
  };

  const updateAsset = async (id: string, updates: Partial<AssetLibrary>) => {
    try {
      const { data, error } = await supabase
        .from('asset_library')
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
      const { error } = await supabase.from('asset_library').delete().eq('id', id);
      if (error) throw error;
      setAssets((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      return false;
    }
  };

  const createVersion = async (version: Omit<AssetVersion, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('asset_versions')
        .insert([version])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setVersions((prev) => [data, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error creating version:', error);
      return null;
    }
  };

  const createShare = async (share: Omit<AssetShare, 'id' | 'created_at' | 'share_link' | 'download_count'>) => {
    try {
      const { data, error } = await supabase
        .from('asset_shares')
        .insert([{ ...share, download_count: 0 }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setShares((prev) => [data, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error creating share:', error);
      return null;
    }
  };

  const updateShare = async (id: string, updates: Partial<AssetShare>) => {
    try {
      const { data, error } = await supabase
        .from('asset_shares')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setShares((prev) => prev.map((s) => (s.id === id ? data : s)));
      }
      return data;
    } catch (error) {
      console.error('Error updating share:', error);
      return null;
    }
  };

  const deleteShare = async (id: string) => {
    try {
      const { error } = await supabase.from('asset_shares').delete().eq('id', id);
      if (error) throw error;
      setShares((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting share:', error);
      return false;
    }
  };

  const trackUsage = async (usage: Omit<AssetUsage, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('asset_usage')
        .insert([usage])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setUsage((prev) => [data, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error tracking usage:', error);
      return null;
    }
  };

  const createCollection = async (collection: Omit<AssetCollection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('asset_collections')
        .insert([collection])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCollections((prev) => [data, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error creating collection:', error);
      return null;
    }
  };

  const updateCollection = async (id: string, updates: Partial<AssetCollection>) => {
    try {
      const { data, error } = await supabase
        .from('asset_collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setCollections((prev) => prev.map((c) => (c.id === id ? data : c)));
      }
      return data;
    } catch (error) {
      console.error('Error updating collection:', error);
      return null;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      const { error } = await supabase.from('asset_collections').delete().eq('id', id);
      if (error) throw error;
      setCollections((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  };

  const addToCollection = async (collectionId: string, assetId: string, sortOrder = 0) => {
    try {
      const { error } = await supabase
        .from('asset_collection_items')
        .insert([{ collection_id: collectionId, asset_id: assetId, sort_order: sortOrder }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding to collection:', error);
      return false;
    }
  };

  const removeFromCollection = async (collectionId: string, assetId: string) => {
    try {
      const { error } = await supabase
        .from('asset_collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('asset_id', assetId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from collection:', error);
      return false;
    }
  };

  const trackDownload = async (download: Omit<AssetDownload, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('asset_downloads')
        .insert([download])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setDownloads((prev) => [data, ...prev]);
      }
      return data;
    } catch (error) {
      console.error('Error tracking download:', error);
      return null;
    }
  };

  return (
    <AssetsContext.Provider
      value={{
        assets,
        versions,
        shares,
        usage,
        collections,
        downloads,
        loading,
        fetchAssets,
        fetchAssetVersions,
        fetchAssetShares,
        fetchAssetUsage,
        fetchCollections,
        fetchDownloads,
        createAsset,
        updateAsset,
        deleteAsset,
        createVersion,
        createShare,
        updateShare,
        deleteShare,
        trackUsage,
        createCollection,
        updateCollection,
        deleteCollection,
        addToCollection,
        removeFromCollection,
        trackDownload,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error('useAssets must be used within AssetsProvider');
  }
  return context;
};
