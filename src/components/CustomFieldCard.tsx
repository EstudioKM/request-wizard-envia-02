
import React, { useState } from 'react';
import { Edit, Save, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

interface CustomFieldCardProps {
  field: CustomField;
  onUpdate: (field: CustomField) => void;
  onDelete: (id: number) => void;
  isEditable: boolean;
}

const CustomFieldCard: React.FC<CustomFieldCardProps> = ({ field, onUpdate, onDelete, isEditable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedField, setEditedField] = useState<CustomField>(field);
  
  const handleEdit = () => {
    if (!isEditable) return;
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onUpdate({
      ...editedField,
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedField(field);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    onDelete(field.id);
  };
  
  const handleChange = (name: string, value: any) => {
    setEditedField(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'number': return 'bg-green-100 text-green-800';
      case 'date': return 'bg-purple-100 text-purple-800';
      case 'select': return 'bg-amber-100 text-amber-800';
      case 'checkbox': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow transition-all duration-200">
      <CardHeader className="p-4 pb-3 border-b border-gray-100">
        {isEditing ? (
          <div className="space-y-2">
            <Label htmlFor={`field-name-${field.id}`}>Nombre</Label>
            <Input
              id={`field-name-${field.id}`}
              value={editedField.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="border-gray-200"
            />
          </div>
        ) : (
          <CardTitle className="text-lg font-medium">{field.name}</CardTitle>
        )}
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor={`field-type-${field.id}`}>Tipo</Label>
              <Select 
                value={editedField.type} 
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger id={`field-type-${field.id}`}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="select">Selección</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`field-desc-${field.id}`}>Descripción</Label>
              <Input
                id={`field-desc-${field.id}`}
                value={editedField.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="border-gray-200"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Input
                type="checkbox"
                id={`field-required-${field.id}`}
                checked={editedField.required || false}
                onChange={(e) => handleChange('required', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor={`field-required-${field.id}`}>Requerido</Label>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tipo:</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(field.type)}`}>
                {field.type}
              </span>
            </div>
            
            {field.description && (
              <div className="text-sm text-gray-600 mt-2">
                {field.description}
              </div>
            )}
            
            {field.required && (
              <div className="flex items-center mt-2">
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Requerido
                </span>
              </div>
            )}
            
            <div className="text-xs text-gray-400 mt-3">
              Última actualización: {new Date(field.updatedAt).toLocaleString()}
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="p-3 flex justify-end space-x-2 border-t border-gray-100">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </>
        ) : (
          <>
            {isEditable && (
              <>
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default CustomFieldCard;
