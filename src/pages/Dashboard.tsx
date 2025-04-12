
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomFieldsEditor from "@/components/CustomFieldsEditor";
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { http } from '@/lib/http-client';
import { toast } from "sonner";
import { AuthService } from '@/services/AuthService';
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if token exists, if not redirect to login
    const token = localStorage.getItem('estudio-km-token');
    const checkAuth = async () => {
      setIsLoading(true);
      // Check if admin
      const adminStatus = await AuthService.isAdmin();
      setIsAdmin(adminStatus);
      
      if (!token && !adminStatus) {
        navigate('/');
      } else if (token) {
        // Set token globally for all requests
        http.defaultOptions.headers = {
          ...http.defaultOptions.headers,
          'x-access-token': token
        };
        
        // Verificar que el token se haya establecido correctamente
        console.log('Token establecido en headers:', http.defaultOptions.headers);
        toast.success("Sesión iniciada con token: " + token.substring(0, 10) + "...");
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/');
  };
  
  const goToAdmin = () => {
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex-1 p-6">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-gray-700">Hola,</span> 
              <span className="text-primary"> Estudio</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Esta es tu plataforma personalizada de Estudio KM.
            </p>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && (
              <Button 
                variant="default" 
                onClick={goToAdmin}
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                Panel de Admin
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Cerrar sesión
            </Button>
          </div>
        </header>
        
        {isAdmin && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="text-lg font-medium text-amber-800 mb-2">Acceso de Administrador</h2>
            <p className="text-amber-700 mb-4">
              Has iniciado sesión como administrador. Puedes acceder al panel de administración para gestionar empresas, tokens y usuarios.
            </p>
            <Button onClick={goToAdmin} className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2">
              <Settings size={16} />
              Ir al Panel de Administración
            </Button>
          </div>
        )}
        
        <div className="max-w-6xl mx-auto">
          <div className="app-card p-6">
            <CustomFieldsEditor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
