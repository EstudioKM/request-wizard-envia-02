
import React, { memo } from 'react';
import { PlusCircle, Edit, Tag, FileText, Calendar, Hash, CheckSquare, AlignLeft, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { http } from '@/lib/http-client';
import { toast } from "sonner";

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

const TableItem = memo(({ field, onClick, getTypeIcon, getTypeColor, getTypeLabel, truncateText }: { 
  field: CustomField; 
  onClick: () => void;
  getTypeIcon: (type: string) => JSX.Element;
  getTypeColor: (type: string) => string;
  getTypeLabel: (type: string) => string;
  truncateText: (text: any, maxLength?: number) => string;
}) => (
  <TableRow 
    key={field.id} 
    onClick={onClick} 
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
  </TableRow>
));

const CustomFieldsGrid: React.FC<CustomFieldsGridProps> = ({ 
  fields, 
  onUpdate, 
  isEditable,
  onAddField
}) => {
  const [selectedField, setSelectedField] = React.useState<CustomField | null>(null);
  const [editedValue, setEditedValue] = React.useState<string>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();
  
  const sortedFields = React.useMemo(() => 
    [...fields].sort((a, b) => a.type.localeCompare(b.type)), 
    [fields]
  );
  
  const handleFieldUpdate = (updatedField: CustomField) => {
    const updatedFields = fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    );
    onUpdate(updatedFields);
  };
  
  const handleFieldClick = (field: CustomField) => {
    setSelectedField(field);
    if (field.value !== undefined && field.value !== null) {
      setEditedValue(typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value));
    } else {
      setEditedValue('');
    }
    setIsEditDialogOpen(true);
  };
  
  const handleSaveValue = async () => {
    if (!selectedField) return;
    
    setIsSaving(true);
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('estudio-km-token');
      
      if (!token) {
        throw new Error('No token available. Please log in again.');
      }
      
      console.log(`Saving value for field ${selectedField.id} with token: ${token.substring(0, 10)}...`);
      
      await http.post(`/api-proxy/api/accounts/bot_fields/${selectedField.id}`, 
        `value=${encodeURIComponent(editedValue)}`,
        {
          headers: {
            'accept': 'application/json',
            'x-access-token': token,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
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
        description: "El valor del campo ha sido actualizado correctamente en el servidor",
        variant: "default",
        className: "bg-green-50 text-green-800 border-green-200"
      });
    } catch (error) {
      console.error("Error al guardar valor en el servidor:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo actualizar el valor del campo en el servidor",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case '0': return <FileText className="h-5 w-5 text-blue-600" />;
      case '1': return <Hash className="h-5 w-5 text-green-600" />;
      case '2': return <Calendar className="h-5 w-5 text-purple-600" />;
      case '3': return <ArrowUpDown className="h-5 w-5 text-amber-600" />;
      case '4': return <CheckSquare className="h-5 w-5 text-indigo-600" />;
      case '5': return <AlignLeft className="h-5 w-5 text-pink-600" />;
      default: return <Tag className="h-5 w-5 text-gray-600" />;
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
      case '0': return 'field-type-0';
      case '1': return 'field-type-1';
      case '2': return 'field-type-2';
      case '3': return 'field-type-3';
      case '4': return 'field-type-4';
      case '5': return 'field-type-5';
      case '-1': return 'field-type--1';
      default: return 'field-type--1';
    }
  };
  
  const truncateText = (text: any, maxLength = 80) => {
    if (text === undefined || text === null) return '—';
    
    let textStr = typeof text === 'object' ? '[Object]' : String(text);
    
    if (textStr.length <= maxLength) return textStr;
    return textStr.substring(0, maxLength) + '...';
  };
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-gray-200 text-center">
      <div className="text-gray-400 text-6xl mb-4">📋</div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">No hay campos disponibles</h3>
      <p className="text-gray-500 text-center max-w-md mb-4">
        No se encontraron campos que coincidan con los criterios de búsqueda o que tengan valores asignados.
      </p>
      {isEditable && (
        <Button
          variant="outline"
          className="mt-2 border-dashed border-2 bg-white hover:bg-gray-50"
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
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-1/4 font-semibold">Nombre del campo</TableHead>
                <TableHead className="w-1/12 font-semibold">Tipo</TableHead>
                <TableHead className="w-3/4 font-semibold">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFields.map((field) => (
                <TableItem 
                  key={field.id}
                  field={field}
                  onClick={() => handleFieldClick(field)}
                  getTypeIcon={getTypeIcon}
                  getTypeColor={getTypeColor}
                  getTypeLabel={getTypeLabel}
                  truncateText={truncateText}
                />
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
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedField && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {getTypeIcon(selectedField.type)} 
                  {selectedField.name}
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
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
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
                    className="bg-primary hover:bg-primary/90"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
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
