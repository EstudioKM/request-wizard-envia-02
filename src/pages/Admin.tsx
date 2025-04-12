
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase, getAdminClient } from "@/integrations/supabase/client";
import { AuthService } from '@/services/AuthService';
import { LogOut, Plus, Pencil, Trash, Users, Building, Key } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Company = {
  id: string;
  name: string;
  token: string;
  created_at: string;
};

type Profile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_id: string | null;
  role: string;
  created_at: string;
};

type AuthUser = {
  id: string;
  email?: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'companies' | 'users'>('companies');
  
  const companySchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    token: z.string().min(6, "El token debe tener al menos 6 caracteres"),
  });
  
  const userSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    company_id: z.string().optional(),
    role: z.enum(["admin", "user"]),
  });
  
  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      token: "",
    },
  });
  
  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      company_id: "",
      role: "user",
    },
  });
  
  useEffect(() => {
    console.log("Admin component mounted, loading data...");
    loadCompanies();
    loadProfiles();
  }, []);
  
  const loadCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      console.log("Loading companies...");
      const adminClient = getAdminClient();
      console.log("Admin client created for companies");
      
      const { data, error } = await adminClient
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error loading companies:", error);
        toast.error("Error al cargar empresas: " + error.message);
      } else {
        console.log("Companies loaded successfully:", data);
        setCompanies(data || []);
      }
    } catch (error: any) {
      console.error("Exception loading companies:", error);
      toast.error("Error inesperado al cargar empresas");
    } finally {
      setIsLoadingCompanies(false);
    }
  };
  
  const loadProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      console.log("Loading profiles...");
      const adminClient = getAdminClient();
      console.log("Admin client created for profiles");
      
      const authUsers: { users: AuthUser[] } = { users: [] };
      
      try {
        const { data: authUsersData, error: authError } = await adminClient.auth.admin.listUsers();
        
        if (authError) {
          console.error("Error loading auth users:", authError);
          toast.error("Error al cargar usuarios de autenticación: " + authError.message);
        } else if (authUsersData) {
          Object.assign(authUsers, authUsersData);
        }
      } catch (authErr: any) {
        console.error("Exception loading auth users:", authErr);
      }
      
      const { data: profilesData, error: profilesError } = await adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        toast.error("Error al cargar perfiles: " + profilesError.message);
        return;
      }
      
      console.log("Profiles loaded successfully:", profilesData);
      
      const profiles = profilesData || [];
      
      const combinedProfiles = profiles.map(profile => {
        if (!profile || !profile.id) {
          console.error("Invalid profile object:", profile);
          return {
            id: 'unknown',
            email: 'error@example.com',
            first_name: null,
            last_name: null,
            company_id: null,
            role: 'unknown',
            created_at: new Date().toISOString()
          };
        }
        
        const authUser = authUsers.users.find(u => u.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || profile.email || 'Sin email'
        };
      });
      
      setProfiles(combinedProfiles);
    } catch (error: any) {
      console.error("Exception loading profiles:", error);
      toast.error("Error inesperado al cargar usuarios: " + error.message);
    } finally {
      setIsLoadingProfiles(false);
    }
  };
  
  const onCompanySubmit = async (values: z.infer<typeof companySchema>) => {
    try {
      setIsLoadingCompanies(true);
      console.log("Creating company with values:", values);
      
      const adminClient = getAdminClient();
      console.log("Admin client created for company creation");
      
      // Asegúrate de que estás usando el cliente administrativo para insertar la empresa
      const { data, error } = await adminClient
        .from('companies')
        .insert({
          name: values.name,
          token: values.token,
        })
        .select();
        
      if (error) {
        console.error("Error creating company:", error);
        throw error;
      }
      
      console.log("Company created successfully:", data);
      toast.success("Empresa creada exitosamente");
      companyForm.reset();
      setCompanyModalOpen(false);
      await loadCompanies(); // Recargar empresas después de crear una nueva
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error("Error al crear empresa: " + (error.message || "Error desconocido"));
    } finally {
      setIsLoadingCompanies(false);
    }
  };
  
  const onUserSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      console.log("Creating user with values:", values);
      
      const adminClient = getAdminClient();
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          first_name: values.first_name,
          last_name: values.last_name,
        }
      });
      
      if (authError) {
        console.error("Error creating user auth:", authError);
        throw authError;
      }
      
      const { error: profileError } = await adminClient
        .from('profiles')
        .update({
          first_name: values.first_name || null,
          last_name: values.last_name || null,
          company_id: values.company_id || null,
          role: values.role,
        })
        .eq('id', authData.user.id);
        
      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }
      
      console.log("User created successfully:", authData.user);
      toast.success("Usuario creado exitosamente");
      userForm.reset();
      setUserModalOpen(false);
      loadProfiles();
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error("Error al crear usuario: " + error.message);
    }
  };
  
  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex-1 p-6 space-y-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Panel de Administración</h1>
            <p className="text-gray-500 mt-2">
              Gestiona empresas y usuarios del sistema
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Cerrar sesión
          </Button>
        </header>
        
        <div className="border-b mb-6">
          <div className="flex space-x-6">
            <button
              className={`pb-2 px-1 ${currentTab === 'companies' 
                ? 'border-b-2 border-primary font-medium text-primary' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setCurrentTab('companies')}
            >
              <div className="flex items-center gap-2">
                <Building size={18} />
                Empresas
              </div>
            </button>
            <button
              className={`pb-2 px-1 ${currentTab === 'users' 
                ? 'border-b-2 border-primary font-medium text-primary' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setCurrentTab('users')}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                Usuarios
              </div>
            </button>
          </div>
        </div>
        
        {currentTab === 'companies' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Empresas</h2>
              
              <Dialog open={companyModalOpen} onOpenChange={setCompanyModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Nueva Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Empresa</DialogTitle>
                    <DialogDescription>
                      Ingresa el nombre de la empresa y su token de acceso.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la Empresa *</Label>
                      <Input
                        id="name"
                        {...companyForm.register("name")}
                        placeholder="Ingresa el nombre de la empresa"
                      />
                      {companyForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{companyForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="token">Token de Acceso *</Label>
                      <Input
                        id="token"
                        {...companyForm.register("token")}
                        placeholder="Ingresa el token de acceso"
                      />
                      {companyForm.formState.errors.token && (
                        <p className="text-sm text-red-500">{companyForm.formState.errors.token.message}</p>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" disabled={companyForm.formState.isSubmitting}>
                        {companyForm.formState.isSubmitting ? "Creando..." : "Crear Empresa"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingCompanies ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : companies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No hay empresas registradas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>
                            <div className="font-medium">{company.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                {company.token.substring(0, 15)}...
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  navigator.clipboard.writeText(company.token);
                                  toast.success("Token copiado al portapapeles");
                                }}
                              >
                                <Key size={14} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Pencil size={14} />
                              </Button>
                              <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                <Trash size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
        
        {currentTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Usuarios</h2>
              
              <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                      Ingresa los datos del nuevo usuario.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...userForm.register("email")}
                        placeholder="correo@ejemplo.com"
                      />
                      {userForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{userForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        {...userForm.register("password")}
                        placeholder="Contraseña"
                      />
                      {userForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{userForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Nombre</Label>
                        <Input
                          id="first_name"
                          {...userForm.register("first_name")}
                          placeholder="Nombre"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Apellido</Label>
                        <Input
                          id="last_name"
                          {...userForm.register("last_name")}
                          placeholder="Apellido"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company_id">Empresa</Label>
                      <select
                        id="company_id"
                        {...userForm.register("company_id")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">-- Sin empresa --</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <select
                        id="role"
                        {...userForm.register("role")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" disabled={userForm.formState.isSubmitting}>
                        {userForm.formState.isSubmitting ? "Creando..." : "Crear Usuario"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingProfiles ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : profiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No hay usuarios registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            {profile.first_name || profile.last_name ? 
                              `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
                              '-'
                            }
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              profile.role === 'admin' ? 
                                'bg-purple-100 text-purple-700' : 
                                'bg-blue-100 text-blue-700'
                            }`}>
                              {profile.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {companies.find(c => c.id === profile.company_id)?.name || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Pencil size={14} />
                              </Button>
                              <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                <Trash size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
