import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocationProvider } from '@/context/LocationContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Tenants } from '@/pages/Tenants';
import { Seats } from '@/pages/Seats';
import { StaffAttendance } from '@/pages/StaffAttendance';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <DataProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="tenants" element={<Tenants />} />
                <Route path="seats" element={<Seats />} />
                <Route path="attendance" element={<StaffAttendance />} />
              </Route>
            </Routes>
          </DataProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
