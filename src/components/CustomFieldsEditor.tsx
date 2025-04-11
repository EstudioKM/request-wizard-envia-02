
import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, List, Grid, Search, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
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
  hasValue?: boolean;
}

const CustomFieldsEditor = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [filteredFields, setFilteredFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingValues, setIsLoadingValues] = useState(false);
  const [isLoadingDescriptions, setIsLoadingDescriptions] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editableResponse, setEditableResponse] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [hideEmptyFields, setHideEmptyFields] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomFields();
  }, []);

  useEffect(() => {
    // Filtrar por término de búsqueda y por campos vacíos si está habilitado
    let filtered = customFields;
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        field => field.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (hideEmptyFields) {
      filtered = filtered.filter(field => field.hasValue);
    }
    
    setFilteredFields(filtered);
  }, [searchTerm, customFields, hideEmptyFields]);

  const fetchCustomFields = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener la lista de campos personalizados
      const response = await http.get('https://app.estudiokm.com.ar/api/accounts/custom_fields', {
        headers: {
          'accept': 'application/json',
          'X-ACCESS-TOKEN': '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75'
        }
      });

      // Transformar la respuesta para incluir descripciones y otra información relevante
      const fields = response.data.map((field: any) => ({
        id: field.id,
        accountId: field.account_id || 1,
        name: field.name,
        type: field.type || '0',
        description: field.description || '',
        options: field.options,
        required: field.required,
        order: field.order,
        createdAt: field.created_at || new Date().toISOString(),
        updatedAt: field.updated_at || new Date().toISOString(),
        hasValue: false  // Se actualizará cuando se carguen los valores
      }));

      setCustomFields(fields);
      setFilteredFields(hideEmptyFields ? [] : fields);
      
      toast({
        title: 'Campos cargados',
        description: `Se cargaron ${fields.length} campos personalizados`,
      });

      // Cargar automáticamente los valores de los campos
      if (fields.length > 0) {
        await fetchAllFieldValues(fields);
      }
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
              // Intentar con el primer endpoint
              let response;
              let success = false;
              
              try {
                response = await http.get(`https://app.estudiokm.com.ar/api/accounts/bot_fields/${field.id}`, {
                  headers: {
                    'accept': 'application/json',
                    'X-ACCESS-TOKEN': '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75'
                  }
                });
                success = true;
              } catch (err) {
                console.log(`Primer endpoint falló para campo ${field.id}, intentando con el segundo endpoint...`);
                // Si falla, intentar con el segundo endpoint
                response = await http.get(`https://app.estudiokm.com.ar/api/accounts/custom_fields/name/${field.id}`, {
                  headers: {
                    'accept': 'application/json',
                    'X-ACCESS-TOKEN': '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75'
                  }
                });
                success = true;
              }
              
              if (success) {
                // Actualizar el campo con su valor
                const fieldIndex = updatedFields.findIndex(f => f.id === field.id);
                if (fieldIndex !== -1) {
                  const hasValue = response.data.value !== null && 
                                  response.data.value !== undefined && 
                                  response.data.value !== "";
                                  
                  updatedFields[fieldIndex] = {
                    ...updatedFields[fieldIndex],
                    value: response.data.value,
                    hasValue: hasValue
                  };
                }
              }
            } catch (error) {
              console.error(`Error al cargar el valor para el campo ${field.id} con ambos endpoints:`, error);
              // No detenemos el proceso si un campo falla
            } finally {
              completedCount++;
              setLoadingProgress(Math.round((completedCount / fields.length) * 100));
            }
          })
        );
        
        // Actualizamos el estado con los valores cargados hasta el momento
        setCustomFields([...updatedFields]);
        
        // Aplicamos el filtro si está habilitado
        if (hideEmptyFields) {
          setFilteredFields(updatedFields.filter(f => f.hasValue));
        } else {
          setFilteredFields([...updatedFields]);
        }
      }
      
      const fieldsWithValues = updatedFields.filter(f => f.hasValue).length;
      
      toast({
        title: 'Valores cargados',
        description: `Se cargaron valores para ${fieldsWithValues} de ${fields.length} campos`,
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
    
    if (hideEmptyFields) {
      setFilteredFields(updatedData.filter((f: CustomField) => f.hasValue));
    } else {
      setFilteredFields(updatedData);
    }
    
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
      updatedAt: new Date().toISOString(),
      hasValue: false
    };
    
    setCustomFields([...customFields, newField]);
    
    if (!hideEmptyFields) {
      setFilteredFields([...filteredFields, newField]);
    }
    
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
          <div className="space-y-6">
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="border border-gray-200">
                  <CardHeader className="p-4">
                    <Skeleton className="h-5 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  <Label htmlFor="hide-empty-toggle" className="text-sm">Ocultar vacíos</Label>
                  <Switch 
                    id="hide-empty-toggle" 
                    checked={hideEmptyFields} 
                    onCheckedChange={setHideEmptyFields}
                  />
                </div>
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
              {hideEmptyFields && ` (ocultando campos vacíos)`}
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
