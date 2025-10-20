import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { CalendarPage } from './pages/CalendarPage';
import { Reports } from './pages/Reports';
import Approvals from './pages/Approvals';
import ClientPortal from './pages/ClientPortal';
import Assets from './pages/Assets';
import Integrations from './pages/Integrations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="assets" element={<Assets />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="client-portal/:projectId" element={<ClientPortal />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
