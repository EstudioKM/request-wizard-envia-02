
import { supabase } from "@/integrations/supabase/client";

export const AuthService = {
  isLoggedIn: async () => {
    // Check if admin login
    if (localStorage.getItem('isAdmin') === 'true') {
      return true;
    }
    
    // Check if regular supabase login
    const { data, error } = await supabase.auth.getSession();
    return !!data.session;
  },
  
  isAdmin: async () => {
    // Check if admin login
    if (localStorage.getItem('isAdmin') === 'true') {
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
      
    return profileError ? false : profileData?.role === 'admin';
  },
  
  loginAsAdmin: async (email: string, password: string) => {
    if (email === 'admin@example.com' && password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('estudio-km-token', 'mock-admin-token');
      return { success: true };
    }
    
    // Si no es el admin predefinido, intentar login normal
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) return { success: false, error: error.message };
    
    // Verificar si el usuario tiene rol de admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
      
    if (profileData?.role === 'admin') {
      localStorage.setItem('isAdmin', 'true');
    }
    
    return { success: true, user: data.user };
  },
  
  logout: async () => {
    localStorage.removeItem('estudio-km-token');
    localStorage.removeItem('isAdmin');
    return await supabase.auth.signOut();
  }
};
