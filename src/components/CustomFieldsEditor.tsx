
import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, List, Grid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
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
}

const CustomFieldsEditor = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editableResponse, setEditableResponse] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'grid'>('grid');
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomFields();
  }, []);

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

      setCustomFields(response.data);
      toast({
        title: 'Campos cargados',
        description: `Se cargaron ${response.data.length} campos personalizados`,
      });
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

  const handleUpdateFields = (updatedData: any) => {
    setCustomFields(updatedData);
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
      type: 'text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCustomFields([...customFields, newField]);
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
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Actualizar'}
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
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">
                {customFields.length} campos encontrados
              </Label>
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
            
            {viewMode === 'json' ? (
              <JsonViewer 
                data={customFields} 
                onUpdate={editableResponse ? handleUpdateFields : undefined} 
                isEditable={editableResponse}
              />
            ) : (
              <CustomFieldsGrid
                fields={customFields}
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
