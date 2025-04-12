
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import CustomFieldsEditor from "@/components/CustomFieldsEditor";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Campos Personalizados</h1>
          <Button onClick={handleLogout} variant="outline">Cerrar Sesión</Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CustomFieldsEditor />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
