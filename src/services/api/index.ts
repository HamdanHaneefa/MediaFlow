// API Services - Central Export
// Import all API services from a single location

export { authAPI, adminApiClient } from './auth';
export { default as contactsAPI } from './contacts';
export { default as projectsAPI } from './projects';
export { default as tasksAPI } from './tasks';
export { default as teamAPI } from './team';
export { default as accountingAPI } from './accounting';
export { default as proposalsAPI } from './proposals';
export { default as analyticsAPI } from './analytics';
export { default as uploadsAPI } from './uploads';
export { default as eventsAPI } from './events';
export { clientAuthAPI, clientApiClient } from './clientAuth';
export { default as clientPortalAPI } from './clientPortal';

// Re-export types
export type { User, LoginCredentials, RegisterData, AuthResponse } from './auth';
export type { Contact, CreateContactData, UpdateContactData, ContactNote, ContactStats } from './contacts';
export type { Project, ProjectMember, CreateProjectData, UpdateProjectData, ProjectStats } from './projects';
export type { Task, CreateTaskData, UpdateTaskData, TaskComment, TaskAttachment, TaskStats } from './tasks';
export type { User as TeamMember, CreateUserData, UpdateUserData, Permission, TeamStats, Team, CreateTeamData, UpdateTeamData } from './team';
export type { Event, CreateEventData, UpdateEventData, EventStats, EventRecurrence, EventReminder } from './events';
export type { 
  Expense, 
  Income, 
  Invoice, 
  CreateExpenseData, 
  CreateIncomeData, 
  CreateInvoiceData, 
  AccountingStats 
} from './accounting';
export type { 
  Lead, 
  Proposal, 
  CreateLeadData, 
  CreateProposalData, 
  LeadStats, 
  ProposalStats 
} from './proposals';
export type { 
  OverviewStats, 
  RevenueAnalytics, 
  ProjectAnalytics, 
  TaskAnalytics, 
  TeamPerformance, 
  ClientAnalytics, 
  SalesAnalytics 
} from './analytics';
export type { UploadedFile, UploadResponse, UploadProgress } from './uploads';

// Common types used across multiple services
export type { PaginatedResponse, PaginationParams } from './contacts';
