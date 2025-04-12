
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomFieldsEditor from "@/components/CustomFieldsEditor";
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { http } from '@/lib/http-client';

const Dashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if token exists, if not redirect to login
    const token = localStorage.getItem('estudio-km-token');
    if (!token) {
      navigate('/');
    } else {
      // Set token globally for all requests
      http.defaultOptions.headers = {
        ...http.defaultOptions.headers,
        'x-access-token': token
      };
    }
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('estudio-km-token');
    // Clear the token from headers
    if (http.defaultOptions.headers) {
      const { 'x-access-token': _, ...restHeaders } = http.defaultOptions.headers;
      http.defaultOptions.headers = restHeaders;
    }
    navigate('/');
  };

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
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Cerrar sesión
          </Button>
        </header>
        
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
