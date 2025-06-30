import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login    from './pages/Login';
import Dashboard from './pages/Dashboard';
import Businesses from './pages/Businesses';
import Customers  from './pages/Customers';
import Campaigns  from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/businesses' : '/login'} replace />}
      />

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard/></ProtectedRoute>}
      />

      <Route
        path="/businesses"
        element={<ProtectedRoute><Businesses/></ProtectedRoute>}
      />

      <Route
        path="/businesses/:businessId/customers"
        element={<ProtectedRoute><Customers/></ProtectedRoute>}
      />

      <Route
        path="/businesses/:businessId/campaigns"
        element={<ProtectedRoute><Campaigns/></ProtectedRoute>}
      />

      {/* New campaign */}
      <Route
        path="/businesses/:businessId/campaigns/new"
        element={<ProtectedRoute><CreateCampaign/></ProtectedRoute>}
      />

      {/* Edit campaign */}
      <Route
        path="/businesses/:businessId/campaigns/:campaignId/edit"
        element={<ProtectedRoute><CreateCampaign isEditing/></ProtectedRoute>}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes/>
      </Router>
    </AuthProvider>
  );
}
