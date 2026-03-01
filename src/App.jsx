
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import CajeroArqueo from '@/pages/CajeroArqueo';
import AdminDashboard from '@/pages/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

const RootRedirect = () => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={currentUser.rol === 'admin' ? '/admin' : '/cajero'} replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 text-slate-100 font-sans dark">
      <Helmet titleTemplate="%s" defaultTitle="Arqueo de Caja IM">
        <title>Arqueo de Caja IM</title>
        <meta name="description" content="Sistema de Arqueo de Caja para ICL MARKET." />
      </Helmet>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="/cajero"
              element={
                <ProtectedRoute requiredRole="cajero">
                  <CajeroArqueo />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        
        <Toaster />
      </AuthProvider>
    </div>
  );
}

export default App;
