import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Adopcion from './pages/Adopcion';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import ClinicaWizard from './pages/ClinicaWizard';
import Quiz from './pages/Quiz';
import Community from './pages/Community';
import Campaigns from './pages/Campaigns';

import MedicalRecords from './pages/MedicalRecords';
import ONGWizard from './pages/ONGWizard';
import TransitWizard from './pages/TransitWizard';
import ONGDashboard from './pages/ONGDashboard';
import SuccessStories from './components/SuccessStories';

import ComercioWizard from './pages/ComercioWizard';
import Marketplace from './pages/Marketplace';
import CommerceDetail from './pages/CommerceDetail';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Intake from './pages/Admin/Intake';

// SuperAdmin Imports
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import Municipios from './pages/SuperAdmin/Municipios';
import Approvals from './pages/SuperAdmin/Approvals';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar visible on all main routes, but AdminLayout has its own sidebar */}
      {/* We might want to conditionally render Navbar if inside /admin, but 
          AdminLayout is a Layout Route, so we can structure it like this: */}

      <Routes>
        {/* Main App Routes (with Navbar) */}
        <Route element={<><Navbar /><div className="min-h-screen bg-gray-50"><OutletWrapper /></div></>}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/adopcion" element={<Adopcion />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/comunidad" element={<Community />} />
          <Route path="/campanias" element={<Campaigns />} />
          <Route path="/perfil" element={<Perfil />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/clinica-wizard" element={<ClinicaWizard />} />
          <Route path="/medical-records" element={<MedicalRecords />} />

          <Route path="/ong-register" element={<ONGWizard />} />
          <Route path="/transit-register" element={<TransitWizard />} />
          <Route path="/ong-dashboard" element={<ONGDashboard />} />
          <Route path="/success-stories" element={<SuccessStories />} />

          <Route path="/comercio-register" element={<ComercioWizard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/comercio/:id" element={<CommerceDetail />} />
        </Route>

        {/* Admin Routes (No Standard Navbar) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="intake" element={<Intake />} />
          {/* Future routes: usuarios, pacientes, reports */}
        </Route>

        {/* SuperAdmin Routes */}
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="/superadmin/municipios" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="municipios" element={<Municipios />} />
          <Route path="aprobaciones/:type" element={<Approvals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Helper to keep the existing structure working with the Outlet
import { Outlet } from 'react-router-dom';
const OutletWrapper = () => <Outlet />;

export default App;