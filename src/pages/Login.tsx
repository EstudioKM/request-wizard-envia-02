
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { http } from '@/lib/http-client';
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'token' | 'email'>('token');
  const navigate = useNavigate();

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('estudio-km-token');
    if (savedToken) {
      // Validate token before auto-login
      validateAndLogin(savedToken, true);
    }
    
    // Check if admin is logged in
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      navigate('/admin');
    }
  }, [navigate]);

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
          'x-access-token': tokenValue
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar si son las credenciales de administrador
      if (email === 'admin' && password === 'admin123') {
        // En vez de intentar iniciar sesión con Supabase, simplemente marcamos al usuario como admin
        localStorage.setItem('isAdmin', 'true');
        toast.success("Sesión iniciada como administrador");
        navigate('/admin');
        return;
      }
      
      // Iniciar sesión normal con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Verificar si el usuario es administrador para redirigirlo correctamente
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session?.user.id)
        .single();
        
      if (profileError) {
        console.error('Error al verificar el rol:', profileError);
        toast.success("Sesión iniciada correctamente");
        navigate('/dashboard');
      } else if (profileData?.role === 'admin') {
        toast.success("Sesión iniciada como administrador");
        navigate('/admin');
      } else {
        toast.success("Sesión iniciada correctamente");
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenLogin = (e: React.FormEvent) => {
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
          <p className="text-gray-500 mt-2">Plataforma de administración</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="token" onValueChange={(value) => setLoginMethod(value as 'token' | 'email')} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="token" className="flex-1">Token</TabsTrigger>
            <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="token">
            <form onSubmit={handleTokenLogin}>
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
                  {isLoading ? 'Validando...' : 'Ingresar con Token'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario o Email
                  </label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="admin o tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
