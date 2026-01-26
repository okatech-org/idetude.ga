import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const signUpSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  if (!isLoading && user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isSignUp) {
        const result = signUpSchema.safeParse({ email, password, firstName, lastName });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            fieldErrors[issue.path[0]] = issue.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, firstName, lastName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Un compte existe déjà avec cet email");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Compte créé avec succès !");
          navigate("/dashboard");
        }
      } else {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            fieldErrors[issue.path[0]] = issue.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou mot de passe incorrect");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Connexion réussie !");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <GlassCard className="p-8" solid>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {isSignUp ? "Créer un compte" : "Bienvenue"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isSignUp
                  ? "Rejoignez la plateforme iDETUDE"
                  : "Connectez-vous à votre espace"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <GlassInput
                      icon={User}
                      type="text"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      error={errors.firstName}
                    />
                  </div>
                  <div>
                    <GlassInput
                      icon={User}
                      type="text"
                      placeholder="Nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      error={errors.lastName}
                    />
                  </div>
                </div>
              )}

              <GlassInput
                icon={Mail}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <div className="relative">
                <GlassInput
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                    Chargement...
                  </span>
                ) : isSignUp ? (
                  "Créer mon compte"
                ) : (
                  "Se connecter"
                )}
              </GlassButton>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp
                  ? "Déjà un compte ? Se connecter"
                  : "Pas encore de compte ? S'inscrire"}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Demo Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                💡 Nouveau sur iDETUDE ?
              </p>
              <Link to="/demo">
                <GlassButton variant="outline" className="w-full">
                  Découvrir avec les comptes démo <ArrowRight className="h-4 w-4" />
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
