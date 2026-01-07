import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';
import { DataProvider } from '@/context/DataContext';
import { BookingProvider } from '@/context/BookingContext';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { CompanySelection } from '@/pages/CompanySelection';
import { Home } from '@/pages/Home';
import { Dashboard } from '@/pages/Dashboard';
import { Tenants } from '@/pages/Tenants';
import { Seats } from '@/pages/Seats';
import { StaffAttendance } from '@/pages/StaffAttendance';
import './App.css';


// Protected route wrapper
function ProtectedRoute({ children, requireCompany = false }) {
  const { isLoggedIn, selectedCompanyId } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireCompany && !selectedCompanyId) {
    return <Navigate to="/companies" replace />;
  }

  return children;
}

// App routes component (needs to be inside AuthProvider)
function AppRoutes() {
  const { isLoggedIn, selectedCompanyId } = useAuth();

  return (
    <Routes>
      {/* Public route - Home */}
      <Route path="/" element={<Home />} />

      {/* Public route - Login */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to={selectedCompanyId ? '/dashboard' : '/companies'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Company Selection - requires login */}
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <LocationProvider>
              <DataProvider>
                <BookingProvider>
                  <CompanySelection />
                </BookingProvider>
              </DataProvider>
            </LocationProvider>
          </ProtectedRoute>
        }
      />

      {/* Dashboard routes - requires login AND company selection */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireCompany>
            <LocationProvider>
              <DataProvider>
                <BookingProvider>
                  <Layout />
                </BookingProvider>
              </DataProvider>
            </LocationProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="seats" element={<Seats />} />
        <Route path="attendance" element={<StaffAttendance />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <Toaster position="top-center" richColors />
          <AppRoutes />
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
