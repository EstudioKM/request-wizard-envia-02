
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AuthService } from '@/services/AuthService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
    
    if (!email || !password) {
      toast.error("Por favor ingresa email y contraseña");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Iniciando proceso de login");
      const result = await AuthService.login(email, password);
      
      if (result.success) {
        console.log("Login exitoso, verificando si es admin");
        const isAdmin = await AuthService.isAdmin();
        console.log("Es admin:", isAdmin);
        navigate(isAdmin ? '/admin' : '/dashboard');
      } else {
        toast.error("Credenciales incorrectas: " + (result.error || "Verifica tu email y contraseña"));
      }
    } catch (error: any) {
      console.error("Error de login:", error);
      toast.error("Error al iniciar sesión: " + (error.message || "Error desconocido"));
    } finally {
      setIsLoading(false);
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <div className="w-full text-center">
            <p className="text-xs text-gray-500 mt-4">
              Usuario administrador: admin@example.com / Contraseña: admin123
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
