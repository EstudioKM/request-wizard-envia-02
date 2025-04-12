
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from '@/services/AuthService';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Company } from '@/pages/Admin';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(AuthService.getCurrentUser());
  const [company, setCompany] = useState<Company | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await AuthService.isLoggedIn();
      if (!isLoggedIn) {
        navigate('/');
        return;
      }
      
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        navigate('/');
        return;
      }
      
      setUser(currentUser);
      
      // Si el usuario tiene un company_id, buscar los detalles de la empresa
      if (currentUser.company_id) {
        try {
          // Obtener las empresas y esperar con await
          const companies = await AuthService.getCompanies();
          // Ahora podemos usar find en el array de empresas
          const userCompany = companies.find(c => c.id === currentUser.company_id);
          if (userCompany) {
            setCompany(userCompany);
          }
        } catch (error) {
          console.error("Error fetching company details:", error);
          toast.error("No se pudo cargar la información de la empresa");
        }
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Panel de Usuario</h1>
          <Button onClick={handleLogout} variant="outline">Cerrar Sesión</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Usuario</CardTitle>
              <CardDescription>Detalles de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-semibold">Email:</span> {user?.email}
              </div>
              <div>
                <span className="font-semibold">Rol:</span> {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
              {company && (
                <div>
                  <span className="font-semibold">Empresa:</span> {company.name}
                </div>
              )}
              {user?.token && (
                <div className="space-y-1">
                  <span className="font-semibold">Token de acceso:</span>
                  <div className="px-3 py-2 bg-gray-100 rounded font-mono text-sm break-all">
                    {user.token}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Acciones Disponibles</CardTitle>
              <CardDescription>Funcionalidades según tu rol</CardDescription>
            </CardHeader>
            <CardContent>
              {user?.role === 'admin' ? (
                <div className="space-y-4">
                  <p>Como administrador, puedes:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Gestionar empresas y tokens</li>
                    <li>Administrar usuarios</li>
                    <li>Ver estadísticas del sistema</li>
                  </ul>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate('/admin')}
                  >
                    Ir al Panel de Administración
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>Como usuario de empresa, puedes:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Ver información de tu empresa</li>
                    <li>Utilizar tu token para acceder a los recursos</li>
                    <li>Gestionar tus datos personales</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
