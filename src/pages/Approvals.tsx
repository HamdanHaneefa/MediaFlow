import { useState, useEffect } from 'react';
import { useClientPortal } from '../contexts/ClientPortalContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useContacts } from '../contexts/ContactsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Send,
  Eye,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function Approvals() {
  const {
    assets,
    reviews,
    createAsset,
    createReview,
    fetchAssetsByProject,
    fetchReviewsByProject,
  } = useClientPortal();
  const { projects } = useProjects();
  const { contacts } = useContacts();

  const [showNewAssetDialog, setShowNewAssetDialog] = useState(false);
  const [showNewReviewDialog, setShowNewReviewDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    file_url: '',
    file_type: 'Video' as 'Video' | 'Image' | 'Document' | 'Audio' | 'Other',
    project_id: '',
  });

  const [newReview, setNewReview] = useState({
    asset_id: '',
    project_id: '',
    reviewer_id: '',
    deadline: '',
    notes: '',
  });

  useEffect(() => {
    projects.forEach((project) => {
      fetchAssetsByProject(project.id);
      fetchReviewsByProject(project.id);
    });
  }, [projects]);

  const clients = contacts.filter((c) => c.role === 'Client');

  const allReviews = reviews.map((review) => {
    const asset = assets.find((a) => a.id === review.asset_id);
    const project = projects.find((p) => p.id === review.project_id);
    const reviewer = review.reviewer_id ? contacts.find((c) => c.id === review.reviewer_id) : null;

    return {
      ...review,
      asset,
      project,
      reviewer,
      daysUntilDeadline: review.deadline ? differenceInDays(new Date(review.deadline), new Date()) : null,
    };
  });

  const filteredReviews = allReviews.filter((r) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') return r.daysUntilDeadline !== null && r.daysUntilDeadline < 0;
    return r.status === filterStatus;
  });

  const pendingReviews = allReviews.filter((r) => r.status === 'Pending' || r.status === 'In Review');
  const overdueReviews = allReviews.filter((r) => r.daysUntilDeadline !== null && r.daysUntilDeadline < 0 && r.status !== 'Approved');
  const approvedToday = allReviews.filter((r) => {
    if (!r.submitted_at) return false;
    const submitted = new Date(r.submitted_at);
    const today = new Date();
    return submitted.toDateString() === today.toDateString() && r.status === 'Approved';
  });

  const avgResponseTime = allReviews
    .filter((r) => r.submitted_at)
    .reduce((acc, r) => {
      const created = new Date(r.created_at);
      const submitted = new Date(r.submitted_at!);
      return acc + differenceInDays(submitted, created);
    }, 0) / (allReviews.filter((r) => r.submitted_at).length || 1);

  const handleCreateAsset = async () => {
    if (!newAsset.name || !newAsset.file_url || !newAsset.project_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    const asset = await createAsset({
      ...newAsset,
      version: 1,
      status: 'Draft',
      uploaded_by: undefined,
    });

    if (asset) {
      toast.success('Asset created successfully');
      setShowNewAssetDialog(false);
      setNewAsset({
        name: '',
        description: '',
        file_url: '',
        file_type: 'Video',
        project_id: '',
      });
      fetchAssetsByProject(newAsset.project_id);
    }
  };

  const handleCreateReview = async () => {
    if (!newReview.asset_id || !newReview.project_id || !newReview.reviewer_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    const review = await createReview({
      ...newReview,
      status: 'Pending',
      deadline: newReview.deadline || undefined,
    });

    if (review) {
      toast.success('Review request sent successfully');
      setShowNewReviewDialog(false);
      setNewReview({
        asset_id: '',
        project_id: '',
        reviewer_id: '',
        deadline: '',
        notes: '',
      });
      fetchReviewsByProject(newReview.project_id);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'In Review': 'bg-blue-50 text-blue-700 border-blue-200',
      Approved: 'bg-green-50 text-green-700 border-green-200',
      Rejected: 'bg-red-50 text-red-700 border-red-200',
      'Changes Requested': 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return <Badge className={colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Approvals Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage client reviews and asset approvals</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowNewAssetDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Asset
          </Button>
          <Button onClick={() => setShowNewReviewDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            Request Review
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingReviews.length}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting client feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{overdueReviews.length}</div>
            <p className="text-xs text-gray-500 mt-1">Past deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{approvedToday.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {approvedToday.length > 0 ? <TrendingUp className="inline h-3 w-3 text-green-500" /> : null} In last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{avgResponseTime.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">Days to approve</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Reviews</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Changes Requested">Changes Requested</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{review.asset?.name}</p>
                          <p className="text-xs text-gray-500">{review.asset?.file_type} • v{review.asset?.version}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{review.project?.title}</p>
                      <p className="text-xs text-gray-500">{review.project?.type}</p>
                    </TableCell>
                    <TableCell>{review.reviewer?.name || 'Not assigned'}</TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>
                      {review.deadline ? (
                        <div>
                          <p className="text-sm">{format(new Date(review.deadline), 'MMM d, yyyy')}</p>
                          {review.daysUntilDeadline !== null && (
                            <p className={`text-xs ${review.daysUntilDeadline < 0 ? 'text-red-600' : review.daysUntilDeadline < 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                              {review.daysUntilDeadline < 0 ? `${Math.abs(review.daysUntilDeadline)}d overdue` : `${review.daysUntilDeadline}d left`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No deadline</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {review.submitted_at ? (
                        format(new Date(review.submitted_at), 'MMM d, yyyy')
                      ) : (
                        <span className="text-gray-400">Not submitted</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showNewAssetDialog} onOpenChange={setShowNewAssetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Asset</DialogTitle>
            <DialogDescription>Add a new deliverable for client review</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Project *</Label>
              <Select value={newAsset.project_id} onValueChange={(value) => setNewAsset({ ...newAsset, project_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Asset Name *</Label>
              <Input
                placeholder="e.g. Final Cut - Version 1"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the asset..."
                value={newAsset.description}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>File Type *</Label>
              <Select value={newAsset.file_type} onValueChange={(value: any) => setNewAsset({ ...newAsset, file_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>File URL *</Label>
              <Input
                placeholder="https://example.com/file.mp4"
                value={newAsset.file_url}
                onChange={(e) => setNewAsset({ ...newAsset, file_url: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAssetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAsset}>Upload Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewReviewDialog} onOpenChange={setShowNewReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Review</DialogTitle>
            <DialogDescription>Send an asset to a client for approval</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Project *</Label>
              <Select
                value={newReview.project_id}
                onValueChange={(value) => {
                  setNewReview({ ...newReview, project_id: value, asset_id: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Asset *</Label>
              <Select
                value={newReview.asset_id}
                onValueChange={(value) => setNewReview({ ...newReview, asset_id: value })}
                disabled={!newReview.project_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets
                    .filter((a) => a.project_id === newReview.project_id)
                    .map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} (v{asset.version})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Client *</Label>
              <Select
                value={newReview.reviewer_id}
                onValueChange={(value) => setNewReview({ ...newReview, reviewer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={newReview.deadline}
                onChange={(e) => setNewReview({ ...newReview, deadline: e.target.value })}
              />
            </div>

            <div>
              <Label>Internal Notes</Label>
              <Textarea
                placeholder="Add notes for your team..."
                value={newReview.notes}
                onChange={(e) => setNewReview({ ...newReview, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReview}>
              <Send className="h-4 w-4 mr-2" />
              Send Review Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
