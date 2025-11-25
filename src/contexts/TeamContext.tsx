import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TeamMember, TeamInvitation, ProjectAssignment, TeamRole, Team, TeamProjectAssignment } from '@/types';

interface TeamState {
  teamMembers: TeamMember[];
  invitations: TeamInvitation[];
  projectAssignments: ProjectAssignment[];
  teams: Team[];
  teamProjectAssignments: TeamProjectAssignment[];
  loading: boolean;
  error: string | null;
}

type TeamAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TEAM_MEMBERS'; payload: TeamMember[] }
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'DELETE_TEAM_MEMBER'; payload: string }
  | { type: 'SET_INVITATIONS'; payload: TeamInvitation[] }
  | { type: 'ADD_INVITATION'; payload: TeamInvitation }
  | { type: 'UPDATE_INVITATION'; payload: TeamInvitation }
  | { type: 'DELETE_INVITATION'; payload: string }
  | { type: 'SET_PROJECT_ASSIGNMENTS'; payload: ProjectAssignment[] }
  | { type: 'ADD_PROJECT_ASSIGNMENT'; payload: ProjectAssignment }
  | { type: 'UPDATE_PROJECT_ASSIGNMENT'; payload: ProjectAssignment }
  | { type: 'DELETE_PROJECT_ASSIGNMENT'; payload: string }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'SET_TEAM_PROJECT_ASSIGNMENTS'; payload: TeamProjectAssignment[] }
  | { type: 'ADD_TEAM_PROJECT_ASSIGNMENT'; payload: TeamProjectAssignment }
  | { type: 'DELETE_TEAM_PROJECT_ASSIGNMENT'; payload: string };

const initialState: TeamState = {
  teamMembers: [],
  invitations: [],
  projectAssignments: [],
  teams: [],
  teamProjectAssignments: [],
  loading: false,
  error: null,
};

function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload };
    case 'ADD_TEAM_MEMBER':
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map(member =>
          member.id === action.payload.id ? action.payload : member
        ),
      };
    case 'DELETE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(member => member.id !== action.payload),
      };
    case 'SET_INVITATIONS':
      return { ...state, invitations: action.payload };
    case 'ADD_INVITATION':
      return { ...state, invitations: [...state.invitations, action.payload] };
    case 'UPDATE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.map(invitation =>
          invitation.id === action.payload.id ? action.payload : invitation
        ),
      };
    case 'DELETE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.filter(invitation => invitation.id !== action.payload),
      };
    case 'SET_PROJECT_ASSIGNMENTS':
      return { ...state, projectAssignments: action.payload };
    case 'ADD_PROJECT_ASSIGNMENT':
      return { ...state, projectAssignments: [...state.projectAssignments, action.payload] };
    case 'UPDATE_PROJECT_ASSIGNMENT':
      return {
        ...state,
        projectAssignments: state.projectAssignments.map(assignment =>
          assignment.id === action.payload.id ? action.payload : assignment
        ),
      };
    case 'DELETE_PROJECT_ASSIGNMENT':
      return {
        ...state,
        projectAssignments: state.projectAssignments.filter(assignment => assignment.id !== action.payload),
      };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] };
    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map(team =>
          team.id === action.payload.id ? action.payload : team
        ),
      };
    case 'DELETE_TEAM':
      return {
        ...state,
        teams: state.teams.filter(team => team.id !== action.payload),
      };
    case 'SET_TEAM_PROJECT_ASSIGNMENTS':
      return { ...state, teamProjectAssignments: action.payload };
    case 'ADD_TEAM_PROJECT_ASSIGNMENT':
      return { ...state, teamProjectAssignments: [...state.teamProjectAssignments, action.payload] };
    case 'DELETE_TEAM_PROJECT_ASSIGNMENT':
      return {
        ...state,
        teamProjectAssignments: state.teamProjectAssignments.filter(assignment => assignment.id !== action.payload),
      };
    default:
      return state;
  }
}

interface TeamContextType {
  state: TeamState;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  sendInvitation: (invitation: Omit<TeamInvitation, 'id' | 'created_at' | 'updated_at'>) => void;
  updateInvitation: (id: string, updates: Partial<TeamInvitation>) => void;
  deleteInvitation: (id: string) => void;
  assignToProject: (assignment: Omit<ProjectAssignment, 'id'>) => void;
  updateProjectAssignment: (id: string, updates: Partial<ProjectAssignment>) => void;
  removeFromProject: (assignmentId: string) => void;
  getTeamMembersByProject: (projectId: string) => TeamMember[];
  getProjectsByTeamMember: (teamMemberId: string) => ProjectAssignment[];
  calculatePerformanceMetrics: (teamMemberId: string) => TeamMember['performance_metrics'];
  // Team management functions
  createTeam: (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addMemberToTeam: (teamId: string, memberId: string) => void;
  removeMemberFromTeam: (teamId: string, memberId: string) => void;
  assignProjectToTeam: (teamId: string, projectId: string, assignedBy: string) => void;
  removeProjectFromTeam: (teamId: string, projectId: string) => void;
  getTeamsByMember: (memberId: string) => Team[];
  getProjectsByTeam: (teamId: string) => string[];
  getTeamMembers: (teamId: string) => TeamMember[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(teamReducer, initialState);

  // Generate mock data on initialization
  React.useEffect(() => {
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@mediaflow.com',
        phone: '(555) 123-4567',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
        role: 'Manager',
        status: 'Active',
        permissions: {
          can_manage_projects: true,
          can_send_proposals: true,
          can_approve_expenses: true,
          can_manage_team: true,
          can_view_financials: true,
          can_manage_assets: true,
          can_access_client_portal: true,
        },
        hourly_rate: 85,
        skills: ['Project Management', 'Client Relations', 'Team Leadership'],
        bio: 'Experienced production manager with 8+ years in media production.',
        hire_date: '2020-01-15',
        assigned_projects: ['proj-1', 'proj-2'],
        performance_metrics: {
          tasks_completed: 147,
          projects_managed: 23,
          proposals_sent: 45,
          expenses_entered: 89,
          avg_task_completion_time: 2.5,
          client_satisfaction_rating: 4.8,
        },
        last_active: '2024-11-26T10:30:00Z',
        created_at: '2020-01-15T00:00:00Z',
        updated_at: '2024-11-26T10:30:00Z',
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@mediaflow.com',
        phone: '(555) 234-5678',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        role: 'Director',
        status: 'Active',
        permissions: {
          can_manage_projects: true,
          can_send_proposals: false,
          can_approve_expenses: false,
          can_manage_team: false,
          can_view_financials: false,
          can_manage_assets: true,
          can_access_client_portal: true,
        },
        hourly_rate: 125,
        skills: ['Video Direction', 'Cinematography', 'Creative Leadership'],
        bio: 'Award-winning director specializing in commercial and documentary content.',
        hire_date: '2019-06-01',
        assigned_projects: ['proj-1', 'proj-3'],
        performance_metrics: {
          tasks_completed: 89,
          projects_managed: 15,
          proposals_sent: 12,
          expenses_entered: 34,
          avg_task_completion_time: 4.2,
          client_satisfaction_rating: 4.9,
        },
        last_active: '2024-11-26T09:15:00Z',
        created_at: '2019-06-01T00:00:00Z',
        updated_at: '2024-11-26T09:15:00Z',
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        email: 'emma@mediaflow.com',
        phone: '(555) 345-6789',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        role: 'Editor',
        status: 'Active',
        permissions: {
          can_manage_projects: false,
          can_send_proposals: false,
          can_approve_expenses: false,
          can_manage_team: false,
          can_view_financials: false,
          can_manage_assets: true,
          can_access_client_portal: false,
        },
        hourly_rate: 65,
        skills: ['Video Editing', 'Motion Graphics', 'Color Correction'],
        bio: 'Creative editor with expertise in narrative storytelling and post-production.',
        hire_date: '2021-03-15',
        assigned_projects: ['proj-2', 'proj-3'],
        performance_metrics: {
          tasks_completed: 203,
          projects_managed: 0,
          proposals_sent: 0,
          expenses_entered: 45,
          avg_task_completion_time: 3.1,
          client_satisfaction_rating: 4.7,
        },
        last_active: '2024-11-25T16:45:00Z',
        created_at: '2021-03-15T00:00:00Z',
        updated_at: '2024-11-25T16:45:00Z',
      },
      {
        id: '4',
        name: 'David Thompson',
        email: 'david@mediaflow.com',
        phone: '(555) 456-7890',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'Camera Operator',
        status: 'Active',
        permissions: {
          can_manage_projects: false,
          can_send_proposals: false,
          can_approve_expenses: false,
          can_manage_team: false,
          can_view_financials: false,
          can_manage_assets: false,
          can_access_client_portal: false,
        },
        hourly_rate: 75,
        skills: ['Camera Operation', 'Lighting', 'Equipment Setup'],
        bio: 'Experienced camera operator with technical expertise in various shooting environments.',
        hire_date: '2020-09-01',
        assigned_projects: ['proj-1'],
        performance_metrics: {
          tasks_completed: 156,
          projects_managed: 0,
          proposals_sent: 0,
          expenses_entered: 67,
          avg_task_completion_time: 1.8,
          client_satisfaction_rating: 4.6,
        },
        last_active: '2024-11-26T08:20:00Z',
        created_at: '2020-09-01T00:00:00Z',
        updated_at: '2024-11-26T08:20:00Z',
      },
    ];

    const mockInvitations: TeamInvitation[] = [
      {
        id: 'inv-1',
        email: 'alex@freelancer.com',
        role: 'Audio Engineer',
        permissions: {
          can_manage_projects: false,
          can_send_proposals: false,
          can_approve_expenses: false,
          can_manage_team: false,
          can_view_financials: false,
          can_manage_assets: false,
          can_access_client_portal: false,
        },
        invited_by: '1',
        invitation_token: 'token-123',
        expires_at: '2024-12-26T00:00:00Z',
        status: 'Pending',
        message: 'We would love to have you join our audio team for upcoming projects.',
        created_at: '2024-11-20T00:00:00Z',
        updated_at: '2024-11-20T00:00:00Z',
      },
    ];

    const mockAssignments: ProjectAssignment[] = [
      {
        id: 'assign-1',
        project_id: 'proj-1',
        team_member_id: '1',
        role_in_project: 'Project Manager',
        assigned_at: '2024-11-01T00:00:00Z',
        assigned_by: '1',
        is_lead: true,
        responsibilities: ['Overall project coordination', 'Client communication', 'Budget management'],
      },
      {
        id: 'assign-2',
        project_id: 'proj-1',
        team_member_id: '2',
        role_in_project: 'Director',
        assigned_at: '2024-11-01T00:00:00Z',
        assigned_by: '1',
        is_lead: true,
        responsibilities: ['Creative direction', 'Shot planning', 'Crew coordination'],
      },
    ];

    const mockTeams: Team[] = [
      {
        id: 'team-1',
        name: 'Production Team A',
        description: 'Primary production team for commercials and corporate videos',
        manager_id: '1',
        member_ids: ['1', '2', '4'],
        project_ids: ['proj-1'],
        created_by: '1',
        created_at: '2024-11-01T00:00:00Z',
        updated_at: '2024-11-01T00:00:00Z',
      },
      {
        id: 'team-2',
        name: 'Post-Production Team',
        description: 'Dedicated editing and post-production team',
        manager_id: '1',
        member_ids: ['1', '3'],
        project_ids: ['proj-2', 'proj-3'],
        created_by: '1',
        created_at: '2024-11-01T00:00:00Z',
        updated_at: '2024-11-01T00:00:00Z',
      },
    ];

    const mockTeamProjectAssignments: TeamProjectAssignment[] = [
      {
        id: 'tpa-1',
        team_id: 'team-1',
        project_id: 'proj-1',
        assigned_at: '2024-11-01T00:00:00Z',
        assigned_by: '1',
      },
      {
        id: 'tpa-2',
        team_id: 'team-2',
        project_id: 'proj-2',
        assigned_at: '2024-11-01T00:00:00Z',
        assigned_by: '1',
      },
      {
        id: 'tpa-3',
        team_id: 'team-2',
        project_id: 'proj-3',
        assigned_at: '2024-11-01T00:00:00Z',
        assigned_by: '1',
      },
    ];

    dispatch({ type: 'SET_TEAM_MEMBERS', payload: mockTeamMembers });
    dispatch({ type: 'SET_INVITATIONS', payload: mockInvitations });
    dispatch({ type: 'SET_PROJECT_ASSIGNMENTS', payload: mockAssignments });
    dispatch({ type: 'SET_TEAMS', payload: mockTeams });
    dispatch({ type: 'SET_TEAM_PROJECT_ASSIGNMENTS', payload: mockTeamProjectAssignments });
  }, []);

  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: `member-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TEAM_MEMBER', payload: newMember });
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    const member = state.teamMembers.find(m => m.id === id);
    if (member) {
      const updatedMember = { ...member, ...updates, updated_at: new Date().toISOString() };
      dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: updatedMember });
    }
  };

  const deleteTeamMember = (id: string) => {
    dispatch({ type: 'DELETE_TEAM_MEMBER', payload: id });
  };

  const sendInvitation = (invitationData: Omit<TeamInvitation, 'id' | 'created_at' | 'updated_at'>) => {
    const newInvitation: TeamInvitation = {
      ...invitationData,
      id: `inv-${Date.now()}`,
      invitation_token: `token-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_INVITATION', payload: newInvitation });
  };

  const updateInvitation = (id: string, updates: Partial<TeamInvitation>) => {
    const invitation = state.invitations.find(i => i.id === id);
    if (invitation) {
      const updatedInvitation = { ...invitation, ...updates, updated_at: new Date().toISOString() };
      dispatch({ type: 'UPDATE_INVITATION', payload: updatedInvitation });
    }
  };

  const deleteInvitation = (id: string) => {
    dispatch({ type: 'DELETE_INVITATION', payload: id });
  };

  const assignToProject = (assignmentData: Omit<ProjectAssignment, 'id'>) => {
    const newAssignment: ProjectAssignment = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
    };
    dispatch({ type: 'ADD_PROJECT_ASSIGNMENT', payload: newAssignment });
  };

  const updateProjectAssignment = (id: string, updates: Partial<ProjectAssignment>) => {
    const assignment = state.projectAssignments.find(a => a.id === id);
    if (assignment) {
      const updatedAssignment = { ...assignment, ...updates };
      dispatch({ type: 'UPDATE_PROJECT_ASSIGNMENT', payload: updatedAssignment });
    }
  };

  const removeFromProject = (assignmentId: string) => {
    dispatch({ type: 'DELETE_PROJECT_ASSIGNMENT', payload: assignmentId });
  };

  const getTeamMembersByProject = (projectId: string): TeamMember[] => {
    const assignments = state.projectAssignments.filter(a => a.project_id === projectId);
    return assignments.map(assignment => 
      state.teamMembers.find(member => member.id === assignment.team_member_id)
    ).filter(Boolean) as TeamMember[];
  };

  const getProjectsByTeamMember = (teamMemberId: string): ProjectAssignment[] => {
    return state.projectAssignments.filter(a => a.team_member_id === teamMemberId);
  };

  const calculatePerformanceMetrics = (teamMemberId: string): TeamMember['performance_metrics'] => {
    const member = state.teamMembers.find(m => m.id === teamMemberId);
    return member?.performance_metrics || {
      tasks_completed: 0,
      projects_managed: 0,
      proposals_sent: 0,
      expenses_entered: 0,
      avg_task_completion_time: 0,
      client_satisfaction_rating: 0,
    };
  };

  // Team management functions
  const createTeam = (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TEAM', payload: newTeam });
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    const team = state.teams.find(t => t.id === id);
    if (team) {
      const updatedTeam = { ...team, ...updates, updated_at: new Date().toISOString() };
      dispatch({ type: 'UPDATE_TEAM', payload: updatedTeam });
    }
  };

  const deleteTeam = (id: string) => {
    // Remove team assignments for all members
    state.teamMembers
      .filter(member => member.team_id === id)
      .forEach(member => {
        updateTeamMember(member.id, { team_id: undefined });
      });
    
    // Remove team project assignments
    state.teamProjectAssignments
      .filter(assignment => assignment.team_id === id)
      .forEach(assignment => {
        dispatch({ type: 'DELETE_TEAM_PROJECT_ASSIGNMENT', payload: assignment.id });
      });
    
    dispatch({ type: 'DELETE_TEAM', payload: id });
  };

  const addMemberToTeam = (teamId: string, memberId: string) => {
    // Update team member's team_id
    updateTeamMember(memberId, { team_id: teamId });
    
    // Update team's member_ids array
    const team = state.teams.find(t => t.id === teamId);
    if (team && !team.member_ids.includes(memberId)) {
      const updatedMemberIds = [...team.member_ids, memberId];
      updateTeam(teamId, { member_ids: updatedMemberIds });
    }
  };

  const removeMemberFromTeam = (teamId: string, memberId: string) => {
    // Update team member's team_id
    updateTeamMember(memberId, { team_id: undefined });
    
    // Update team's member_ids array
    const team = state.teams.find(t => t.id === teamId);
    if (team) {
      const updatedMemberIds = team.member_ids.filter(id => id !== memberId);
      updateTeam(teamId, { member_ids: updatedMemberIds });
    }
  };

  const assignProjectToTeam = (teamId: string, projectId: string, assignedBy: string) => {
    // Create team project assignment
    const newAssignment: TeamProjectAssignment = {
      id: `tpa-${Date.now()}`,
      team_id: teamId,
      project_id: projectId,
      assigned_at: new Date().toISOString(),
      assigned_by: assignedBy,
    };
    dispatch({ type: 'ADD_TEAM_PROJECT_ASSIGNMENT', payload: newAssignment });
    
    // Update team's project_ids array
    const team = state.teams.find(t => t.id === teamId);
    if (team && !team.project_ids.includes(projectId)) {
      const updatedProjectIds = [...team.project_ids, projectId];
      updateTeam(teamId, { project_ids: updatedProjectIds });
    }
  };

  const removeProjectFromTeam = (teamId: string, projectId: string) => {
    // Remove team project assignment
    const assignment = state.teamProjectAssignments.find(
      a => a.team_id === teamId && a.project_id === projectId
    );
    if (assignment) {
      dispatch({ type: 'DELETE_TEAM_PROJECT_ASSIGNMENT', payload: assignment.id });
    }
    
    // Update team's project_ids array
    const team = state.teams.find(t => t.id === teamId);
    if (team) {
      const updatedProjectIds = team.project_ids.filter(id => id !== projectId);
      updateTeam(teamId, { project_ids: updatedProjectIds });
    }
  };

  const getTeamsByMember = (memberId: string): Team[] => {
    return state.teams.filter(team => team.member_ids.includes(memberId));
  };

  const getProjectsByTeam = (teamId: string): string[] => {
    const team = state.teams.find(t => t.id === teamId);
    return team?.project_ids || [];
  };

  const getTeamMembers = (teamId: string): TeamMember[] => {
    const team = state.teams.find(t => t.id === teamId);
    if (!team) return [];
    
    return state.teamMembers.filter(member => team.member_ids.includes(member.id));
  };

  const value: TeamContextType = {
    state,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    sendInvitation,
    updateInvitation,
    deleteInvitation,
    assignToProject,
    updateProjectAssignment,
    removeFromProject,
    getTeamMembersByProject,
    getProjectsByTeamMember,
    calculatePerformanceMetrics,
    createTeam,
    updateTeam,
    deleteTeam,
    addMemberToTeam,
    removeMemberFromTeam,
    assignProjectToTeam,
    removeProjectFromTeam,
    getTeamsByMember,
    getProjectsByTeam,
    getTeamMembers,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
