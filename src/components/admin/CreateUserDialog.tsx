
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus } from 'lucide-react';
import { getAdminClient } from "@/integrations/supabase/client";

type Company = {
  id: string;
  name: string;
  token: string;
  created_at: string;
};

const userSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company_id: z.string().optional(),
  role: z.enum(["admin", "user"]),
});

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: Company[];
  onSuccess: () => Promise<void>;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ 
  open, 
  onOpenChange, 
  companies,
  onSuccess
}) => {
  const form = useForm<z.infer<typeof userSchema>>({
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
  
  const onSubmit = async (values: z.infer<typeof userSchema>) => {
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
      form.reset();
      onOpenChange(false);
      await onSuccess();
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error("Error al crear usuario: " + error.message);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="correo@ejemplo.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder="Contraseña"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                {...form.register("first_name")}
                placeholder="Nombre"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                {...form.register("last_name")}
                placeholder="Apellido"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_id">Empresa</Label>
            <select
              id="company_id"
              {...form.register("company_id")}
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
              {...form.register("role")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creando..." : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
