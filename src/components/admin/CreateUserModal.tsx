import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Mail, KeyRound, UserCog } from "lucide-react";
import { z } from "zod";

const roleOptions = [
  { value: "super_admin", label: "Super Administrateur" },
  { value: "regional_admin", label: "Administrateur Régional" },
  { value: "school_director", label: "Directeur d'Établissement" },
  { value: "school_admin", label: "Administrateur Scolaire" },
  { value: "cpe", label: "CPE" },
  { value: "main_teacher", label: "Professeur Principal" },
  { value: "teacher", label: "Enseignant" },
  { value: "student", label: "Élève" },
  { value: "parent_primary", label: "Parent Principal" },
  { value: "parent_secondary", label: "Parent Secondaire" },
];

const userSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  role: z.string().min(1, "Le rôle est requis"),
});

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateUserModal = ({ open, onOpenChange, onSuccess }: CreateUserModalProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = userSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Use the edge function to create the user
      const { data, error } = await supabase.functions.invoke("init-demo-accounts", {
        body: {
          action: "init",
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          displayRole: roleOptions.find((r) => r.value === formData.role)?.label || formData.role,
        },
      });

      if (error) throw error;

      toast.success("Utilisateur créé avec succès");
      setFormData({ email: "", password: "", firstName: "", lastName: "", role: "" });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Erreur lors de la création de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Créer un utilisateur
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <GlassInput
                id="firstName"
                icon={User}
                placeholder="Prénom"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <GlassInput
                id="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <GlassInput
              id="email"
              type="email"
              icon={Mail}
              placeholder="email@exemple.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <GlassInput
              id="password"
              type="password"
              icon={KeyRound}
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select value={formData.role} onValueChange={(v) => handleChange("role", v)}>
              <SelectTrigger>
                <UserCog className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Créer l'utilisateur
            </GlassButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
