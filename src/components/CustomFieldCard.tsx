
import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Trash2, Eye, EyeOff, Loader2, FileText, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { http } from '@/lib/http-client';
import { useToast } from '@/components/ui/use-toast';

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

interface CustomFieldCardProps {
  field: CustomField;
  onUpdate: (field: CustomField) => void;
  onDelete: (id: number) => void;
  isEditable: boolean;
}

const CustomFieldCard: React.FC<CustomFieldCardProps> = ({ field, onUpdate, onDelete, isEditable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedField, setEditedField] = useState<CustomField>(field);
  const [isShowingValue, setIsShowingValue] = useState(true);
  const [isLoadingValue, setIsLoadingValue] = useState(false);
  const [valueError, setValueError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Actualizar el campo editado cuando cambia el campo original
    setEditedField(field);
    // Mostrar el valor automáticamente si existe
    setIsShowingValue(true);
  }, [field]);
  
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
      case 'text': 
      case '0': return 'bg-blue-100 text-blue-800';
      case 'number': 
      case '1': return 'bg-green-100 text-green-800';
      case 'date': 
      case '2': return 'bg-purple-100 text-purple-800';
      case 'select': 
      case '3': return 'bg-amber-100 text-amber-800';
      case 'checkbox': 
      case '4': return 'bg-indigo-100 text-indigo-800';
      case 'textarea': 
      case '5': return 'bg-pink-100 text-pink-800';
      case '-1': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case '0': return 'Texto';
      case '1': return 'Número';
      case '2': return 'Fecha';
      case '3': return 'Selección';
      case '4': return 'Checkbox';
      case '5': return 'Texto largo';
      case '-1': return 'Sistema';
      default: return type;
    }
  };
  
  const toggleShowValue = () => {
    setIsShowingValue(prev => !prev);
  };

  // Determinar si es un texto largo para mostrar con formato adecuado
  const isLongText = field.type === '5' || (typeof field.value === 'string' && field.value.length > 100);
  const valueIsObject = typeof field.value === 'object' && field.value !== null;
  
  // Truncar textos largos
  const truncateText = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Formato para mostrar el valor según su tipo
  const formatValue = (value: any, isLong = false) => {
    if (value === undefined || value === null) return '';
    
    if (valueIsObject) {
      return <pre className="text-xs overflow-auto max-h-40 bg-gray-50 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
    }
    
    if (typeof value === 'string') {
      if (isLong) {
        return <div className="whitespace-pre-wrap break-words">{value}</div>;
      }
      return isShowingValue ? value : truncateText(value);
    }
    
    return String(value);
  };
  
  return (
    <Card className={`border shadow-sm hover:shadow transition-all duration-200 ${field.hasValue ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}>
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
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">{field.name}</CardTitle>
            <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(field.type)}`}>
              {getTypeLabel(field.type)}
            </span>
          </div>
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
                  <SelectItem value="0">Texto</SelectItem>
                  <SelectItem value="1">Número</SelectItem>
                  <SelectItem value="2">Fecha</SelectItem>
                  <SelectItem value="3">Selección</SelectItem>
                  <SelectItem value="4">Checkbox</SelectItem>
                  <SelectItem value="5">Texto largo</SelectItem>
                  <SelectItem value="-1">Sistema</SelectItem>
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
            {field.description && (
              <div className="flex items-start space-x-2 text-sm text-gray-600 mt-2">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>{field.description}</div>
              </div>
            )}
            
            {field.required && (
              <div className="flex items-center mt-2">
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Requerido
                </span>
              </div>
            )}
            
            {field.hasValue && field.value !== undefined && field.value !== null && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Tag className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    Valor:
                  </h4>
                  {(isLongText || valueIsObject) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleShowValue} 
                      className="h-6 text-xs p-0 px-2"
                    >
                      {isShowingValue ? 'Contraer' : 'Expandir'}
                    </Button>
                  )}
                </div>
                {isLoadingValue ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">Cargando...</span>
                  </div>
                ) : valueError ? (
                  <div className="text-sm text-red-500">{valueError}</div>
                ) : (
                  <div className={`text-sm ${isLongText ? 'whitespace-pre-wrap' : ''}`}>
                    {isLongText ? (
                      <div className={`${isShowingValue ? 'max-h-60 overflow-y-auto' : 'max-h-10 overflow-hidden'}`}>
                        {formatValue(field.value, isShowingValue)}
                      </div>
                    ) : (
                      formatValue(field.value)
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="text-xs text-gray-400 mt-3">
              ID: {field.id} • Última actualización: {new Date(field.updatedAt).toLocaleString()}
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
