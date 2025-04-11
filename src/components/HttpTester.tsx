import { useState } from 'react';
import { PlusCircle, Menu, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { http, RequestOptions } from '@/lib/http-client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface HeaderItem {
  id: string;
  name: string;
  value: string;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const HttpTester = () => {
  const [url, setUrl] = useState('https://app.estudiokm.com.ar/api/accounts/custom_fields');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { id: '1', name: 'accept', value: 'application/json' },
    { id: '2', name: 'X-ACCESS-TOKEN', value: '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75' }
  ]);
  const [body, setBody] = useState('');
  const [evaluateAllErrors, setEvaluateAllErrors] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHeaderOptions, setShowHeaderOptions] = useState<Record<string, boolean>>({});
  const [retries, setRetries] = useState(2);
  const [timeout, setTimeout] = useState(30000);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(true);

  const addHeader = () => {
    const newId = (headers.length + 1).toString();
    setHeaders([...headers, { id: newId, name: '', value: '' }]);
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(header => header.id !== id));
  };

  const updateHeader = (id: string, field: 'name' | 'value', value: string) => {
    setHeaders(headers.map(header => 
      header.id === id ? { ...header, [field]: value } : header
    ));
  };

  const toggleHeaderOptions = (id: string) => {
    setShowHeaderOptions({
      ...showHeaderOptions,
      [id]: !showHeaderOptions[id]
    });
  };

  const handleSubmit = async () => {
    if (!url) {
      toast({
        variant: 'destructive',
        title: 'URL requerida',
        description: 'Por favor ingrese una URL válida.'
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setErrorDetails(null);

    http.setProxyEnabled(useProxy);

    try {
      const headerObject: Record<string, string> = {};
      headers.forEach(header => {
        if (header.name && header.value) {
          headerObject[header.name] = header.value;
        }
      });

      const options: RequestOptions = {
        headers: headerObject,
        evaluateAllStatesAsErrors: evaluateAllErrors,
        retries: retries,
        timeout: timeout,
        mode: 'cors',
        credentials: 'omit',
      };

      let result;

      switch (method) {
        case 'GET':
          result = await http.get(url, options);
          break;
        case 'POST':
          result = await http.post(url, body ? JSON.parse(body) : undefined, options);
          break;
        case 'PUT':
          result = await http.put(url, body ? JSON.parse(body) : undefined, options);
          break;
        case 'PATCH':
          result = await http.patch(url, body ? JSON.parse(body) : undefined, options);
          break;
        case 'DELETE':
          result = await http.delete(url, options);
          break;
      }

      setResponse(result);
      toast({
        title: 'Solicitud exitosa',
        description: `Estado: ${result.status}`,
      });
    } catch (error: any) {
      console.error('Error en la solicitud:', error);
      setErrorDetails(
        `Tipo de error: ${error.name || 'Desconocido'}\n` +
        `Mensaje: ${error.message || 'Sin mensaje'}\n` +
        `Estado: ${error.status || 'N/A'}\n` +
        `¿Es problema de CORS?: ${error.message?.includes('CORS') || error.message?.includes('cross-origin') ? 'Posiblemente' : 'No se detecta'}`
      );
      
      setResponse({
        error: true,
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      toast({
        variant: 'destructive',
        title: 'Error en la solicitud',
        description: error.message || 'Error desconocido',
      });
      
      if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
        toast({
          variant: 'destructive',
          title: 'Error CORS detectado',
          description: 'Intenta habilitar el proxy para evitar problemas de CORS',
        });
      } else if (error.message?.includes('Failed to fetch') || error.status === 0) {
        toast({
          variant: 'destructive',
          title: 'Error de conexión',
          description: 'No se pudo conectar al servidor. Verifica la URL o tu conexión a internet.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testJsonPlaceholder = () => {
    setUrl('https://jsonplaceholder.typicode.com/posts/1');
    setMethod('GET');
    setHeaders([
      { id: '1', name: 'accept', value: 'application/json' }
    ]);
    setBody('');
  };

  const testEstudioKM = () => {
    setUrl('https://app.estudiokm.com.ar/api/accounts/custom_fields');
    setMethod('GET');
    setHeaders([
      { id: '1', name: 'accept', value: 'application/json' },
      { id: '2', name: 'X-ACCESS-TOKEN', value: '1330256.GzFpRpZKULHhFTun91Siftf93toXQImohKLCW75' }
    ]);
    setBody('');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="bg-blue-500">
        <CardHeader className="flex flex-row items-center justify-between p-4 text-white">
          <CardTitle className="text-xl font-bold">HTTP</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <div className="h-5 w-5 grid place-items-center">⋮</div>
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              ?
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="bg-white p-4 pb-8 space-y-6">
          <div className="flex items-center gap-2 text-gray-800">
            <input 
              type="checkbox"
              id="evaluateAllErrors" 
              checked={evaluateAllErrors}
              onChange={() => setEvaluateAllErrors(!evaluateAllErrors)}
              className="h-4 w-4"
            />
            <label htmlFor="evaluateAllErrors">Evaluate all states as errors (except for 2xx and 3xx)</label>
          </div>

          <div className="flex items-center gap-2 text-gray-800">
            <input 
              type="checkbox"
              id="useProxy" 
              checked={useProxy}
              onChange={() => setUseProxy(!useProxy)}
              className="h-4 w-4"
            />
            <label htmlFor="useProxy">Usar proxy para evitar problemas de CORS</label>
          </div>

          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertTitle className="font-medium">Proxy configurado</AlertTitle>
            <AlertDescription>
              Se ha configurado un proxy para evitar problemas de CORS con app.estudiokm.com.ar.
              <div className="flex mt-2 space-x-2">
                <Button onClick={testEstudioKM} variant="outline" size="sm" className="bg-white">
                  Probar con EstudioKM
                </Button>
                <Button onClick={testJsonPlaceholder} variant="outline" size="sm" className="bg-white">
                  Probar con JSONPlaceholder
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {showAdvancedOptions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Reintentos</label>
                <Input
                  type="number"
                  value={retries}
                  onChange={(e) => setRetries(Number(e.target.value))}
                  min={0}
                  max={5}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Timeout (ms)</label>
                <Input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(Number(e.target.value))}
                  min={1000}
                  step={1000}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center text-gray-800">
              <input type="checkbox" className="h-4 w-4 mr-2" checked readOnly />
              <label className="text-sm font-medium">URL <span className="text-red-500">*</span></label>
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="border-gray-300"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center text-gray-800">
              <input type="checkbox" className="h-4 w-4 mr-2" checked readOnly />
              <label className="text-sm font-medium">Method <span className="text-red-500">*</span></label>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs">Map</span>
                <Switch />
              </div>
            </div>
            <Select value={method} onValueChange={(val) => setMethod(val as HttpMethod)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center text-gray-800">
              <input type="checkbox" className="h-4 w-4 mr-2" checked readOnly />
              <label className="text-sm font-medium">Headers</label>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs">Map</span>
                <Switch />
              </div>
            </div>

            <div className="space-y-4">
              {headers.map((header) => (
                <div key={header.id} className="pl-6 space-y-2 border-l-2 border-l-gray-200">
                  <div className="flex items-center mb-1">
                    <input type="checkbox" className="h-4 w-4 mr-2" checked readOnly />
                    <div className="text-sm">Item {header.id}</div>
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleHeaderOptions(header.id)}
                      >
                        <Menu size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHeader(header.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="pl-6 space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 mr-2" checked readOnly />
                      <label className="text-sm">Name <span className="text-red-500">*</span></label>
                    </div>
                    <Input
                      value={header.name}
                      onChange={(e) => updateHeader(header.id, 'name', e.target.value)}
                      placeholder="Header name"
                      className="border-gray-300"
                    />
                  </div>

                  <div className="pl-6 space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 mr-2" checked readOnly />
                      <label className="text-sm">Value</label>
                    </div>
                    <Input
                      value={header.value}
                      onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                      placeholder="Header value"
                      className="border-gray-300"
                    />
                  </div>
                </div>
              ))}

              <Button 
                variant="ghost" 
                className="text-purple-600 pl-6 flex items-center gap-2"
                onClick={addHeader}
              >
                <PlusCircle size={16} />
                <span>Add a header</span>
              </Button>
            </div>
          </div>

          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-gray-800">
                <input type="checkbox" className="h-4 w-4 mr-2" checked readOnly />
                <label className="text-sm font-medium">Body</label>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="border border-gray-300 rounded-md p-2 min-h-[100px]"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>

          {errorDetails && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Detalles del error:</h3>
              <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                <pre className="text-sm whitespace-pre-wrap text-red-800">{errorDetails}</pre>
              </div>
            </div>
          )}

          {response && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Respuesta:</h3>
              <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[400px]">
                <pre className="text-sm">
                  {response.error ? (
                    <div className="text-red-500">
                      <p><strong>Error:</strong> {response.message}</p>
                      <p><strong>Status:</strong> {response.status}</p>
                      {response.response && (
                        <div>
                          <p><strong>Response data:</strong></p>
                          <div>{JSON.stringify(response.response.data, null, 2)}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    JSON.stringify(response, null, 2)
                  )}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HttpTester;
