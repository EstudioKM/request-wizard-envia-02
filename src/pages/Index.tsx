
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex-1 p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-gray-700">Hola,</span> 
            <span className="text-primary"> Estudio</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Esta es tu plataforma personalizada de Estudio KM.
          </p>
        </header>
        
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-6 text-lg">Bienvenido a la plataforma de gestión de campos personalizados.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-primary hover:bg-primary/90">
            Acceder a los Campos Personalizados
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
