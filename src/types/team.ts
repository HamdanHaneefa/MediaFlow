// Team Types - re-exports from API types for backward compatibility
export type {
  User as TeamMember,
  Team,
  TeamStats,
  Permission,
  CreateUserData,
  UpdateUserData,
  CreateTeamData,
  UpdateTeamData,
} from '@/services/api/team';

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired';
  message?: string;
  created_at: string;
  updated_at: string;
}
