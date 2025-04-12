
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
  
  logout: async () => {
    localStorage.removeItem('estudio-km-token');
    localStorage.removeItem('isAdmin');
    return await supabase.auth.signOut();
  }
};
