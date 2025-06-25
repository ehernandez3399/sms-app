import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Businesses from './pages/Businesses';
import Customers from './pages/Customers';
import CreateCampaign from './pages/CreateCampaign';
import Campaigns from './pages/Campaigns';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root redirects based on auth */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? '/businesses' : '/login'} replace />
        }
      />

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/businesses"
        element={
          <ProtectedRoute>
            <Businesses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/businesses/:businessId/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />

    
       <Route
         path="/businesses/:businessId/createcampaign"
         element={<CreateCampaign />}
       />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route
    path="/businesses/:businessId/customers/:customerId/campaigns"
    element={<Campaigns />}
  />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
