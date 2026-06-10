import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './redux/hooks';
import LoginScreen from './views/LoginScreen';
import DashboardScreen from './views/DashboardScreen';
import ScannerScreen from './views/ScannerScreen';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAppSelector(state => state.auth);
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const { token } = useAppSelector(state => state.auth);

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginScreen />} />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardScreen />
        </PrivateRoute>
      } />
      
      <Route path="/scan" element={
        <PrivateRoute>
          <ScannerScreen />
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}
