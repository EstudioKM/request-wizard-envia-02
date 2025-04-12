
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/pages/Admin";

// Tipos de usuario
type UserRole = "admin" | "user";

export interface User {
  email: string;
  role: UserRole;
  token?: string;
  company_id?: string;
}

// Usuarios predefinidos
const predefinedUsers: Record<string, User> = {
  "admin@example.com": {
    email: "admin@example.com",
    role: "admin"
  },
  "empresa@example.com": {
    email: "empresa@example.com",
    role: "user"
  }
};

// Contraseñas predefinidas
const predefinedPasswords: Record<string, string> = {
  "admin@example.com": "admin123",
  "empresa@example.com": "empresa123"
};

// Clave para almacenar el usuario actual en localStorage
const USER_STORAGE_KEY = "current-user";

// Asignar el token a la empresa predefinida
predefinedUsers["empresa@example.com"].company_id = "1";
predefinedUsers["empresa@example.com"].token = "empresa-demo-token-123";

export const AuthService = {
  // Iniciar sesión
  login: async (email: string, password: string) => {
    try {
      // Verificar si el usuario existe
      if (!predefinedUsers[email]) {
        return { success: false, error: "Usuario no encontrado" };
      }
      
      // Verificar contraseña
      if (predefinedPasswords[email] !== password) {
        return { success: false, error: "Contraseña incorrecta" };
      }
      
      // Guardar usuario en localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(predefinedUsers[email]));
      
      toast.success("Inicio de sesión exitoso");
      return { success: true, user: predefinedUsers[email] };
    } catch (error: any) {
      console.error("Error en login:", error);
      return { success: false, error: error.message || "Error desconocido en login" };
    }
  },
  
  // Cerrar sesión
  logout: async () => {
    try {
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
      const userJson = localStorage.getItem(USER_STORAGE_KEY);
      return !!userJson;
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      return false;
    }
  },
  
  // Verificar si el usuario es administrador
  isAdmin: async () => {
    try {
      const userJson = localStorage.getItem(USER_STORAGE_KEY);
      if (!userJson) return false;
      
      const user: User = JSON.parse(userJson);
      return user.role === "admin";
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
  
  // Servicios para la gestión de empresas (CRUD)
  getCompanies: async (): Promise<Company[]> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) {
        console.error("Error al obtener empresas de Supabase:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      return [];
    }
  },
  
  addCompany: async (company: Omit<Company, "id" | "created_at">): Promise<Company> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{ 
          name: company.name, 
          token: company.token 
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Error al añadir empresa en Supabase:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error al añadir empresa:", error);
      throw error;
    }
  },
  
  updateCompany: async (id: string, updates: Partial<Company>): Promise<Company> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error al actualizar empresa en Supabase:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
      throw error;
    }
  },
  
  deleteCompany: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error al eliminar empresa en Supabase:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
      return false;
    }
  }
};
