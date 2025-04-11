
import { useState } from 'react';
import { PlusCircle, Trash2, Menu, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { http, RequestOptions } from '@/lib/http-client';

interface HeaderItem {
  id: string;
  name: string;
  value: string;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const HttpTester = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { id: '1', name: 'accept', value: 'application/json' }
  ]);
  const [body, setBody] = useState('');
  const [evaluateAllErrors, setEvaluateAllErrors] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHeaderOptions, setShowHeaderOptions] = useState<Record<string, boolean>>({});

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

    try {
      const headerObject: Record<string, string> = {};
      headers.forEach(header => {
        if (header.name && header.value) {
          headerObject[header.name] = header.value;
        }
      });

      const options: RequestOptions = {
        headers: headerObject
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
    } finally {
      setIsLoading(false);
    }
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
            <Button variant="ghost" size="icon" className="text-white">
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
