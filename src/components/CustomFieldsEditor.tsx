
import React, { useState, useEffect } from 'react';
import { Search, RefreshCcw, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [hideEmptyFields, setHideEmptyFields] = useState(true);
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
    
    // Get the token from localStorage
    const token = localStorage.getItem('estudio-km-token');
    
    if (!token) {
      setError('No se encontró un token válido. Por favor inicia sesión nuevamente.');
      setIsLoading(false);
      return;
    }

    try {
      let fields;
      
      try {
        const response = await http.get('https://app.estudiokm.com.ar/api/accounts/custom_fields', {
          headers: {
            'accept': 'application/json',
            'X-ACCESS-TOKEN': token
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
        
        if (apiError.status === 429) {
          toast({
            variant: 'destructive',
            title: 'Límite de solicitudes excedido',
            description: 'Esperando un momento antes de reintentar...',
          });
          
          await sleep(3000);
          return fetchCustomFields();
        }
        
        throw apiError;
      }

      setCustomFields(fields);
      setFilteredFields(fields);
      
      if (fields.length > 0) {
        await fetchAllFieldValues(fields, token);
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

  const fetchAllFieldValues = async (fields: CustomField[], token: string) => {
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
      const chunkSize = 5;
      
      for (let i = 0; i < fields.length; i += chunkSize) {
        const chunk = fields.slice(i, i + chunkSize);
        const promises = chunk.map(async (field) => {
          try {
            let response;
            let success = false;
            
            try {
              response = await http.get(`https://app.estudiokm.com.ar/api/accounts/bot_fields/${field.id}`, {
                headers: {
                  'accept': 'application/json',
                  'X-ACCESS-TOKEN': token
                }
              });
              success = true;
            } catch (err) {
              response = await http.get(`https://app.estudiokm.com.ar/api/accounts/custom_fields/name/${field.id}`, {
                headers: {
                  'accept': 'application/json',
                  'X-ACCESS-TOKEN': token
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
          }
          
          return null;
        });
        
        await Promise.all(promises);
        
        setCustomFields([...updatedFields]);
        setFilteredFields([...updatedFields]);
        
        await sleep(200);
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

  const handleUpdateFields = (updatedData: CustomField[]) => {
    setCustomFields(updatedData);
    setFilteredFields(updatedData);
    
    toast({
      title: 'Campos actualizados',
      description: 'Los campos han sido modificados localmente',
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
    setFilteredFields([...filteredFields, newField]);
    
    toast({
      title: 'Campo añadido',
      description: 'Se añadió un nuevo campo personalizado',
    });
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-gray-200 text-center">
      <div className="text-gray-400 text-6xl mb-4">📋</div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">No hay campos disponibles</h3>
      <p className="text-gray-500 text-center max-w-md mb-4">
        No se encontraron campos que coincidan con los criterios de búsqueda o que tengan valores asignados.
      </p>
      <Button
        variant="outline"
        className="mt-2 border-dashed border-2 bg-white hover:bg-gray-50"
        onClick={addNewField}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Añadir nuevo campo
      </Button>
    </div>
  );

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0 pb-6">
        <div className="flex justify-between items-center mb-1">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Campos personalizados
          </CardTitle>
          <Button 
            size="sm" 
            onClick={fetchCustomFields}
            disabled={isLoading || isLoadingValues}
            className={isLoading || isLoadingValues ? "bg-gray-300" : "bg-primary hover:bg-primary/90"}
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
        </div>
        <p className="text-gray-500 text-sm">
          Gestiona los campos personalizados y sus valores asociados
        </p>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {error ? (
          <div className="bg-red-50 p-4 rounded-xl text-red-800 border border-red-200 mb-4">
            <p className="font-medium mb-1">Error</p>
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {isLoadingValues && (
              <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-blue-800 font-medium">Cargando valores de campos</span>
                  <span className="text-sm font-medium">{loadingProgress}%</span>
                </div>
                <Progress value={loadingProgress} className="h-2" />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 bg-gray-50 p-4 rounded-xl mb-6">
              <div className="relative w-full sm:w-auto min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar campos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 bg-white"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Switch 
                  id="hide-empty-toggle" 
                  checked={hideEmptyFields} 
                  onCheckedChange={setHideEmptyFields}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="hide-empty-toggle" className="text-sm font-medium cursor-pointer">
                  Ocultar campos sin valor
                </Label>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-6">
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
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
            ) : filteredFields.length > 0 ? (
              <CustomFieldsGrid
                fields={filteredFields}
                onUpdate={handleUpdateFields}
                isEditable={true}
                onAddField={addNewField}
              />
            ) : (
              renderEmptyState()
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomFieldsEditor;
