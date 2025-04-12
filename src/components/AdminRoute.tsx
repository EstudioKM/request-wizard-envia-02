
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
        
        // Verificación rápida por localStorage primero
        if (localStorage.getItem('isAdmin') === 'true') {
          console.log("Admin verificado por localStorage");
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        console.log("Verificando estado de administrador...");
        const adminStatus = await AuthService.isAdmin();
        console.log("Estado de administrador:", adminStatus);
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
    // Mostrar un estado de carga mientras verificamos
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="ml-3">Verificando permisos...</div>
      </div>
    );
  }
  
  // Redirigir si no es admin
  if (!isAdmin) {
    toast.error("No tienes permisos de administrador");
    return <Navigate to="/" replace />;
  }
  
  // Renderizar los hijos si es admin
  return <>{children}</>;
};

export default AdminRoute;
