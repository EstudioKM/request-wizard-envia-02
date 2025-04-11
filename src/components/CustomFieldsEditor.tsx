import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, RefreshCcw, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { http } from '@/lib/http-client';
import CustomFieldsGrid from './CustomFieldsGrid';
import { MOCK_CUSTOM_FIELDS } from '@/data/mockData';

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editableResponse, setEditableResponse] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hideEmptyFields, setHideEmptyFields] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [useMockData, setUseMockData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomFields();
  }, []);

  useEffect(() => {
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

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchCustomFields = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let fields;
      
      if (retryCount >= 3 || useMockData) {
        await sleep(1000);
        fields = [...MOCK_CUSTOM_FIELDS];
        
        if (!useMockData) {
          setUseMockData(true);
          toast({
            title: 'Usando datos de prueba',
            description: 'Demasiados intentos fallidos. Se están usando datos de ejemplo.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Datos de prueba cargados',
            description: `Se cargaron ${fields.length} campos de prueba`,
          });
        }
      } else {
        try {
          const response = await http.get('https://app.estudiokm.com.ar/api/accounts/custom_fields', {
            headers: {
              'accept': 'application/json',
              'X-ACCESS-TOKEN': '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75'
            }
          });
          
          fields = response.data.map((field: any) => ({
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
            hasValue: false
          }));
          
          toast({
            title: 'Campos cargados',
            description: `Se cargaron ${fields.length} campos personalizados`,
          });
        } catch (apiError: any) {
          console.error('Error en API:', apiError);
          setRetryCount(prev => prev + 1);
          
          if (apiError.status === 429) {
            toast({
              variant: 'warning',
              title: 'Límite de solicitudes excedido',
              description: 'Esperando un momento antes de reintentar...',
            });
            
            await sleep(3000);
            return fetchCustomFields();
          }
          
          throw apiError;
        }
      }

      setCustomFields(fields);
      setFilteredFields(hideEmptyFields ? [] : fields);
      
      if (fields.length > 0) {
        await fetchAllFieldValues(fields);
      }
    } catch (err: any) {
      console.error('Error al cargar campos personalizados:', err);
      setError(err.message || 'Error al cargar campos personalizados');
      
      if (!useMockData) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Error al cargar campos. ¿Desea usar datos de prueba?',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setUseMockData(true);
                fetchCustomFields();
              }}
              className="bg-white"
            >
              Usar datos de prueba
            </Button>
          ),
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message || 'Error al cargar campos personalizados',
        });
      }
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
      if (useMockData) {
        await sleep(1500);
        
        fields.forEach((field, index) => {
          const hasValue = index % 10 !== 0;
          
          updatedFields[index] = {
            ...field,
            value: hasValue ? getMockValueForType(field.type, field.name) : null,
            hasValue: hasValue
          };
          
          completedCount++;
          setLoadingProgress(Math.round((completedCount / fields.length) * 100));
        });
        
        setCustomFields([...updatedFields]);
        
        if (hideEmptyFields) {
          setFilteredFields(updatedFields.filter(f => f.hasValue));
        } else {
          setFilteredFields([...updatedFields]);
        }
        
        const fieldsWithValues = updatedFields.filter(f => f.hasValue).length;
        
        toast({
          title: 'Valores cargados',
          description: `Se cargaron valores para ${fieldsWithValues} de ${fields.length} campos`,
        });
        
        setIsLoadingValues(false);
        return;
      }
      
      const chunkSize = 2;
      
      for (let i = 0; i < fields.length; i += chunkSize) {
        const chunk = fields.slice(i, i + chunkSize);
        
        for (const field of chunk) {
          try {
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
              
              await sleep(500);
              
              response = await http.get(`https://app.estudiokm.com.ar/api/accounts/custom_fields/name/${field.id}`, {
                headers: {
                  'accept': 'application/json',
                  'X-ACCESS-TOKEN': '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75'
                }
              });
              success = true;
            }
            
            if (success) {
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
          } finally {
            completedCount++;
            setLoadingProgress(Math.round((completedCount / fields.length) * 100));
            
            await sleep(1000);
          }
          
          setCustomFields([...updatedFields]);
          
          if (hideEmptyFields) {
            setFilteredFields(updatedFields.filter(f => f.hasValue));
          } else {
            setFilteredFields([...updatedFields]);
          }
        }
      }
      
      const fieldsWithValues = updatedFields.filter(f => f.hasValue).length;
      
      toast({
        title: 'Valores cargados',
        description: `Se cargaron valores para ${fieldsWithValues} de ${fields.length} campos`,
      });
    } catch (err) {
      console.error('Error al cargar los valores de los campos:', err);
      
      if (!useMockData) {
        toast({
          variant: 'destructive',
          title: 'Error en carga de valores',
          description: '¿Desea usar datos de prueba?',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setUseMockData(true);
                fetchCustomFields();
              }}
              className="bg-white"
            >
              Usar datos de prueba
            </Button>
          ),
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Ocurrieron errores al cargar algunos valores',
        });
      }
    } finally {
      setIsLoadingValues(false);
    }
  };

  const getMockValueForType = (type: string, name: string): any => {
    switch (type) {
      case '0':
        return name.includes('Email') ? 'info@estudiokm.com.ar' : 
               name.includes('Nombre') ? 'Estudio KM' :
               name.includes('Dirección') ? 'Av. Corrientes 1234, CABA' :
               name.includes('Teléfono') ? '+54 11 4567-8900' :
               `Valor de ejemplo para ${name}`;
      case '1':
        return Math.floor(Math.random() * 1000);
      case '2':
        return new Date().toISOString().split('T')[0];
      case '3':
        return ['Opción A', 'Opción B', 'Opción C'][Math.floor(Math.random() * 3)];
      case '4':
        return Math.random() > 0.5;
      case '5':
        return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies ultrices, 
                nunc nisl aliquam nunc, vitae aliquam nunc nisl eget nunc. Nullam auctor, nisl eget ultricies ultrices,
                nunc nisl aliquam nunc, vitae aliquam nunc nisl eget nunc. Este es un texto largo de ejemplo para ${name}.`;
      default:
        return `Valor de ejemplo para tipo ${type}`;
    }
  };

  const handleUpdateFields = (updatedData: CustomField[]) => {
    setCustomFields(updatedData);
    
    if (hideEmptyFields) {
      setFilteredFields(updatedData.filter(f => f.hasValue));
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
  };

  const addNewField = () => {
    const newField: CustomField = {
      id: Date.now(),
      accountId: customFields.length > 0 ? customFields[0].accountId : 1,
      name: 'Nuevo Campo',
      type: '0',
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

  const toggleMockData = () => {
    setUseMockData(!useMockData);
    setRetryCount(0);
    fetchCustomFields();
  };

  return (
    <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🔧</span> 
              Campos Personalizados
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Visualiza y edita los campos personalizados del asistente virtual
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleMockData}
              className="bg-white"
            >
              {useMockData ? 'Usar API Real' : 'Usar Datos de Prueba'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCustomFields}
              disabled={isLoading || isLoadingValues}
              className="bg-white"
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
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800 border border-red-200">
            <p className="font-medium mb-1">Error</p>
            {error}
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleMockData}
                className="bg-white"
              >
                {useMockData ? 'Intentar con API Real' : 'Usar Datos de Prueba'}
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Cargando campos personalizados...</p>
            </div>
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-1/4"><Skeleton className="h-5 w-32" /></TableHead>
                    <TableHead className="w-1/12"><Skeleton className="h-5 w-12" /></TableHead>
                    <TableHead className="w-1/2"><Skeleton className="h-5 w-20" /></TableHead>
                    <TableHead className="w-1/12 text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {isLoadingValues && (
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-blue-800 font-medium">Cargando valores de campos</span>
                  <span className="text-sm font-medium">{loadingProgress}%</span>
                </div>
                <Progress value={loadingProgress} className="h-2" />
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-gray-50 p-4 rounded-lg">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar campos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border-gray-200"
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
                  <Label htmlFor="editable-toggle" className="text-sm">Modo edición</Label>
                  <Switch 
                    id="editable-toggle" 
                    checked={editableResponse} 
                    onCheckedChange={setEditableResponse}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-4">
              <div className="text-sm font-medium flex items-center justify-between">
                <span>
                  {filteredFields.length} campos encontrados
                  {searchTerm && ` para "${searchTerm}"`}
                  {hideEmptyFields && ` (ocultando campos vacíos)`}
                </span>
                <Badge variant="outline" className="bg-white">
                  {editableResponse ? 'Modo edición activo' : 'Modo visualización'}
                </Badge>
              </div>
            </div>
            
            <CustomFieldsGrid
              fields={filteredFields}
              onUpdate={handleUpdateFields}
              isEditable={editableResponse}
              onAddField={addNewField}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomFieldsEditor;
