
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { toast } from "sonner";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // Check if the user is logged in
        const isLoggedIn = await AuthService.isLoggedIn();
        
        if (!isLoggedIn) {
          setIsAdmin(false);
          return;
        }
        
        // Check if the user is an admin
        const adminStatus = await AuthService.isAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error al verificar estado de administrador:", error);
        setIsAdmin(false);
        toast.error("Error al verificar permisos de administrador");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="ml-3">Verificando permisos...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    toast.error("No tienes permisos de administrador para acceder a esta página");
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;
