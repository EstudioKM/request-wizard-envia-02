
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { http } from '@/lib/http-client';

const Login = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('estudio-km-token');
    if (savedToken) {
      // Validate token before auto-login
      validateAndLogin(savedToken, true);
    }
  }, []);

  const validateAndLogin = async (tokenValue: string, isAutoLogin = false) => {
    if (!tokenValue.trim()) {
      setError('Por favor ingresa un token válido');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Test the token with a simple API call
      const response = await http.get('/api-proxy/api/accounts/me', {
        headers: {
          'X-ACCESS-TOKEN': tokenValue
        }
      });
      
      // Guardando el token en localStorage
      console.log('Token válido, guardando:', tokenValue);
      localStorage.setItem('estudio-km-token', tokenValue);
      
      // Estableciendo el token para todas las solicitudes futuras
      http.defaultOptions.headers = {
        ...http.defaultOptions.headers,
        'x-access-token': tokenValue
      };
      
      console.log('Headers configurados:', http.defaultOptions.headers);
      
      if (!isAutoLogin) {
        toast.success("Sesión iniciada correctamente con token: " + tokenValue.substring(0, 10) + "...");
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Error validando token:', err);
      setError('Token inválido o problemas de conexión. Por favor intenta nuevamente.');
      
      if (isAutoLogin) {
        // Limpiar token inválido si el auto-login falla
        localStorage.removeItem('estudio-km-token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndLogin(token);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Estudio KM</h1>
          <p className="text-gray-500 mt-2">Ingresa tu token de acceso para continuar</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Token de API
              </label>
              <Input
                id="token"
                type="text"
                placeholder="Ingresa tu token de acceso"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Validando...' : 'Ingresar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
