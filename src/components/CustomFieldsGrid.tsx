
import React from 'react';
import { PlusCircle, Edit, Tag, FileText, Calendar, Hash, CheckSquare, AlignLeft, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  const [selectedField, setSelectedField] = React.useState<CustomField | null>(null);
  const [editedValue, setEditedValue] = React.useState<string>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { toast } = useToast();
  
  // Sort fields by type for better organization
  const sortedFields = [...fields].sort((a, b) => a.type.localeCompare(b.type));
  
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
  
  const handleEditClick = (field: CustomField) => {
    if (!isEditable) return;
    
    setSelectedField(field);
    if (field.value !== undefined && field.value !== null) {
      setEditedValue(typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value));
    } else {
      setEditedValue('');
    }
    setIsEditDialogOpen(true);
  };
  
  const handleSaveValue = () => {
    if (!selectedField) return;
    
    try {
      const updatedField = {
        ...selectedField,
        value: editedValue,
        hasValue: true,
        updatedAt: new Date().toISOString()
      };
      
      handleFieldUpdate(updatedField);
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
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case '0': return <FileText className="h-4 w-4 text-blue-600" />;
      case '1': return <Hash className="h-4 w-4 text-green-600" />;
      case '2': return <Calendar className="h-4 w-4 text-purple-600" />;
      case '3': return <ArrowUpDown className="h-4 w-4 text-amber-600" />;
      case '4': return <CheckSquare className="h-4 w-4 text-indigo-600" />;
      case '5': return <AlignLeft className="h-4 w-4 text-pink-600" />;
      default: return <Tag className="h-4 w-4 text-gray-600" />;
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
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case '0': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case '1': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case '2': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case '3': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case '4': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case '5': return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      case '-1': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Truncate long text for table display
  const truncateText = (text: any, maxLength = 80) => {
    if (text === undefined || text === null) return '—';
    
    let textStr = typeof text === 'object' ? '[Object]' : String(text);
    
    if (textStr.length <= maxLength) return textStr;
    return textStr.substring(0, maxLength) + '...';
  };
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200 text-center">
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
  );
  
  const isLongText = selectedField?.type === '5' || 
    (typeof selectedField?.value === 'string' && selectedField?.value.length > 100);
  
  return (
    <div className="space-y-6">
      {fields.length > 0 ? (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-1/4">Nombre del campo</TableHead>
                <TableHead className="w-1/12">Tipo</TableHead>
                <TableHead className="w-1/2">Valor</TableHead>
                <TableHead className="w-1/12 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFields.map((field) => (
                <TableRow 
                  key={field.id} 
                  onClick={() => handleEditClick(field)} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(field.type)}
                      <span>{field.name}</span>
                      {field.required && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          Requerido
                        </Badge>
                      )}
                    </div>
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-1">{truncateText(field.description, 60)}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getTypeColor(field.type)}`}>
                      {getTypeLabel(field.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {field.hasValue ? (
                      <div className="max-w-md">
                        {truncateText(field.value)}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Sin valor</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditable && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(field);
                        }}
                        className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        renderEmptyState()
      )}
      
      {isEditable && fields.length > 0 && (
        <div className="flex justify-center mt-6">
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
      
      {/* Dialog for editing field values */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedField && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {getTypeIcon(selectedField.type)} 
                  Editar: {selectedField.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedField.description || 'Modifica el valor de este campo personalizado'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={`${getTypeColor(selectedField.type)}`}>
                    {getTypeLabel(selectedField.type)}
                  </Badge>
                  {selectedField.required && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Campo requerido
                    </Badge>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Información del campo</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ID:</span> {selectedField.id}
                    </div>
                    <div>
                      <span className="text-gray-500">Última actualización:</span> {new Date(selectedField.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Valor del campo</h3>
                  {isLongText ? (
                    <Textarea
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      rows={15}
                      className="w-full font-mono text-sm bg-white"
                      placeholder="Ingrese el valor del campo"
                    />
                  ) : (
                    <Input
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      className="w-full bg-white"
                      placeholder="Ingrese el valor del campo"
                    />
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex justify-between items-center border-t pt-4">
                <div className="text-xs text-gray-500">
                  {selectedField.hasValue ? "Este campo ya tiene un valor asignado." : "Este campo no tiene valor asignado."}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveValue} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Guardar cambios
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomFieldsGrid;
