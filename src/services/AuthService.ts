
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
  },
  "ADMIN": {
    email: "ADMIN",
    role: "admin"
  }
};

// Contraseñas predefinidas
const predefinedPasswords: Record<string, string> = {
  "admin@example.com": "admin123",
  "empresa@example.com": "empresa123",
  "ADMIN": "ADMIN123"
};

// Clave para almacenar el usuario actual en localStorage
const USER_STORAGE_KEY = "current-user";

// Asignar el token a la empresa predefinida
predefinedUsers["empresa@example.com"].company_id = "1";
predefinedUsers["empresa@example.com"].token = "empresa-demo-token-123";

// Empresas predefinidas para modo fallback
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
      console.log("Obteniendo empresas...");
      
      // Use predefined companies directly instead of trying Supabase
      console.log("Usando empresas predefinidas");
      return predefinedCompanies;
      
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      
      // En caso de error, devolver las empresas predefinidas
      return predefinedCompanies;
    }
  },
  
  // Resto de métodos simplificados para evitar problemas con Supabase
  addCompany: async (company: Omit<Company, "id" | "created_at">): Promise<Company> => {
    try {
      // Simulación de añadir una empresa
      const newCompany: Company = {
        id: crypto.randomUUID(),
        name: company.name,
        token: company.token,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newCompany;
    } catch (error) {
      console.error("Error al añadir empresa:", error);
      throw error;
    }
  },
  
  updateCompany: async (id: string, updates: Partial<Company>): Promise<Company> => {
    try {
      // Simulación de actualizar una empresa
      const updatedCompany: Company = {
        ...predefinedCompanies[0],
        ...updates,
        id,
        updated_at: new Date().toISOString()
      };
      
      return updatedCompany;
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
      throw error;
    }
  },
  
  deleteCompany: async (id: string): Promise<boolean> => {
    try {
      // Simulación de eliminar una empresa
      return true;
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
      return false;
    }
  },
  
  // Método simplificado para obtener perfiles
  getProfiles: async (): Promise<any[]> => {
    try {
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
