
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomFieldCard from './CustomFieldCard';

interface CustomField {
  id: number;
  accountId: number;
  name: string;
  type: string;
  description?: string;
  options?: string[];
  required?: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
  value?: any;
  hasValue?: boolean;
}

interface CustomFieldsGridProps {
  fields: CustomField[];
  onUpdate: (fields: CustomField[]) => void;
  isEditable: boolean;
  onAddField: () => void;
}

const CustomFieldsGrid: React.FC<CustomFieldsGridProps> = ({ 
  fields, 
  onUpdate, 
  isEditable,
  onAddField
}) => {
  const handleFieldUpdate = (updatedField: CustomField) => {
    const updatedFields = fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    );
    onUpdate(updatedFields);
  };
  
  const handleFieldDelete = (id: number) => {
    const updatedFields = fields.filter(field => field.id !== id);
    onUpdate(updatedFields);
  };
  
  // Agrupamos los campos por tipo para una mejor organización visual
  const fieldsByType: Record<string, CustomField[]> = {};
  fields.forEach(field => {
    const type = field.type;
    if (!fieldsByType[type]) {
      fieldsByType[type] = [];
    }
    fieldsByType[type].push(field);
  });
  
  const getTypeHeader = (type: string) => {
    switch (type) {
      case '0': return '📝 Campos de texto';
      case '1': return '🔢 Campos numéricos';
      case '2': return '📅 Campos de fecha';
      case '3': return '✓ Campos de selección';
      case '4': return '☑ Campos de checkbox';
      case '5': return '📄 Campos de texto largo';
      case '-1': return '⚙️ Campos de sistema';
      default: return `Tipo ${type}`;
    }
  };
  
  return (
    <div className="space-y-8">
      {fields.length > 0 ? (
        <div className="space-y-8">
          {Object.keys(fieldsByType).map(type => (
            <div key={type} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                {getTypeHeader(type)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fieldsByType[type].map(field => (
                  <CustomFieldCard
                    key={field.id}
                    field={field}
                    onUpdate={handleFieldUpdate}
                    onDelete={handleFieldDelete}
                    isEditable={isEditable}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No hay campos disponibles</h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            No se encontraron campos que coincidan con los criterios de búsqueda o que tengan valores asignados.
          </p>
          {isEditable && (
            <Button
              variant="outline"
              className="mt-2"
              onClick={onAddField}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir nuevo campo
            </Button>
          )}
        </div>
      )}
      
      {isEditable && fields.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            className="border-dashed border-2 border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
            onClick={onAddField}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Añadir nuevo campo
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsGrid;
