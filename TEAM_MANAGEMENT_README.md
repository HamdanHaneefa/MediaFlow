# Team Management System

This document describes the new team management functionality that allows managers to create teams and control project access based on team membership.

## Overview

The team management system provides the following capabilities:

1. **Team Creation**: Managers can create teams and assign members to them
2. **Project Assignment**: Projects can be assigned to specific teams
3. **Access Control**: Team members only see projects assigned to their team
4. **Manager Override**: Users with `can_manage_projects` permission can see all projects

## Features

### Team Creation
- Managers can create new teams with descriptions
- Assign team members during creation or later
- Assign projects during creation or later
- Set team managers who can manage the team

### Project Access Control
- Team members only see projects assigned to their teams
- Projects page automatically filters based on team membership
- Managers and users with project management permissions see all projects
- Team-based filtering is implemented through the `useTeamProjects` hook

### Team Management Interface
- **Teams Tab**: New tab in Team Management for creating and managing teams
- **Team Cards**: Visual representation of teams with member and project counts
- **Team Creation Dialog**: Easy-to-use interface for creating teams
- **Member Assignment**: Add/remove members from teams
- **Project Assignment**: Assign/remove projects from teams

## Database Schema

### Teams Table
```sql
teams (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  manager_id uuid REFERENCES team_members(id),
  member_ids uuid[],
  project_ids uuid[],
  created_by uuid REFERENCES team_members(id),
  created_at timestamptz,
  updated_at timestamptz
)
```

### Team Project Assignments Table
```sql
team_project_assignments (
  id uuid PRIMARY KEY,
  team_id uuid REFERENCES teams(id),
  project_id uuid REFERENCES projects(id),
  assigned_at timestamptz,
  assigned_by uuid REFERENCES team_members(id)
)
```

### Updated Team Members Table
```sql
-- Added team_id column to link members to teams
ALTER TABLE team_members ADD COLUMN team_id uuid REFERENCES teams(id);
```

## Usage

### Creating a Team
1. Go to Team Management → Teams tab
2. Click "Create Team"
3. Fill in team details:
   - Team name (required)
   - Description (optional)
   - Select team manager (required)
   - Add team members
   - Assign projects
4. Click "Create Team"

### Team-Based Project Access
- When a user logs in, the `useTeamProjects` hook determines which projects they can access
- Projects are filtered based on:
  1. Projects assigned to teams the user belongs to
  2. Projects directly assigned to the user (legacy support)
  3. All projects if the user has project management permissions

### Managing Teams
- Edit team details and membership
- Add/remove members from teams
- Assign/remove projects from teams
- Delete teams (removes all assignments)

## Components

### New Components
- `TeamsManagementView`: Main teams management interface
- `TeamCreationDialog`: Dialog for creating new teams
- `useTeamProjects`: Hook for team-based project filtering

### Updated Components
- `Team.tsx`: Added Teams tab and team statistics
- `Projects.tsx`: Integrated team-based access control
- `TeamContext`: Extended with team management functions

## Technical Implementation

### Context Functions
- `createTeam()`: Create a new team
- `updateTeam()`: Update team details
- `deleteTeam()`: Delete a team and remove all assignments
- `addMemberToTeam()`: Add a member to a team
- `removeMemberFromTeam()`: Remove a member from a team
- `assignProjectToTeam()`: Assign a project to a team
- `removeProjectFromTeam()`: Remove a project from a team

### Access Control Hook
The `useTeamProjects` hook provides:
- `accessibleProjects`: Projects the current user can access
- `hasProjectAccess()`: Check if user has access to a specific project
- `getTeamsWithProjectAccess()`: Get teams with access to a project
- `getMembersWithProjectAccess()`: Get members with access to a project

## Security Considerations

1. **Team-based Access**: Users can only see projects assigned to their teams
2. **Manager Override**: Managers can access all projects for oversight
3. **Permission Checks**: Project creation and team management require appropriate permissions
4. **Data Isolation**: Team members are isolated from projects outside their teams

## Future Enhancements

1. **Role-based Team Permissions**: Different roles within teams (lead, member, etc.)
2. **Team Hierarchies**: Support for nested teams or departments
3. **Advanced Project Sharing**: Temporary project access across teams
4. **Team Performance Analytics**: Team-based reporting and metrics
5. **Team Communication**: Built-in chat or communication tools for teams

## Demo Data

The system includes demo data with:
- 2 sample teams: "Production Team A" and "Post-Production Team"
- 3 sample projects assigned to different teams
- 4 team members with different roles and permissions

This demonstrates how the access control works in practice.
