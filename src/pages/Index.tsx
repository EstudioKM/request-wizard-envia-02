
import React from 'react';
import CustomFieldsEditor from "@/components/CustomFieldsEditor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-semibold text-center mb-2 text-gray-800">Asistente Virtual - Campos Personalizados</h1>
        <p className="text-center text-gray-500 mb-8">Gestión de la información de la empresa para el asistente virtual</p>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-gray-700 mb-4">
            Aquí puedes ver y editar la información de tu empresa que utilizará el asistente virtual. 
            Haz clic en el botón de editar para modificar los valores de los campos.
          </p>
          <div className="grid grid-cols-1 gap-8">
            <CustomFieldsEditor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
