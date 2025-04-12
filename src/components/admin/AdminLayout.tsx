
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentTab: 'companies' | 'users';
  onTabChange: (tab: 'companies' | 'users') => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  currentTab, 
  onTabChange 
}) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    try {
      // Simplificamos el cierre de sesión para evitar el bucle
      localStorage.removeItem('estudio-km-token');
      localStorage.removeItem('isAdmin');
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex-1 p-6 space-y-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Panel de Administración</h1>
            <p className="text-gray-500 mt-2">
              Gestiona empresas y usuarios del sistema
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
        
        <div className="border-b mb-6">
          <div className="flex space-x-6">
            <button
              className={`pb-2 px-1 ${currentTab === 'companies' 
                ? 'border-b-2 border-primary font-medium text-primary' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => onTabChange('companies')}
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 9h.01" />
                  <path d="M16 9h.01" />
                  <path d="M12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                </svg>
                Empresas
              </div>
            </button>
            <button
              className={`pb-2 px-1 ${currentTab === 'users' 
                ? 'border-b-2 border-primary font-medium text-primary' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => onTabChange('users')}
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Usuarios
              </div>
            </button>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
