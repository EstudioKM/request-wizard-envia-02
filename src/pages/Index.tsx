
import React from 'react';
import CustomFieldsEditor from "@/components/CustomFieldsEditor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-3 rounded-full shadow-sm mb-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <span role="img" aria-label="Robot" className="text-4xl">🤖</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            Asistente Virtual - Configuración
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gestión centralizada de la información de tu empresa para el asistente virtual.
            Personaliza el conocimiento que tu asistente utilizará para responder consultas.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Gestión de datos empresariales</h2>
            <p className="text-gray-600">
              En esta sección puedes configurar la información que tu asistente virtual conoce sobre tu empresa.
              Haz clic en las tarjetas para expandir los detalles o en el botón de editar para modificar los valores.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="bg-white px-3 py-2 rounded-full text-sm font-medium text-blue-700 shadow-sm flex items-center">
                <span className="mr-1">📝</span> Edición de datos
              </div>
              <div className="bg-white px-3 py-2 rounded-full text-sm font-medium text-green-700 shadow-sm flex items-center">
                <span className="mr-1">🔍</span> Búsqueda avanzada
              </div>
              <div className="bg-white px-3 py-2 rounded-full text-sm font-medium text-purple-700 shadow-sm flex items-center">
                <span className="mr-1">🚀</span> Actualización automática
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            <CustomFieldsEditor />
          </div>
          
          <div className="p-6 mt-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500 text-sm">
              La información configurada aquí será utilizada por el asistente virtual para responder
              consultas relacionadas con tu empresa. Mantén esta información actualizada para asegurar respuestas precisas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
