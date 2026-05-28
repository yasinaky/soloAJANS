import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Departments } from './pages/Departments';
import { Agents } from './pages/Agents';
import { Workflows } from './pages/Workflows';
import { Leads } from './pages/Leads';
import { KnowledgeHub } from './pages/KnowledgeHub';
import { Analytics } from './pages/Analytics';
import { DecisionLog } from './pages/DecisionLog';
import { AgentClub } from './pages/AgentClub';
import { Settings } from './pages/Settings';

function LayoutWrapper() {
  return <Layout><Outlet /></Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:id" element={<Departments />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/knowledge" element={<KnowledgeHub />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/decisions" element={<DecisionLog />} />
          <Route path="/club" element={<AgentClub />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
