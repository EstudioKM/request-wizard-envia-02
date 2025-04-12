
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
      // Check if admin login
      if (localStorage.getItem('isAdmin') === 'true') {
        console.log("Verificado como administrador");
        return true;
      }
      
      // Check if regular supabase login with admin role
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return false;
      
      // Obtener el perfil del usuario para verificar su rol
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error al obtener perfil:", profileError);
        return false;
      }
      
      return profileData?.role === 'admin';
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
      
      // Verificar si el usuario tiene rol de admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error("Error al obtener perfil tras login:", profileError);
      } else {
        console.log("Perfil de usuario:", profileData);
        if (profileData?.role === 'admin') {
          localStorage.setItem('isAdmin', 'true');
        }
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
      localStorage.removeItem('estudio-km-token');
      localStorage.removeItem('isAdmin');
      await supabase.auth.signOut();
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  }
};
