
import React, { useState } from 'react';
import { Edit, Save, X, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [isShowingValue, setIsShowingValue] = useState(false);
  const [fieldValue, setFieldValue] = useState<any>(null);
  const [isLoadingValue, setIsLoadingValue] = useState(false);
  const [valueError, setValueError] = useState<string | null>(null);
  const { toast } = useToast();
  
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
  
  const toggleShowValue = async () => {
    if (isShowingValue) {
      setIsShowingValue(false);
      return;
    }
    
    setIsShowingValue(true);
    setIsLoadingValue(true);
    setValueError(null);
    
    try {
      const response = await http.get(`https://app.estudiokm.com.ar/api/accounts/bot_fields/${field.id}`, {
        headers: {
          'accept': 'application/json',
          'X-ACCESS-TOKEN': '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75'
        }
      });
      
      setFieldValue(response.data);
      toast({
        title: 'Valor cargado',
        description: 'Se ha obtenido el valor del campo con éxito',
      });
    } catch (err: any) {
      console.error('Error al cargar el valor del campo:', err);
      setValueError(err.message || 'Error al cargar el valor del campo');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Error al cargar el valor del campo',
      });
    } finally {
      setIsLoadingValue(false);
    }
  };

  // Determinar si es un texto largo para mostrar con formato adecuado
  const isLongText = field.type === '5';
  
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tipo:</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(field.type)}`}>
                {getTypeLabel(field.type)}
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
            
            {isShowingValue && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Valor:</h4>
                {isLoadingValue ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">Cargando...</span>
                  </div>
                ) : valueError ? (
                  <div className="text-sm text-red-500">{valueError}</div>
                ) : (
                  <div className={`text-sm ${isLongText ? 'whitespace-pre-wrap' : ''}`}>
                    {typeof fieldValue === 'object' 
                      ? JSON.stringify(fieldValue, null, 2) 
                      : String(fieldValue)}
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
            <Button
              variant="outline"
              size="sm"
              onClick={toggleShowValue}
              className={isShowingValue ? "text-amber-500 hover:text-amber-600" : ""}
            >
              {isLoadingValue ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isShowingValue ? (
                <EyeOff className="h-4 w-4 mr-1" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              {isShowingValue ? "Ocultar valor" : "Ver valor"}
            </Button>
            
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
