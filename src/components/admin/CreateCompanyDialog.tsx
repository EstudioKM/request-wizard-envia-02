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
import { AuthService } from '@/services/AuthService';

const companySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  token: z.string().min(6, "El token debe tener al menos 6 caracteres"),
});

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void>;
}

const CreateCompanyDialog: React.FC<CreateCompanyDialogProps> = ({ 
  open, 
  onOpenChange,
  onSuccess 
}) => {
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      token: "",
    },
  });
  
  const generateToken = () => {
    const randomStr = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    const token = `${form.getValues("name").toLowerCase().replace(/\s+/g, "-")}-token-${randomStr}-${timestamp}`;
    form.setValue("token", token);
  };
  
  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    try {
      console.log("Creating company with values:", values);
      
      // Usamos el nuevo servicio para crear empresas
      AuthService.addCompany({
        name: values.name,
        token: values.token,
      });
      
      console.log("Company created successfully");
      toast.success("Empresa creada exitosamente");
      form.reset();
      onOpenChange(false);
      await onSuccess(); // Reload companies after creating a new one
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error("Error al crear empresa: " + (error.message || "Error desconocido"));
    }
  };
  
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Empresa *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Ingresa el nombre de la empresa"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="token">Token de Acceso API *</Label>
            <div className="flex space-x-2">
              <Input
                id="token"
                {...form.register("token")}
                placeholder="Ingresa o genera el token de acceso"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={generateToken}
              >
                Generar
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Este token se utilizará como clave de autenticación para acceder a los endpoints de la API.
            </p>
            {form.formState.errors.token && (
              <p className="text-sm text-red-500">{form.formState.errors.token.message}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creando..." : "Crear Empresa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyDialog;
