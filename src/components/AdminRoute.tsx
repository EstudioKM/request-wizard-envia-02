
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // Check if the user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No hay sesión activa");
          setIsAdmin(false);
          toast.error("Debes iniciar sesión para acceder a esta página");
          return;
        }
        
        console.log("Usuario autenticado:", session.user.email);
        
        // Check if the user is an admin using the RPC function
        const { data: adminStatus, error } = await supabase.rpc('is_admin_user');
        
        if (error) {
          console.error("Error al verificar estado de administrador:", error);
          toast.error("Error al verificar permisos de administrador");
          setIsAdmin(false);
          return;
        }
        
        console.log("Estado de administrador:", adminStatus);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          toast.error("No tienes permisos de administrador para acceder a esta página");
        }
      } catch (error) {
        console.error("Error al verificar estado de administrador:", error);
        setIsAdmin(false);
        toast.error("Error al verificar permisos de administrador");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="ml-3">Verificando permisos...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;
