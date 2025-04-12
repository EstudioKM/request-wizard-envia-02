
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthService = {
  isLoggedIn: async () => {
    try {
      // Check if admin login
      if (localStorage.getItem('isAdmin') === 'true') {
        console.log("Usuario autenticado como administrador");
        return true;
      }
      
      // Check if regular supabase login
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error al verificar sesión:", error);
      
      return !!data.session;
    } catch (error) {
      console.error("Error en isLoggedIn:", error);
      return false;
    }
  },
  
  isAdmin: async () => {
    try {
      // Check if admin login via localStorage first (to avoid RLS recursion)
      if (localStorage.getItem('isAdmin') === 'true') {
        console.log("Verificado como administrador por localStorage");
        return true;
      }
      
      // Check if regular supabase login with admin role
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return false;
      
      // Evitamos la recursión infinita usando una bandera
      if (localStorage.getItem('checking_admin') === 'true') {
        console.log("Evitando recursión en isAdmin");
        return false;
      }
      
      try {
        localStorage.setItem('checking_admin', 'true');
        
        // Usar RPC (función de SQL) en lugar de consulta directa para evitar RLS recursivo
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin', {
          user_id: data.session.user.id
        });
        
        if (isAdminError) {
          console.error("Error al verificar rol de admin:", isAdminError);
          return false;
        }
        
        // Si el usuario es admin, guardamos en localStorage para futuras verificaciones
        if (isAdminData === true) {
          localStorage.setItem('isAdmin', 'true');
        }
        
        return isAdminData === true;
      } finally {
        localStorage.removeItem('checking_admin');
      }
    } catch (error) {
      console.error("Error en isAdmin:", error);
      return false;
    }
  },
  
  loginAsAdmin: async (email: string, password: string) => {
    try {
      // Admin hardcodeado para desarrollo
      if (email === 'admin@example.com' && password === 'admin123') {
        console.log("Iniciando sesión como administrador con credenciales predefinidas");
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('estudio-km-token', 'mock-admin-token');
        toast.success("Inicio de sesión como administrador exitoso");
        return { success: true };
      }
      
      // Para el correo superadmin (holaestudiokm@gmail.com)
      if (email === 'holaestudiokm@gmail.com') {
        console.log("Intentando login como superadministrador");
      }
      
      // Si no es el admin predefinido, intentar login normal
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Error en login:", error);
        return { success: false, error: error.message };
      }
      
      console.log("Usuario autenticado correctamente:", data.user?.id);
      
      // Para evitar recursión, usamos marcado directo para superadmin
      if (email === 'holaestudiokm@gmail.com' || email === 'admin@example.com') {
        localStorage.setItem('isAdmin', 'true');
        toast.success("Inicio de sesión como superadministrador exitoso");
        return { success: true, user: data.user };
      }
      
      // Para otros usuarios, verificamos su rol
      try {
        localStorage.setItem('checking_admin', 'true');
        
        // Usar RPC (función de SQL) en lugar de consulta directa
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin', {
          user_id: data.user.id
        });
        
        if (!isAdminError && isAdminData === true) {
          localStorage.setItem('isAdmin', 'true');
        }
      } catch (err) {
        console.error("Error al verificar admin:", err);
      } finally {
        localStorage.removeItem('checking_admin');
      }
      
      toast.success("Inicio de sesión exitoso");
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error("Error general en loginAsAdmin:", error);
      return { success: false, error: error.message || "Error desconocido en login" };
    }
  },
  
  logout: async () => {
    try {
      // Primero removemos las claves de localStorage para evitar bucles
      localStorage.removeItem('estudio-km-token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('checking_admin');
      
      // Luego intentamos cerrar sesión en Supabase
      try {
        await supabase.auth.signOut();
      } catch (supaError) {
        console.error("Error al cerrar sesión de Supabase:", supaError);
      }
      
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  }
};
