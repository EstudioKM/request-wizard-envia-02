
import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, List, Grid, Search, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { http } from '@/lib/http-client';
import JsonViewer from '@/components/JsonViewer';
import CustomFieldsGrid from './CustomFieldsGrid';

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

const CustomFieldsEditor = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [filteredFields, setFilteredFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingValues, setIsLoadingValues] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editableResponse, setEditableResponse] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomFields();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFields(customFields);
    } else {
      const filtered = customFields.filter(
        field => field.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFields(filtered);
    }
  }, [searchTerm, customFields]);

  const fetchCustomFields = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await http.get('https://app.estudiokm.com.ar/api/accounts/custom_fields', {
        headers: {
          'accept': 'application/json',
          'X-ACCESS-TOKEN': '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75'
        }
      });

      // Transformar la respuesta en el formato que esperamos
      const fields = response.data.map((field: any) => ({
        id: field.id,
        accountId: 1, // Default value
        name: field.name,
        type: field.type,
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      setCustomFields(fields);
      setFilteredFields(fields);
      toast({
        title: 'Campos cargados',
        description: `Se cargaron ${fields.length} campos personalizados`,
      });

      // Cargar automáticamente los valores de los campos
      fetchAllFieldValues(fields);
    } catch (err: any) {
      console.error('Error al cargar campos personalizados:', err);
      setError(err.message || 'Error al cargar campos personalizados');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Error al cargar campos personalizados',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllFieldValues = async (fields: CustomField[]) => {
    if (fields.length === 0) return;
    
    setIsLoadingValues(true);
    setLoadingProgress(0);
    
    const updatedFields = [...fields];
    let completedCount = 0;
    
    toast({
      title: 'Cargando valores',
      description: `Obteniendo valores para ${fields.length} campos...`,
    });
    
    try {
      // Utilizamos Promise.all para manejar múltiples solicitudes en paralelo
      // Dividimos en grupos para no sobrecargar el servidor
      const chunkSize = 5;
      for (let i = 0; i < fields.length; i += chunkSize) {
        const chunk = fields.slice(i, i + chunkSize);
        
        await Promise.all(
          chunk.map(async (field, index) => {
            try {
              const response = await http.get(`https://app.estudiokm.com.ar/api/accounts/bot_fields/${field.id}`, {
                headers: {
                  'accept': 'application/json',
                  'X-ACCESS-TOKEN': '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75'
                }
              });
              
              // Actualizar el campo con su valor
              const fieldIndex = updatedFields.findIndex(f => f.id === field.id);
              if (fieldIndex !== -1) {
                updatedFields[fieldIndex] = {
                  ...updatedFields[fieldIndex],
                  value: response.data.value
                };
              }
            } catch (error) {
              console.error(`Error al cargar el valor para el campo ${field.id}:`, error);
              // No detenemos el proceso si un campo falla
            } finally {
              completedCount++;
              setLoadingProgress(Math.round((completedCount / fields.length) * 100));
            }
          })
        );
        
        // Actualizamos el estado con los valores cargados hasta el momento
        setCustomFields([...updatedFields]);
        setFilteredFields([...updatedFields]);
      }
      
      toast({
        title: 'Valores cargados',
        description: `Se cargaron los valores de ${completedCount} campos`,
      });
    } catch (err) {
      console.error('Error al cargar los valores de los campos:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrieron errores al cargar algunos valores',
      });
    } finally {
      setIsLoadingValues(false);
    }
  };

  const handleUpdateFields = (updatedData: any) => {
    setCustomFields(updatedData);
    setFilteredFields(updatedData);
    toast({
      title: 'Campos actualizados',
      description: 'Los campos han sido modificados localmente',
    });
  };

  const handleSaveChanges = async () => {
    toast({
      title: 'Guardando cambios',
      description: 'Implementación pendiente para guardar en el servidor',
    });
    // Aquí se implementaría la lógica para guardar los cambios al servidor
  };

  const addNewField = () => {
    const newField: CustomField = {
      id: Date.now(), // Temporal ID
      accountId: customFields.length > 0 ? customFields[0].accountId : 1,
      name: 'Nuevo Campo',
      type: '0', // Tipo texto por defecto
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCustomFields([...customFields, newField]);
    setFilteredFields([...filteredFields, newField]);
    toast({
      title: 'Campo añadido',
      description: 'Se añadió un nuevo campo personalizado',
    });
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'json' ? 'grid' : 'json');
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">
              Campos Personalizados
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Visualiza y edita los campos personalizados de EstudioKM
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCustomFields}
              disabled={isLoading || isLoadingValues}
            >
              {(isLoading || isLoadingValues) ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Actualizar
                </>
              )}
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleSaveChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-6">
        {error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            {error}
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando campos personalizados...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoadingValues && (
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Cargando valores de campos ({loadingProgress}%)</span>
                  <span className="text-sm font-medium">{loadingProgress}%</span>
                </div>
                <Progress value={loadingProgress} className="h-2" />
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar campos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="editable-toggle" className="text-sm">Editar</Label>
                  <Switch 
                    id="editable-toggle" 
                    checked={editableResponse} 
                    onCheckedChange={setEditableResponse}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleViewMode}
                  className="flex items-center space-x-1"
                >
                  {viewMode === 'json' ? (
                    <>
                      <Grid size={16} />
                      <span>Vista Tarjetas</span>
                    </>
                  ) : (
                    <>
                      <List size={16} />
                      <span>Vista JSON</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <Label className="text-sm font-medium block mt-4">
              {filteredFields.length} campos encontrados
              {searchTerm && ` para "${searchTerm}"`}
            </Label>
            
            {viewMode === 'json' ? (
              <JsonViewer 
                data={filteredFields} 
                onUpdate={editableResponse ? handleUpdateFields : undefined} 
                isEditable={editableResponse}
              />
            ) : (
              <CustomFieldsGrid
                fields={filteredFields}
                onUpdate={handleUpdateFields}
                isEditable={editableResponse}
                onAddField={addNewField}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomFieldsEditor;
