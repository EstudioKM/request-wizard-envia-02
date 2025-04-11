
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
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(field => (
          <CustomFieldCard
            key={field.id}
            field={field}
            onUpdate={handleFieldUpdate}
            onDelete={handleFieldDelete}
            isEditable={isEditable}
          />
        ))}
      </div>
      
      {isEditable && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            className="border-dashed border-2 border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
