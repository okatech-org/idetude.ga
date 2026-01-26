import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { GraduationCap, Mail, Lock, Key, Play } from "lucide-react";
import { toast } from "sonner";

const Connexion = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Connexion réussie !");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background hero-pattern">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-glass-in">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">iDETUDE</h1>
          </div>

          {/* Login Card */}
          <GlassCard className="p-8 animate-glass-in delay-100" solid>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Bienvenue
              </h2>
              <p className="text-muted-foreground">
                Connectez-vous à votre espace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <GlassInput
                type="email"
                label="Email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              <GlassInput
                type="password"
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    Se souvenir de moi
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <GlassButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </GlassButton>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-card text-sm text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            <GlassButton variant="outline" className="w-full">
              <Key className="h-5 w-5" />
              Connexion SSO Établissement
            </GlassButton>
          </GlassCard>

          {/* Demo CTA */}
          <GlassCard className="p-6 mt-6 text-center animate-glass-in delay-200">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
              <span className="text-lg">💡</span>
              <span className="font-medium">Nouveau sur iDETUDE ?</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Découvrez la plateforme avec nos comptes de démonstration
            </p>
            <GlassButton href="/demo" variant="outline" className="w-full">
              <Play className="h-4 w-4" />
              Accéder à la Démo
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
