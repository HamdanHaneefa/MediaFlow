import { useState, useEffect } from 'react';
import { useClientPortal } from '../../contexts/ClientPortalContext';
import { useContacts } from '../../contexts/ContactsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  MessageSquare,
  Clock,
  FileText,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ReviewApprovalViewProps {
  projectId: string;
}

export function ReviewApprovalView({ projectId }: ReviewApprovalViewProps) {
  const {
    assets,
    reviews,
    comments,
    approvalHistory,
    fetchAssetsByProject,
    fetchReviewsByProject,
    fetchCommentsByReview,
    fetchApprovalHistory,
    createComment,
    submitReview,
  } = useClientPortal();
  const { contacts } = useContacts();

  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'Approved' | 'Rejected' | 'Changes Requested'>('Approved');
  const [feedback, setFeedback] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentPriority, setCommentPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchAssetsByProject(projectId);
    fetchReviewsByProject(projectId);
  }, [projectId]);

  const projectAssets = assets.filter((a) => a.project_id === projectId);
  const projectReviews = reviews.filter((r) => r.project_id === projectId);

  const currentReview = selectedReview ? projectReviews.find((r) => r.id === selectedReview) : null;
  const currentAsset = currentReview ? projectAssets.find((a) => a.id === currentReview.asset_id) : null;
  const reviewComments = currentReview ? comments.filter((c) => c.review_id === currentReview.id) : [];

  useEffect(() => {
    if (currentReview) {
      fetchCommentsByReview(currentReview.id);
    }
    if (currentAsset) {
      fetchApprovalHistory(currentAsset.id);
    }
  }, [currentReview?.id, currentAsset?.id]);

  const filteredReviews = projectReviews.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentReview || !currentAsset) return;

    const comment = await createComment({
      review_id: currentReview.id,
      asset_id: currentAsset.id,
      commenter_id: undefined,
      comment_text: newComment,
      priority: commentPriority,
      status: 'Open',
    });

    if (comment) {
      setNewComment('');
      setCommentPriority('Medium');
      toast.success('Comment added successfully');
    }
  };

  const handleSubmitReview = async () => {
    if (!currentReview) return;

    const success = await submitReview(currentReview.id, approvalAction, feedback);

    if (success) {
      toast.success(`Review ${approvalAction.toLowerCase()} successfully`);
      setShowApprovalDialog(false);
      setSelectedReview(null);
      setFeedback('');
      fetchReviewsByProject(projectId);
      fetchAssetsByProject(projectId);
    } else {
      toast.error('Failed to submit review');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Changes Requested':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Changes Requested':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'In Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Reviews & Approvals</h2>
          <p className="text-gray-600 mt-1">Review and approve project deliverables</p>
        </div>
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
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredReviews.map((review) => {
          const asset = projectAssets.find((a) => a.id === review.asset_id);
          if (!asset) return null;

          return (
            <Card key={review.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReview(review.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <CardDescription className="mt-1">{asset.description}</CardDescription>
                  </div>
                  {getStatusIcon(review.status)}
                </div>
              </CardHeader>
              <CardContent>
                {asset.thumbnail_url ? (
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <Badge variant="outline">{asset.file_type}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Version:</span>
                    <span className="font-medium">v{asset.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                  </div>
                  {review.deadline && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="font-medium">{format(new Date(review.deadline), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={selectedReview !== null} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{currentAsset?.name}</DialogTitle>
            <DialogDescription>{currentAsset?.description}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preview" className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="comments">
                Comments
                {reviewComments.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {reviewComments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {currentAsset?.file_url && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {currentAsset.file_type === 'Image' ? (
                      <img src={currentAsset.file_url} alt={currentAsset.name} className="w-full h-full object-contain" />
                    ) : currentAsset.file_type === 'Video' ? (
                      <video src={currentAsset.file_url} controls className="w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Preview not available</p>
                          <Button size="sm" className="mt-4" asChild>
                            <a href={currentAsset.file_url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download File
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">File Type</p>
                    <p className="font-medium">{currentAsset?.file_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium">v{currentAsset?.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getStatusColor(currentReview?.status || '')}>{currentReview?.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Uploaded</p>
                    <p className="font-medium">
                      {currentAsset && format(new Date(currentAsset.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="flex-1 overflow-y-auto">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {reviewComments.map((comment) => {
                    const commenter = comment.commenter_id ? contacts.find((c) => c.id === comment.commenter_id) : null;
                    return (
                      <div key={comment.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{commenter?.name || 'Client'}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={comment.priority === 'Critical' ? 'destructive' : 'outline'}>
                              {comment.priority}
                            </Badge>
                            <Badge variant={comment.status === 'Resolved' ? 'secondary' : 'default'}>
                              {comment.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment_text}</p>
                      </div>
                    );
                  })}

                  {reviewComments.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No comments yet</p>
                  )}
                </div>
              </ScrollArea>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label>Add Comment</Label>
                <Textarea
                  placeholder="Share your feedback..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <Select value={commentPriority} onValueChange={(value: any) => setCommentPriority(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {approvalHistory.map((entry) => {
                    const performer = entry.performed_by ? contacts.find((c) => c.id === entry.performed_by) : null;
                    return (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full bg-gray-100 p-2">
                            <History className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="w-px bg-gray-200 flex-1 mt-2" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{entry.action}</p>
                            <Badge variant="outline">{format(new Date(entry.created_at), 'MMM d, h:mm a')}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">By {performer?.name || 'Client'}</p>
                          {entry.feedback && (
                            <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">{entry.feedback}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {approvalHistory.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No history available</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {currentReview && (currentReview.status === 'Pending' || currentReview.status === 'In Review') && (
            <DialogFooter className="flex-shrink-0">
              <Button variant="outline" onClick={() => setSelectedReview(null)}>
                Close
              </Button>
              <Button onClick={() => setShowApprovalDialog(true)}>
                Submit Review
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Review</DialogTitle>
            <DialogDescription>Provide your feedback and approval decision</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Decision</Label>
              <Select value={approvalAction} onValueChange={(value: any) => setApprovalAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Approve
                    </div>
                  </SelectItem>
                  <SelectItem value="Changes Requested">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Request Changes
                    </div>
                  </SelectItem>
                  <SelectItem value="Rejected">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Reject
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Feedback {approvalAction !== 'Approved' && '(Required)'}</Label>
              <Textarea
                placeholder="Provide detailed feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={approvalAction !== 'Approved' && !feedback.trim()}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
