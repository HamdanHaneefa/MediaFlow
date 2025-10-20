import { useState, useEffect } from 'react';
import { useAssets } from '../contexts/AssetsContext';
import { useProjects } from '../contexts/ProjectsContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Upload,
  Grid3x3,
  List,
  Search,
  Filter,
  Download,
  Share2,
  Trash2,
  MoreVertical,
  FileText,
  Image,
  Video,
  Music,
  File,
  Eye,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { format } from 'date-fns';
import { AssetLibrary } from '../types';
import { toast } from 'sonner';

export default function Assets() {
  const { assets, fetchAssets, deleteAsset, trackDownload } = useAssets();
  const { projects } = useProjects();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [selectedStatus] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetLibrary | null>(null);

  useEffect(() => {
    if (selectedProject === 'all') {
      fetchAssets();
    } else {
      fetchAssets(selectedProject);
    }
  }, [selectedProject]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesFileType = selectedFileType === 'all' || asset.file_type === selectedFileType;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesFileType && matchesStatus;
  });

  const handleDownload = async (asset: AssetLibrary) => {
    await trackDownload({
      asset_id: asset.id,
      download_type: 'Direct',
    });
    toast.success(`Downloading ${asset.name}`);
  };

  const handleDelete = async (assetId: string) => {
    const success = await deleteAsset(assetId);
    if (success) {
      toast.success('Asset deleted successfully');
    } else {
      toast.error('Failed to delete asset');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'Video':
        return <Video className="h-5 w-5" />;
      case 'Image':
        return <Image className="h-5 w-5" />;
      case 'Audio':
        return <Music className="h-5 w-5" />;
      case 'Document':
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'In Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Draft':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Archived':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 truncate">Asset Library</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage and organize your media files</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} size="sm" className="min-h-[44px] shrink-0">
          <Upload className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Upload Assets</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Raw Footage">Raw Footage</SelectItem>
            <SelectItem value="Graphics">Graphics</SelectItem>
            <SelectItem value="Audio">Audio</SelectItem>
            <SelectItem value="Final Exports">Final Exports</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedFileType} onValueChange={setSelectedFileType}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Video">Video</SelectItem>
            <SelectItem value="Image">Image</SelectItem>
            <SelectItem value="Audio">Audio</SelectItem>
            <SelectItem value="Document">Document</SelectItem>
            <SelectItem value="Graphics">Graphics</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{filteredAssets.length} assets found</span>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Active filters: {[selectedProject !== 'all', selectedCategory !== 'all', selectedFileType !== 'all', selectedStatus !== 'all'].filter(Boolean).length}</span>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-500 mb-6">Upload your first asset or adjust your filters</p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Assets
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  {asset.thumbnail_url ? (
                    <img
                      src={asset.thumbnail_url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(asset.file_type)}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(asset)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(asset.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {asset.file_type}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate mb-1">{asset.name}</h3>
                  <p className="text-sm text-gray-500 truncate mb-3">{asset.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(asset.file_size)}</span>
                    <span>v{asset.version}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={getStatusColor(asset.status)} variant="outline">
                      {asset.status}
                    </Badge>
                    {asset.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map((asset) => {
            const project = projects.find(p => p.id === asset.project_id);
            return (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                      {asset.thumbnail_url ? (
                        <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        getFileIcon(asset.file_type)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{asset.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{asset.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(asset)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(asset.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          {getFileIcon(asset.file_type)}
                          <span>{asset.file_format}</span>
                        </div>
                        <span>{formatFileSize(asset.file_size)}</span>
                        <span>{asset.category}</span>
                        {project && <span>{project.title}</span>}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(asset.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(asset.status)} variant="outline">
                          {asset.status}
                        </Badge>
                        <span className="text-xs text-gray-500">v{asset.version}</span>
                        {asset.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Assets</DialogTitle>
            <DialogDescription>Upload media files to your asset library (demo mode)</DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">Drag and drop files here</p>
            <p className="text-xs text-gray-500 mb-4">or</p>
            <Button variant="outline">Browse Files</Button>
            <p className="text-xs text-gray-400 mt-4">Supports video, images, audio, and documents</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedAsset !== null} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAsset?.name}</DialogTitle>
            <DialogDescription>{selectedAsset?.description}</DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              {selectedAsset.thumbnail_url && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={selectedAsset.thumbnail_url} alt={selectedAsset.name} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">File Type</p>
                  <p className="font-medium">{selectedAsset.file_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Format</p>
                  <p className="font-medium">{selectedAsset.file_format || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-medium">{formatFileSize(selectedAsset.file_size)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="font-medium">v{selectedAsset.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedAsset.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedAsset.status)}>{selectedAsset.status}</Badge>
                </div>
              </div>
              {selectedAsset.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAsset.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
