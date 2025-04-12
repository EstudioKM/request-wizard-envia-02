
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { http } from '@/lib/http-client';

const Home = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('estudio-km-token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Por favor ingresa un token válido');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Save token to localStorage
      localStorage.setItem('estudio-km-token', token);
      
      // Configure the HTTP client to use this token for all requests
      http.defaultOptions.headers = {
        ...http.defaultOptions.headers,
        'x-access-token': token
      };
      
      console.log('Token establecido en headers:', http.defaultOptions.headers);
      toast.success("Token guardado correctamente");
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al guardar el token:', err);
      setError('Ocurrió un error al guardar el token. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Estudio KM</h1>
          <p className="text-gray-500 mt-2">Plataforma de campos personalizados</p>
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
              {isLoading ? 'Guardando...' : 'Guardar token y continuar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
