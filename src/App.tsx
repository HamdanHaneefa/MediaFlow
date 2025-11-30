import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import Login from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { CalendarPage } from './pages/CalendarPage';
import { Reports } from './pages/Reports';
import Approvals from './pages/Approvals';
import ClientPortal from './pages/ClientPortal';
import Assets from './pages/Assets';
// import Integrations from './pages/Integrations';
import Accounting from './pages/Accounting';
import Team from './pages/Team';
import Proposals from './pages/Proposals';
import ClientLogin from './pages/client/ClientLogin';
import ClientDashboard from './pages/client/ClientDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Client Portal Routes - Separate authentication */}
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="team" element={<Team />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="proposals" element={<Proposals />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="assets" element={<Assets />} />
            <Route path="accounting" element={<Accounting />} />
            {/* <Route path="integrations" element={<Integrations />} /> */}
            <Route path="approvals" element={<Approvals />} />
            <Route path="client-portal/:projectId" element={<ClientPortal />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
