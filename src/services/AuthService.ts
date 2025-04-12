
import { toast } from "sonner";
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
const COMPANIES_STORAGE_KEY = "companies";

// Inicializar empresas predeterminadas si no existen
const initDefaultCompanies = () => {
  const existingCompanies = localStorage.getItem(COMPANIES_STORAGE_KEY);
  
  if (!existingCompanies) {
    const defaultCompanies: Company[] = [
      {
        id: "1",
        name: "Empresa Demo",
        token: "empresa-demo-token-123"
      },
      {
        id: "2",
        name: "Empresa Ejemplo S.A.",
        token: "empresa-ejemplo-token-456"
      },
      {
        id: "3",
        name: "Corporación ABC",
        token: "corporacion-abc-token-789"
      }
    ];
    
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(defaultCompanies));
    
    // Asignar el token a la empresa predefinida
    predefinedUsers["empresa@example.com"].company_id = "1";
    predefinedUsers["empresa@example.com"].token = "empresa-demo-token-123";
  }
};

// Inicializar empresas al cargar
initDefaultCompanies();

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
  getCompanies: (): Company[] => {
    try {
      const companiesJson = localStorage.getItem(COMPANIES_STORAGE_KEY);
      if (!companiesJson) return [];
      
      return JSON.parse(companiesJson);
    } catch (error) {
      console.error("Error al obtener empresas:", error);
      return [];
    }
  },
  
  addCompany: (company: Omit<Company, "id">): Company => {
    try {
      const companies = AuthService.getCompanies();
      const newCompany: Company = {
        ...company,
        id: Date.now().toString()
      };
      
      companies.push(newCompany);
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
      
      return newCompany;
    } catch (error) {
      console.error("Error al añadir empresa:", error);
      throw error;
    }
  },
  
  updateCompany: (id: string, updates: Partial<Company>): Company => {
    try {
      const companies = AuthService.getCompanies();
      const index = companies.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error("Empresa no encontrada");
      }
      
      companies[index] = { ...companies[index], ...updates };
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
      
      return companies[index];
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
      throw error;
    }
  },
  
  deleteCompany: (id: string): boolean => {
    try {
      const companies = AuthService.getCompanies();
      const filteredCompanies = companies.filter(c => c.id !== id);
      
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(filteredCompanies));
      
      return true;
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
      return false;
    }
  }
};
