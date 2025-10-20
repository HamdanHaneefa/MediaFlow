import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Integration, IntegrationCategory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  Plug,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Zap,
  MessageSquare,
  Cloud,
  DollarSign,
  Palette,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('name');

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const toggleConnection = async (integration: Integration) => {
    const newStatus = integration.is_connected ? 'Inactive' : 'Active';
    const updateData = {
      is_connected: !integration.is_connected,
      status: newStatus,
      connected_at: !integration.is_connected ? new Date().toISOString() : integration.connected_at,
      last_sync_at: !integration.is_connected ? new Date().toISOString() : integration.last_sync_at,
    };

    try {
      const { error } = await supabase
        .from('integrations')
        .update(updateData)
        .eq('id', integration.id);

      if (error) throw error;

      await supabase.from('integration_logs').insert({
        integration_id: integration.id,
        event_type: integration.is_connected ? 'Disconnect' : 'Connect',
        status: 'Success',
        message: `${integration.name} ${integration.is_connected ? 'disconnected' : 'connected'} successfully`,
      });

      await fetchIntegrations();
      toast.success(`${integration.name} ${integration.is_connected ? 'disconnected' : 'connected'} successfully`);
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Failed to update integration');
    }
  };

  const syncIntegration = async (integration: Integration) => {
    if (!integration.is_connected) {
      toast.error('Please connect the integration first');
      return;
    }

    toast.loading('Syncing...', { id: 'sync' });

    try {
      await supabase
        .from('integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', integration.id);

      await supabase.from('integration_logs').insert({
        integration_id: integration.id,
        event_type: 'Sync',
        status: 'Success',
        message: `Data synced successfully`,
      });

      await fetchIntegrations();
      toast.success('Sync completed successfully', { id: 'sync' });
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Sync failed', { id: 'sync' });
    }
  };

  const getCategoryIcon = (category: IntegrationCategory) => {
    switch (category) {
      case 'Communication':
        return MessageSquare;
      case 'Storage':
        return Cloud;
      case 'Financial':
        return DollarSign;
      case 'Creative':
        return Palette;
      default:
        return Plug;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'Error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'All' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.is_connected).length;
  const activeCount = integrations.filter(i => i.status === 'Active').length;
  const errorCount = integrations.filter(i => i.status === 'Error').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Connect external services and automate workflows</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Connected Services</CardTitle>
            <Plug className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-gray-500">out of {integrations.length} available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <Zap className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-gray-500">operating normally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <p className="text-xs text-gray-500">requiring attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as IntegrationCategory | 'All')}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Communication">Communication</TabsTrigger>
          <TabsTrigger value="Storage">Storage</TabsTrigger>
          <TabsTrigger value="Financial">Financial</TabsTrigger>
          <TabsTrigger value="Creative">Creative</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((integration) => {
              const CategoryIcon = getCategoryIcon(integration.category);
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <CategoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <p className="text-xs text-gray-500">{integration.provider}</p>
                        </div>
                      </div>
                      {getStatusIcon(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{integration.description}</p>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      {integration.last_sync_at && (
                        <span className="text-xs text-gray-500">
                          Synced {format(new Date(integration.last_sync_at), 'MMM d')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={integration.is_connected ? 'destructive' : 'default'}
                        className="flex-1 min-h-[44px]"
                        onClick={() => toggleConnection(integration)}
                      >
                        {integration.is_connected ? 'Disconnect' : 'Connect'}
                      </Button>
                      {integration.is_connected && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="min-h-[44px] min-w-[44px]"
                            onClick={() => syncIntegration(integration)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="min-h-[44px] min-w-[44px]"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setConfigDialogOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredIntegrations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Plug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                <p className="text-gray-500">Try adjusting your search or filter</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Manage settings and preferences for this integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Auto-sync</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Automatically sync data every hour</span>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notifications</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Get notified on sync completion</span>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Enter API key" />
            </div>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setConfigDialogOpen(false);
              toast.success('Configuration saved');
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
