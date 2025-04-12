import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/pages/Admin";

// Type definitions
type UserRole = "admin" | "user";

export interface User {
  email: string;
  role: UserRole;
  token?: string;
  company_id?: string;
}

// Storage key for current user
const USER_STORAGE_KEY = "current-user";

export const AuthService = {
  // Iniciar sesión - este método está ahora más simplificado porque usamos Supabase directamente en Login.tsx
  login: async (email: string, password: string) => {
    try {
      console.log(`Intentando iniciar sesión con email: ${email}`);
      
      // Using Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Error en inicio de sesión:", error);
        return { success: false, error: error.message };
      }
      
      if (!data || !data.user) {
        console.error("No se obtuvo usuario después del inicio de sesión");
        return { success: false, error: "Error al obtener información de usuario" };
      }
      
      // Get user details using a direct query
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error al obtener perfil:", profileError);
        return { success: false, error: profileError.message };
      }
      
      if (!profileData) {
        console.error("No se encontró el perfil del usuario");
        return { success: false, error: "Perfil de usuario no encontrado" };
      }
      
      // Create user object
      const user: User = {
        email: data.user.email || '',
        role: profileData.role as UserRole,
        company_id: profileData.company_id
      };
      
      // If the user has a company, get the token
      if (user.company_id) {
        const { data: companyData } = await supabase
          .from('empresas')
          .select('token')
          .eq('id', user.company_id)
          .maybeSingle();
          
        if (companyData) {
          user.token = companyData.token;
        }
      }
      
      // Save user in localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      return { success: true, user };
    } catch (error: any) {
      console.error("Error en login:", error);
      return { success: false, error: error.message || "Error desconocido en login" };
    }
  },
  
  // Cerrar sesión
  logout: async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Remove from localStorage
      localStorage.removeItem(USER_STORAGE_KEY);
      toast.success("Sesión cerrada correctamente");
      return { success: true };
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Verificar si hay un usuario conectado
  isLoggedIn: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      return false;
    }
  },
  
  // Verificar si el usuario es administrador usando una consulta directa a la tabla de perfiles
  isAdmin: async () => {
    try {
      // First check if the user is logged in via Supabase
      const { data } = await supabase.auth.getSession();
      if (!data.session) return false;
      
      // Consultar directamente la tabla de perfiles
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();
      
      if (error) {
        console.error("Error al verificar si es admin:", error);
        return false;
      }
      
      const isAdmin = profileData?.role === 'admin';
      console.log("Resultado de consulta de admin:", isAdmin, "Rol:", profileData?.role);
      return isAdmin;
    } catch (error) {
      console.error("Error al verificar rol de administrador:", error);
      return false;
    }
  },
  
  // Obtener el usuario actual
  getCurrentUser: () => {
    try {
      const userJson = localStorage.getItem(USER_STORAGE_KEY);
      if (!userJson) return null;
      
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }
  },
  
  // Services for the management of companies (CRUD)
  getCompanies: async (): Promise<Company[]> => {
    try {
      console.log("Obteniendo empresas...");
      
      // Get companies from Supabase "empresas" table
      const { data, error } = await supabase
        .from('empresas')
        .select('*');
        
      if (error) {
        console.error("Error al obtener empresas:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Empresas obtenidas:", data);
        return data;
      }
      
      console.log("No se encontraron empresas");
      return [];
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      return [];
    }
  },
  
  // Method to add companies to the "empresas" table in Supabase
  addCompany: async (company: Omit<Company, "id" | "created_at">): Promise<Company> => {
    try {
      console.log("Añadiendo empresa a Supabase:", company);
      
      // Insert into 'empresas' table
      const { data, error } = await supabase
        .from('empresas')
        .insert({
          name: company.name,
          token: company.token
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error al añadir empresa:", error);
        throw error;
      }
      
      if (data) {
        console.log("Empresa añadida:", data);
        return data;
      }
      
      throw new Error("No se pudo guardar la empresa");
    } catch (error: any) {
      console.error("Error al añadir empresa:", error);
      throw error;
    }
  },
  
  // Update company method
  updateCompany: async (id: string, updates: Partial<Company>): Promise<Company> => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Error al actualizar empresa:", error);
        throw error;
      }
      
      if (data) {
        console.log("Empresa actualizada:", data);
        return data;
      }
      
      throw new Error("No se pudo actualizar la empresa");
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
      throw error;
    }
  },
  
  // Delete company method
  deleteCompany: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error al eliminar empresa:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
      return false;
    }
  },
  
  // Método para obtener perfiles
  getProfiles: async (): Promise<any[]> => {
    try {
      // Get profiles from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*, empresas:company_id(name)');
          
      if (error) {
        console.error("Error al obtener perfiles:", error);
        throw error;
      }
      
      console.log("Perfiles obtenidos:", data);
      return data || [];
    } catch (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
  }
};
