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

// Predefined users
const predefinedUsers: Record<string, User> = {
  "admin@example.com": {
    email: "admin@example.com",
    role: "admin"
  },
  "empresa@example.com": {
    email: "empresa@example.com",
    role: "user"
  },
  "ADMIN": {
    email: "ADMIN",
    role: "admin"
  }
};

// Predefined passwords
const predefinedPasswords: Record<string, string> = {
  "admin@example.com": "admin123",
  "empresa@example.com": "empresa123",
  "ADMIN": "ADMIN123"
};

// Storage key for current user
const USER_STORAGE_KEY = "current-user";

// Assign token to predefined company
predefinedUsers["empresa@example.com"].company_id = "1";
predefinedUsers["empresa@example.com"].token = "empresa-demo-token-123";

// Predefined companies for fallback mode
const predefinedCompanies: Company[] = [
  {
    id: "1",
    name: "Empresa Demo",
    token: "empresa-demo-token-123",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const AuthService = {
  // Iniciar sesión
  login: async (email: string, password: string) => {
    try {
      console.log(`Intentando iniciar sesión con email: ${email}`);
      
      // Verificar si el usuario existe
      if (!predefinedUsers[email]) {
        console.log("Usuario no encontrado");
        return { success: false, error: "Usuario no encontrado" };
      }
      
      // Verificar contraseña
      if (predefinedPasswords[email] !== password) {
        console.log("Contraseña incorrecta");
        return { success: false, error: "Contraseña incorrecta" };
      }
      
      console.log("Credenciales correctas, guardando en localStorage");
      
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
      // Verify specifically that the user is admin@example.com
      return user.email === "admin@example.com";
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
      const currentUser = AuthService.getCurrentUser();
      
      // If the current user is not admin@example.com, return empty array
      if (currentUser?.email !== "admin@example.com") {
        console.log("Usuario no autorizado para ver empresas");
        return [];
      }
      
      // Get companies from Supabase "empresas" table (created in our SQL migration)
      const { data, error } = await supabase
        .from('empresas')
        .select('*');
        
      if (error) {
        console.error("Error al obtener empresas de Supabase (empresas):", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Empresas obtenidas de Supabase (empresas):", data);
        return data;
      }
      
      // Fallback to predefined companies if no data found
      console.log("No se encontraron empresas, usando datos predefinidos");
      return predefinedCompanies;
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      
      // Return predefined companies in case of error
      return predefinedCompanies;
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
        console.error("Error al añadir empresa a 'empresas':", error);
        throw error;
      }
      
      if (data) {
        console.log("Empresa añadida en 'empresas':", data);
        return data;
      }
      
      throw new Error("No se pudo guardar la empresa");
    } catch (error: any) {
      console.error("Error al añadir empresa:", error);
      throw error;
    }
  },
  
  // Update company method - simplified to work only with 'empresas' table
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
  
  // Delete company method - simplified to work only with 'empresas' table
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
      // Try to get profiles from Supabase first
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("Perfiles obtenidos de Supabase:", data);
          return data;
        }
      } catch (supabaseError) {
        console.error("Error al obtener perfiles de Supabase:", supabaseError);
      }
      
      // Fallback to predefined profiles
      return [
        {
          id: "1",
          email: "admin@example.com",
          first_name: "Admin",
          last_name: "User",
          company_id: null,
          role: "admin",
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          email: "empresa@example.com",
          first_name: "Empresa",
          last_name: "Usuario",
          company_id: "1",
          role: "user",
          created_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
  }
};
