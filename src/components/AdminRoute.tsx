
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await AuthService.isAdmin();
      setIsAdmin(adminStatus);
    };
    
    checkAdminStatus();
  }, []);
  
  if (isAdmin === null) {
    // Mostrar un estado de carga mientras verificamos
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirigir si no es admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // Renderizar los hijos si es admin
  return <>{children}</>;
};

export default AdminRoute;
