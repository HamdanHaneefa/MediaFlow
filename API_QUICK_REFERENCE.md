# API Services - Quick Reference Guide

## 🚀 Quick Import

```typescript
// Import all services from one place
import { 
  authAPI, 
  contactsAPI, 
  projectsAPI, 
  tasksAPI, 
  teamAPI,
  accountingAPI,
  proposalsAPI,
  analyticsAPI,
  uploadsAPI,
  clientAuthAPI,
  clientPortalAPI
} from '@/services/api';
```

## 📚 API Reference by Module

### 🔐 Authentication
```typescript
import { authAPI } from '@/services/api';

// Admin login
await authAPI.login({ email, password });

// Get current user
await authAPI.getCurrentUser();

// Logout
await authAPI.logout();
```

### 👥 Contacts
```typescript
import { contactsAPI } from '@/services/api';

// List contacts (paginated)
await contactsAPI.getAll({ page: 1, limit: 10 });

// Search contacts
await contactsAPI.search('query', { page: 1 });

// Create contact
await contactsAPI.create({ first_name, last_name, email, ... });

// Update contact
await contactsAPI.update(id, { company: 'New Co' });

// Delete contact
await contactsAPI.delete(id);

// Get statistics
await contactsAPI.getStats();

// Export to CSV
await contactsAPI.exportCSV();

// Import from CSV
await contactsAPI.importCSV(file);

// Convert to client
await contactsAPI.convertToClient(id);
```

### 📁 Projects
```typescript
import { projectsAPI } from '@/services/api';

// List projects
await projectsAPI.getAll({ page: 1, limit: 10 });

// Create project
await projectsAPI.create({ name, description, client_id, ... });

// Update project status
await projectsAPI.updateStatus(id, 'Active');

// Add team member
await projectsAPI.addMember(projectId, userId, 'Developer');

// Remove team member
await projectsAPI.removeMember(projectId, userId);

// Add milestone
await projectsAPI.addMilestone(projectId, { title, due_date });

// Update budget
await projectsAPI.updateBudget(projectId, { budget, spent });

// Get project tasks
await projectsAPI.getTasks(projectId);

// Get project files
await projectsAPI.getFiles(projectId);
```

### ✅ Tasks
```typescript
import { tasksAPI } from '@/services/api';

// List all tasks
await tasksAPI.getAll({ page: 1, status: 'In Progress' });

// Create task
await tasksAPI.create({ 
  title, 
  project_id, 
  assigned_to, 
  priority: 'High' 
});

// Update task status
await tasksAPI.updateStatus(id, 'Completed');

// Update task priority
await tasksAPI.updatePriority(id, 'Critical');

// Assign task
await tasksAPI.assign(taskId, userId);

// Add comment
await tasksAPI.addComment(taskId, 'Comment text');

// Add attachment
await tasksAPI.addAttachment(taskId, file);

// Get my tasks
await tasksAPI.getMyTasks({ page: 1 });

// Get overdue tasks
await tasksAPI.getOverdue({ page: 1 });

// Bulk update
await tasksAPI.bulkUpdate([id1, id2], { status: 'Completed' });
```

### 👨‍💼 Team
```typescript
import { teamAPI } from '@/services/api';

// List team members
await teamAPI.getAll({ page: 1, role: 'Manager' });

// Create team member
await teamAPI.create({ 
  email, 
  password, 
  first_name, 
  last_name, 
  role: 'Member' 
});

// Update team member
await teamAPI.update(id, { position: 'Senior Developer' });

// Update avatar
await teamAPI.updateAvatar(userId, file);

// Update password
await teamAPI.updatePassword(userId, { 
  current_password, 
  new_password 
});

// Get permissions
await teamAPI.getPermissions(userId);

// Set permissions
await teamAPI.setPermissions(userId, [
  { resource: 'projects', actions: ['read', 'create', 'update'] }
]);

// Get active members only
await teamAPI.getActive({ page: 1 });
```

### 💰 Accounting
```typescript
import { accountingAPI } from '@/services/api';

// --- EXPENSES ---
// List expenses
await accountingAPI.expenses.getAll({ page: 1, category: 'Travel' });

// Create expense
await accountingAPI.expenses.create({ 
  category, 
  amount, 
  payment_method: 'Credit Card' 
});

// Upload receipt
await accountingAPI.expenses.uploadReceipt(expenseId, file);

// --- INCOME ---
// List income
await accountingAPI.income.getAll({ page: 1 });

// Create income
await accountingAPI.income.create({ source, amount, date });

// --- INVOICES ---
// List invoices
await accountingAPI.invoices.getAll({ 
  page: 1, 
  status: 'Sent' 
});

// Create invoice
await accountingAPI.invoices.create({ 
  client_id, 
  amount, 
  line_items: [...] 
});

// Send invoice
await accountingAPI.invoices.send(id);

// Mark as paid
await accountingAPI.invoices.markPaid(id);

// Download PDF
await accountingAPI.invoices.downloadPDF(id);

// --- REPORTS ---
// Get stats
await accountingAPI.getStats();

// Get financial report
await accountingAPI.getReport('2024-01-01', '2024-12-31');

// Export expenses
await accountingAPI.exportExpenses('2024-01-01', '2024-12-31');
```

### 📊 Proposals & Leads
```typescript
import { proposalsAPI } from '@/services/api';

// --- LEADS ---
// List leads
await proposalsAPI.leads.getAll({ page: 1, status: 'New' });

// Create lead
await proposalsAPI.leads.create({ 
  first_name, 
  last_name, 
  email, 
  source: 'Website' 
});

// Update lead status
await proposalsAPI.leads.updateStatus(id, 'Qualified');

// Assign lead
await proposalsAPI.leads.assign(leadId, userId);

// Convert to client
await proposalsAPI.leads.convertToClient(leadId);

// Get lead stats
await proposalsAPI.leads.getStats();

// Export leads
await proposalsAPI.leads.exportCSV({ status: 'New' });

// --- PROPOSALS ---
// List proposals
await proposalsAPI.proposals.getAll({ page: 1, status: 'Sent' });

// Create proposal
await proposalsAPI.proposals.create({ 
  title, 
  client_id, 
  amount, 
  sections: [...] 
});

// Send proposal
await proposalsAPI.proposals.send(id);

// Accept proposal
await proposalsAPI.proposals.accept(id);

// Reject proposal
await proposalsAPI.proposals.reject(id, 'reason');

// Download PDF
await proposalsAPI.proposals.downloadPDF(id);

// Duplicate proposal
await proposalsAPI.proposals.duplicate(id);

// Get proposal stats
await proposalsAPI.proposals.getStats();
```

### 📈 Analytics
```typescript
import { analyticsAPI } from '@/services/api';

// Overview stats
await analyticsAPI.getOverview({ 
  start_date: '2024-01-01', 
  end_date: '2024-12-31' 
});

// Revenue analytics
await analyticsAPI.getRevenue({ period: 'month' });

// Project analytics
await analyticsAPI.getProjects({ period: 'quarter' });

// Task analytics
await analyticsAPI.getTasks({ period: 'week' });

// Team performance
await analyticsAPI.getTeamPerformance({ period: 'month' });

// Client analytics
await analyticsAPI.getClients({ period: 'year' });

// Sales analytics
await analyticsAPI.getSales({ period: 'quarter' });

// Dashboard data
await analyticsAPI.getDashboardData();

// Real-time stats
await analyticsAPI.getRealTimeStats();

// Compare timeframes
await analyticsAPI.compareTimeframes(
  'revenue',
  { start_date: '2024-01-01', end_date: '2024-03-31' },
  { start_date: '2024-04-01', end_date: '2024-06-30' }
);

// Forecast
await analyticsAPI.getForecast('revenue', { period: 'month' });

// Export reports
await analyticsAPI.exportRevenue({ format: 'pdf' });
await analyticsAPI.exportProjects({ format: 'csv' });
```

### 📤 Uploads
```typescript
import { uploadsAPI } from '@/services/api';

// Upload single file
await uploadsAPI.upload(
  file, 
  'document', 
  { project_id: 'xxx' },
  (progress) => console.log(progress.percentage)
);

// Upload multiple files
await uploadsAPI.uploadMultiple(
  [file1, file2], 
  'image',
  { project_id: 'xxx' }
);

// List files
await uploadsAPI.getAll({ 
  page: 1, 
  category: 'document',
  project_id: 'xxx' 
});

// Delete file
await uploadsAPI.delete(id);

// Download file
await uploadsAPI.download(id);

// Get file URL
const url = uploadsAPI.getFileUrl(filePath);

// --- HELPER METHODS ---
// Upload avatar
await uploadsAPI.uploadAvatar(file);

// Upload document
await uploadsAPI.uploadDocument(file, projectId);

// Upload image
await uploadsAPI.uploadImage(file, projectId);

// Upload receipt
await uploadsAPI.uploadReceipt(file, expenseId);

// Upload task attachment
await uploadsAPI.uploadTaskAttachment(file, taskId);
```

### 🔐 Client Portal (Client-Side)
```typescript
import { clientAuthAPI, clientPortalAPI } from '@/services/api';

// --- CLIENT AUTH ---
await clientAuthAPI.login({ email, password });
await clientAuthAPI.getCurrentUser();
await clientAuthAPI.logout();

// --- CLIENT PORTAL ---
// Dashboard
await clientPortalAPI.getDashboard();

// Projects
await clientPortalAPI.getProjects({ page: 1 });
await clientPortalAPI.getProjectById(id);

// Invoices
await clientPortalAPI.getInvoices({ page: 1, status: 'Sent' });
await clientPortalAPI.payInvoice(id, paymentData);

// Proposals
await clientPortalAPI.getProposals({ page: 1 });
await clientPortalAPI.acceptProposal(id);

// Messages
await clientPortalAPI.getMessages({ page: 1 });
await clientPortalAPI.sendMessage({ subject, message });

// Documents
await clientPortalAPI.getDocuments({ page: 1 });
await clientPortalAPI.downloadDocument(id);

// Notifications
await clientPortalAPI.getNotifications({ page: 1 });
await clientPortalAPI.markNotificationRead(id);
```

## 🔄 Common Patterns

### Error Handling
```typescript
import { contactsAPI } from '@/services/api';

try {
  const contacts = await contactsAPI.getAll({ page: 1 });
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.response?.status === 403) {
    // Forbidden - insufficient permissions
  } else {
    // Other error - show error message
    console.error(error.response?.data?.message || 'An error occurred');
  }
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await contactsAPI.getAll();
    setData(response);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Pagination
```typescript
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(0);

const fetchPage = async (pageNum: number) => {
  const response = await contactsAPI.getAll({ 
    page: pageNum, 
    limit: 10 
  });
  
  setData(response.items);
  setPage(response.pagination.page);
  setTotalPages(response.pagination.totalPages);
};

// Next page
const nextPage = () => fetchPage(page + 1);

// Previous page
const prevPage = () => fetchPage(page - 1);
```

### Search & Filters
```typescript
const [filters, setFilters] = useState({
  search: '',
  status: '',
  category: '',
});

const applyFilters = async () => {
  const response = await contactsAPI.getAll({
    page: 1,
    limit: 10,
    ...filters,
  });
  setData(response.items);
};

// Update filter
const updateFilter = (key: string, value: string) => {
  setFilters(prev => ({ ...prev, [key]: value }));
};

// Clear filters
const clearFilters = () => {
  setFilters({ search: '', status: '', category: '' });
};
```

### File Downloads
```typescript
const downloadFile = async (id: string, filename: string) => {
  try {
    const blob = await accountingAPI.invoices.downloadPDF(id);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
};
```

## 🎯 Type Safety

All API services are fully typed with TypeScript. Import types alongside APIs:

```typescript
import { 
  contactsAPI, 
  type Contact, 
  type CreateContactData 
} from '@/services/api';

// Typed state
const [contact, setContact] = useState<Contact | null>(null);

// Typed function
const createContact = async (data: CreateContactData) => {
  const newContact = await contactsAPI.create(data);
  setContact(newContact);
};
```

## 🔐 Authentication Flow

```typescript
import { authAPI } from '@/services/api';

// 1. Login
const login = async (email: string, password: string) => {
  try {
    const response = await authAPI.login({ email, password });
    // Tokens are automatically stored in localStorage
    // axios interceptors handle token refresh
    return response.user;
  } catch (error) {
    throw new Error('Login failed');
  }
};

// 2. Check if authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('admin_access_token');
};

// 3. Get current user
const getCurrentUser = async () => {
  try {
    return await authAPI.getCurrentUser();
  } catch (error) {
    // Token invalid or expired
    return null;
  }
};

// 4. Logout
const logout = async () => {
  await authAPI.logout();
  // Tokens are automatically cleared
};
```

## 📊 Response Format

All API responses follow this structure:

```typescript
// Success response
{
  success: true,
  data: { /* resource data */ },
  message: "Operation successful"
}

// Paginated response
{
  success: true,
  data: {
    items: [ /* array of resources */ ],
    pagination: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10
    }
  }
}

// Error response
{
  success: false,
  error: "Error message",
  message: "Detailed error description"
}
```

## 🎨 UI Integration Example

```typescript
// ContactsList.tsx
import { useEffect, useState } from 'react';
import { contactsAPI, type Contact } from '@/services/api';

export const ContactsList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadContacts();
  }, [page]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getAll({ page, limit: 10 });
      setContacts(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete contact?')) {
      await contactsAPI.delete(id);
      loadContacts(); // Refresh list
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {contacts.map(contact => (
        <div key={contact.id}>
          <h3>{contact.first_name} {contact.last_name}</h3>
          <p>{contact.email}</p>
          <button onClick={() => handleDelete(contact.id)}>Delete</button>
        </div>
      ))}
      
      <div>
        <button 
          onClick={() => setPage(p => p - 1)} 
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

---

**Last Updated:** 2025-11-26  
**Version:** 1.0.0  
**Coverage:** 173 endpoints across 11 modules
