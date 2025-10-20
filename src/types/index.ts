export type ContactRole = 'Client' | 'Vendor' | 'Freelancer' | 'Partner';
export type ContactStatus = 'Active' | 'Inactive' | 'Prospect';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: ContactRole;
  status: ContactStatus;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type ProjectType =
  | 'Commercial'
  | 'Documentary'
  | 'Music Video'
  | 'Corporate'
  | 'Short Film'
  | 'Event Coverage'
  | 'Social Media';

export type ProjectStatus = 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export type ProjectPhase =
  | 'Pre-production'
  | 'Production'
  | 'Post-production'
  | 'Delivered';

export interface Project {
  id: string;
  title: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  phase: ProjectPhase;
  client_id?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  team_members: string[];
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskType = 'Creative' | 'Technical' | 'Administrative';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project_id?: string;
  assigned_to?: string;
  due_date?: string;
  priority: TaskPriority;
  type: TaskType;
  created_at: string;
  updated_at: string;
}

export type EventType = 'Shoot' | 'Meeting' | 'Deadline' | 'Milestone' | 'Delivery';
export type EventStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_time: string;
  end_time: string;
  project_id?: string;
  location_id?: string;
  attendees: string[];
  equipment_needed: string[];
  status: EventStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type EquipmentCategory = 'Camera' | 'Lighting' | 'Audio' | 'Grip' | 'Post-Production';
export type EquipmentStatus = 'Available' | 'In Use' | 'Maintenance' | 'Retired';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  description?: string;
  status: EquipmentStatus;
  daily_rate?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type LocationType = 'Studio' | 'Outdoor' | 'Indoor' | 'Remote';
export type LocationStatus = 'Available' | 'Booked' | 'Unavailable';

export interface Location {
  id: string;
  name: string;
  address?: string;
  type: LocationType;
  contact_person?: string;
  capacity?: number;
  amenities: string[];
  hourly_rate?: number;
  notes?: string;
  status: LocationStatus;
  created_at: string;
  updated_at: string;
}

export type CrewAvailabilityStatus = 'Available' | 'Booked' | 'Tentative' | 'Unavailable';

export interface CrewAvailability {
  id: string;
  contact_id: string;
  date: string;
  status: CrewAvailabilityStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'Reserved' | 'In Use' | 'Returned' | 'Cancelled';

export interface EquipmentBooking {
  id: string;
  equipment_id: string;
  event_id?: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AssetFileType = 'Video' | 'Image' | 'Document' | 'Audio' | 'Other';
export type AssetStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Final';

export interface ProjectAsset {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  file_url: string;
  file_type: AssetFileType;
  file_size?: number;
  thumbnail_url?: string;
  version: number;
  parent_asset_id?: string;
  status: AssetStatus;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Changes Requested';

export interface AssetReview {
  id: string;
  asset_id: string;
  project_id: string;
  reviewer_id?: string;
  status: ReviewStatus;
  deadline?: string;
  submitted_at?: string;
  review_link: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type CommentPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type CommentStatus = 'Open' | 'Addressed' | 'Resolved';

export interface ReviewComment {
  id: string;
  review_id: string;
  asset_id: string;
  commenter_id?: string;
  comment_text: string;
  timestamp_marker?: number;
  position_x?: number;
  position_y?: number;
  priority: CommentPriority;
  status: CommentStatus;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
}

export type MessageType = 'Message' | 'System Update' | 'Milestone' | 'Approval Request';

export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id?: string;
  recipient_id?: string;
  message_text: string;
  attachments: { url: string; name: string; size?: number }[];
  is_read: boolean;
  read_at?: string;
  message_type: MessageType;
  created_at: string;
}

export type ApprovalAction = 'Submitted' | 'Approved' | 'Rejected' | 'Changes Requested' | 'Resubmitted';

export interface ApprovalHistory {
  id: string;
  asset_id: string;
  review_id?: string;
  action: ApprovalAction;
  performed_by?: string;
  feedback?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type NotificationFrequency = 'Immediate' | 'Daily Digest' | 'Weekly Digest';

export interface ClientPreferences {
  id: string;
  contact_id: string;
  notification_email: boolean;
  notification_frequency: NotificationFrequency;
  brand_color: string;
  logo_url?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type AssetLibraryFileType = 'Video' | 'Image' | 'Audio' | 'Document' | 'Graphics' | 'Raw' | 'Other';
export type AssetLibraryCategory = 'Raw Footage' | 'Graphics' | 'Audio' | 'Final Exports' | 'Other';
export type AssetLibraryStatus = 'Draft' | 'In Review' | 'Approved' | 'Archived' | 'Deleted';

export interface AssetLibrary {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  file_url: string;
  file_type: AssetLibraryFileType;
  file_format?: string;
  file_size?: number;
  thumbnail_url?: string;
  category: AssetLibraryCategory;
  tags: string[];
  metadata: Record<string, unknown>;
  version: number;
  parent_asset_id?: string;
  status: AssetLibraryStatus;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetVersion {
  id: string;
  asset_id: string;
  version_number: number;
  file_url: string;
  file_size?: number;
  changes_description?: string;
  created_by?: string;
  created_at: string;
}

export type ShareAccessLevel = 'View Only' | 'Download' | 'Edit';

export interface AssetShare {
  id: string;
  asset_id: string;
  share_link: string;
  recipient_email?: string;
  recipient_name?: string;
  access_level: ShareAccessLevel;
  password_protected: boolean;
  password_hash?: string;
  expires_at?: string;
  download_count: number;
  last_accessed_at?: string;
  watermark_enabled: boolean;
  created_by?: string;
  created_at: string;
}

export type AssetUsageType = 'Project' | 'Task' | 'Event' | 'Export' | 'Review';

export interface AssetUsage {
  id: string;
  asset_id: string;
  project_id?: string;
  task_id?: string;
  usage_type: AssetUsageType;
  usage_context?: string;
  created_at: string;
}

export interface AssetCollection {
  id: string;
  name: string;
  description?: string;
  project_id?: string;
  created_by?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssetCollectionItem {
  id: string;
  collection_id: string;
  asset_id: string;
  sort_order: number;
  added_at: string;
}

export type DownloadType = 'Direct' | 'Share Link' | 'Export';

export interface AssetDownload {
  id: string;
  asset_id: string;
  downloaded_by?: string;
  ip_address?: string;
  user_agent?: string;
  download_type: DownloadType;
  created_at: string;
}

export type IntegrationCategory = 'Communication' | 'Storage' | 'Financial' | 'Creative' | 'Other';
export type IntegrationStatus = 'Active' | 'Inactive' | 'Error' | 'Pending';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: string;
  description?: string;
  icon_url?: string;
  is_connected: boolean;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  connected_at?: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export type IntegrationEventType = 'Sync' | 'Error' | 'Config' | 'Connect' | 'Disconnect';
export type IntegrationLogStatus = 'Success' | 'Failed' | 'Warning';

export interface IntegrationLog {
  id: string;
  integration_id: string;
  event_type: IntegrationEventType;
  status: IntegrationLogStatus;
  message?: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface IntegrationWebhook {
  id: string;
  integration_id: string;
  event_types: string[];
  url: string;
  secret?: string;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

export type DataSyncType = 'Import' | 'Export' | 'Bidirectional';
export type DataSyncStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';
export type DataSyncEntityType = 'Contact' | 'Project' | 'Event' | 'Asset';

export interface DataSyncQueue {
  id: string;
  integration_id: string;
  sync_type: DataSyncType;
  entity_type: DataSyncEntityType;
  entity_id?: string;
  status: DataSyncStatus;
  retry_count: number;
  error_message?: string;
  synced_at?: string;
  created_at: string;
}
