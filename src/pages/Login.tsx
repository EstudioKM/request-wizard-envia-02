
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AuthService } from '@/services/AuthService';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await AuthService.isLoggedIn();
        
        if (isLoggedIn) {
          const isAdmin = await AuthService.isAdmin();
          navigate(isAdmin ? '/admin' : '/dashboard');
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      toast.error("Por favor ingresa email y contraseña");
      setErrorMessage("Por favor ingresa email y contraseña");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Iniciando proceso de login");
      
      // Usar directamente supabase.auth para iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Error de autenticación:", error);
        toast.error(`Error de autenticación: ${error.message}`);
        setErrorMessage(`Error de autenticación: ${error.message}`);
        return;
      }
      
      if (!data.user) {
        toast.error("No se pudo obtener información del usuario");
        setErrorMessage("No se pudo obtener información del usuario");
        return;
      }
      
      // Verificar si es admin después de iniciar sesión exitosamente
      const isAdmin = await AuthService.isAdmin();
      console.log("Es admin:", isAdmin);
      
      navigate(isAdmin ? '/admin' : '/dashboard');
      toast.success("Inicio de sesión exitoso");
      
    } catch (error: any) {
      console.error("Error de login:", error);
      toast.error("Error al iniciar sesión: " + (error.message || "Error desconocido"));
      setErrorMessage("Error al iniciar sesión: " + (error.message || "Error desconocido"));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    // Ejemplo de función para restablecer contraseña
    try {
      if (!email) {
        toast.error("Ingresa tu email para restablecer la contraseña");
        return;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast.error(`Error al solicitar restablecimiento: ${error.message}`);
      } else {
        toast.success("Se ha enviado un correo para restablecer tu contraseña");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errorMessage && (
              <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600 text-sm">
                {errorMessage}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <div className="text-center">
              <button 
                type="button" 
                onClick={handleResetPassword}
                className="text-sm text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <div className="w-full text-center">
            <p className="text-xs text-gray-500 mt-4">
              Usuario administrador: admin@example.com / Contraseña: admin123
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Usuario administrador: nicobarrilis@gmail.com / Contraseña: admin123
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Usuario empresa: empresa@example.com / Contraseña: empresa123
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
