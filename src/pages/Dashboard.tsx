
import React from 'react';
import CustomFieldsEditor from "@/components/CustomFieldsEditor";
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { http } from '@/lib/http-client';

const Dashboard = () => {
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
