import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Trash2, Eye, EyeOff, Loader2, FileText, Tag, ChevronDown, ChevronUp, PenSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedValue, setEditedValue] = useState<string>('');
  const { toast } = useToast();
  
  useEffect(() => {
    // Actualizar el campo editado cuando cambia el campo original
    setEditedField(field);
    // Inicializar el valor editado
    if (field.value !== undefined && field.value !== null) {
      setEditedValue(typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : String(field.value));
    }
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
  
  const handleOpenEditDialog = () => {
    if (!isEditable) return;
    
    if (field.value !== undefined && field.value !== null) {
      setEditedValue(typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : String(field.value));
    } else {
      setEditedValue('');
    }
    
    setIsEditDialogOpen(true);
  };
  
  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleSaveValue = () => {
    let parsedValue = editedValue;
    
    try {
      onUpdate({
        ...field,
        value: parsedValue,
        hasValue: true,
        updatedAt: new Date().toISOString()
      });
      
      setIsEditDialogOpen(false);
      
      toast({
        title: "Valor actualizado",
        description: "El valor del campo ha sido actualizado correctamente"
      });
    } catch (error) {
      console.error("Error al guardar valor:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo actualizar el valor del campo",
        variant: "destructive"
      });
    }
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
  
  // Vista previa del valor (para tarjeta colapsada)
  const getValuePreview = () => {
    if (field.value === undefined || field.value === null) return 'Sin valor';
    
    if (valueIsObject) return 'Objeto JSON';
    
    if (typeof field.value === 'string') {
      return truncateText(field.value, 50);
    }
    
    return String(field.value);
  };
  
  // Determinar un icono adecuado basado en el tipo de campo
  const getFieldIcon = () => {
    switch (field.type) {
      case '0': return <FileText className="h-4 w-4 text-blue-600" />;
      case '1': return <span className="text-green-600 font-medium">#</span>;
      case '2': return <span className="text-purple-600">📅</span>;
      case '3': return <span className="text-amber-600">✓</span>;
      case '4': return <span className="text-indigo-600">☑</span>;
      case '5': return <span className="text-pink-600">📝</span>;
      default: return <Tag className="h-4 w-4 text-gray-600" />;
    }
  };
  
  return (
    <>
      <Collapsible 
        open={isExpanded} 
        onOpenChange={setIsExpanded}
        className="border rounded-lg shadow-sm hover:shadow transition-all duration-200 mb-4 bg-white overflow-hidden"
      >
        <div 
          className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
          onClick={handleCardClick}
        >
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                {isExpanded ? 
                  <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                }
              </Button>
            </CollapsibleTrigger>
            <div>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                {getFieldIcon()} {field.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(field.type)}`}>
                  {getTypeLabel(field.type)}
                </span>
                {field.required && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    Requerido
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditable && field.hasValue && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditDialog();
                }}
                className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <PenSquare className="h-4 w-4 mr-1" />
                Editar valor
              </Button>
            )}
          </div>
        </div>
        
        {!isExpanded && field.hasValue && (
          <div className="px-4 py-2 text-sm text-gray-600 flex items-center gap-2 border-t border-gray-100 bg-gray-50">
            <Tag className="h-3.5 w-3.5 text-gray-500" />
            <span className="font-medium">Valor:</span>
            <span className="text-gray-700">{getValuePreview()}</span>
          </div>
        )}
        
        <CollapsibleContent>
          <CardContent className="p-4 space-y-3">
            {field.description && (
              <div className="flex items-start space-x-2 text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-md">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>{field.description}</div>
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
                      {isShowingValue ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 mr-1" />
                          Contraer
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Expandir
                        </>
                      )}
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
          </CardContent>
          
          <CardFooter className="p-3 flex justify-end space-x-2 border-t border-gray-100 bg-gray-50">
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleOpenEditDialog}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <PenSquare className="h-4 w-4 mr-1" />
                      Editar valor
                    </Button>
                  </>
                )}
              </>
            )}
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Diálogo para editar valores */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFieldIcon()} Editar valor: {field.name}
            </DialogTitle>
            <DialogDescription>
              {field.description || 'Modifica el valor de este campo personalizado'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {field.type === '5' || isLongText ? (
              <Textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                rows={15}
                className="w-full font-mono"
                placeholder="Ingrese el valor del campo"
              />
            ) : valueIsObject ? (
              <Textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                rows={15}
                className="w-full font-mono text-sm"
                placeholder="Formato JSON"
              />
            ) : (
              <Input
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full"
                placeholder="Ingrese el valor del campo"
              />
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveValue}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomFieldCard;
