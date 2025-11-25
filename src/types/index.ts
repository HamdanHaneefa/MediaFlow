export type ContactRole = 'Client' | 'Vendor' | 'Freelancer' | 'Partner';
export type ContactStatus = 'Active' | 'Inactive' | 'Prospect';

// Team Management Types
export type TeamRole = 'Owner' | 'Manager' | 'Producer' | 'Director' | 'Editor' | 'Camera Operator' | 'Audio Engineer' | 'Assistant' | 'Freelancer';
export type TeamMemberStatus = 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
export type PermissionLevel = 'Full Access' | 'Limited Access' | 'View Only';

export interface TeamMember {
  id: string;
  user_id?: string; // Reference to auth user if applicable
  team_id?: string; // Reference to team if member belongs to a team
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  permissions: {
    can_manage_projects: boolean;
    can_send_proposals: boolean;
    can_approve_expenses: boolean;
    can_manage_team: boolean;
    can_view_financials: boolean;
    can_manage_assets: boolean;
    can_access_client_portal: boolean;
  };
  hourly_rate?: number;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  bio?: string;
  hire_date: string;
  assigned_projects: string[];
  performance_metrics?: {
    tasks_completed: number;
    projects_managed: number;
    proposals_sent: number;
    expenses_entered: number;
    avg_task_completion_time: number;
    client_satisfaction_rating: number;
  };
  invitation_status?: 'Pending' | 'Accepted' | 'Declined';
  invited_at?: string;
  invited_by?: string;
  last_active?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: TeamRole;
  permissions: TeamMember['permissions'];
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  team_member_id: string;
  role_in_project: string;
  assigned_at: string;
  assigned_by: string;
  is_lead: boolean;
  responsibilities: string[];
  hourly_rate_override?: number;
}

// Team Group Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id: string;
  member_ids: string[];
  project_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamProjectAssignment {
  id: string;
  team_id: string;
  project_id: string;
  assigned_at: string;
  assigned_by: string;
}

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

// Accounting Types
export type ExpenseCategory = 
  | 'Equipment Rental'
  | 'Location'
  | 'Travel'
  | 'Catering'
  | 'Crew'
  | 'Post Production'
  | 'Marketing'
  | 'Office Supplies'
  | 'Utilities'
  | 'Insurance'
  | 'Legal'
  | 'Other';

export type ExpenseStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid' | 'Reimbursed';

export interface Expense {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  receipt_url?: string;
  receipt_filename?: string;
  vendor?: string;
  status: ExpenseStatus;
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export type IncomeType = 'Project Payment' | 'Deposit' | 'Final Payment' | 'Additional Services' | 'Other';
export type IncomeStatus = 'Expected' | 'Received' | 'Overdue' | 'Cancelled';

export interface Income {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  amount: number;
  income_type: IncomeType;
  expected_date?: string;
  received_date?: string;
  status: IncomeStatus;
  invoice_number?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'Income' | 'Expense' | 'Transfer';
export type TransactionStatus = 'Pending' | 'Reconciled' | 'Failed';

export interface FinancialTransaction {
  id: string;
  project_id?: string;
  type: TransactionType;
  income_id?: string;
  expense_id?: string;
  amount: number;
  description: string;
  transaction_date: string;
  status: TransactionStatus;
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseApprovalRule {
  id: string;
  category?: ExpenseCategory;
  amount_threshold?: number;
  approver_id: string;
  require_receipt: boolean;
  auto_approve: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectFinancialSummary {
  project_id: string;
  total_income: number;
  total_expenses: number;
  net_profit: number;
  pending_expenses: number;
  pending_income: number;
  expense_by_category: Record<ExpenseCategory, number>;
}

// Lead Types
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiating' | 'Won' | 'Lost' | 'Converted';
export type LeadSource = 'Website' | 'Referral' | 'Cold Outreach' | 'Social Media' | 'Event' | 'Partner' | 'Other';
export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Hot';

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  estimated_value?: number;
  estimated_close_date?: string;
  notes?: string;
  tags: string[];
  assigned_to?: string;
  contact_date?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

// Proposal Types
export type ProposalStatus = 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled';
export type ProposalType = 'Standard' | 'Custom' | 'Quick Quote' | 'Retainer' | 'Package Deal';

export interface Proposal {
  id: string;
  title: string;
  description?: string;
  proposal_number: string;
  status: ProposalStatus;
  type: ProposalType;
  lead_id?: string;
  project_id?: string;
  client_id?: string;
  amount: number;
  currency: string;
  valid_until?: string;
  sent_date?: string;
  viewed_date?: string;
  accepted_date?: string;
  rejected_date?: string;
  rejection_reason?: string;
  terms?: string;
  notes?: string;
  created_by?: string;
  assigned_team_members: string[];
  document_url?: string;
  version: number;
  parent_proposal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalItem {
  id: string;
  proposal_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
  created_at: string;
}

export interface ProposalRevision {
  id: string;
  proposal_id: string;
  version: number;
  changes_summary: string;
  created_by?: string;
  document_url?: string;
  created_at: string;
}

export type ProposalActivityType = 'Created' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Revised' | 'Expired' | 'Cancelled';

export interface ProposalActivity {
  id: string;
  proposal_id: string;
  activity_type: ProposalActivityType;
  description: string;
  performed_by?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProposalSignature {
  id: string;
  proposal_id: string;
  signer_name: string;
  signer_email: string;
  signature_data: string;
  signed_at: string;
  ip_address?: string;
}
