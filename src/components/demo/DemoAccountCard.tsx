import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Copy,
  LogIn,
  Check,
  User,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { type DemoAccount } from "@/data/demo-accounts";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface DemoAccountCardProps {
  account: DemoAccount;
  compact?: boolean;
}

export const DemoAccountCard = ({ account, compact = false }: DemoAccountCardProps) => {
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(field === "email" ? "Email copié !" : "Mot de passe copié !");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleQuickLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      // First, try to initialize demo account if it's a super_admin
      if (account.email.includes("superadmin@demo")) {
        try {
          await supabase.functions.invoke("init-demo-accounts", {
            body: { action: "init" },
          });
        } catch (initError) {
          console.log("Demo init (might already exist):", initError);
        }
      }

      // Sign in with the demo credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Ce compte démo n'est pas encore configuré. Contactez l'administrateur.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(`Connecté en tant que ${account.name}`);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Erreur lors de la connexion");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(account.email, "email")}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
            title="Copier l'email"
          >
            {copiedField === "email" ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Mail className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={handleQuickLogin}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <LogIn className="h-3 w-3" />
            Connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <GlassCard className="p-5 hover:shadow-lg transition-shadow" hover={false}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-2 ring-primary/10">
          <User className="h-7 w-7 text-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Role badge and name */}
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold mb-2">
              {account.role}
            </span>
            <h4 className="font-bold text-foreground text-lg">{account.name}</h4>
          </div>

          {/* Credentials */}
          <div className="space-y-2">
            {/* Email field */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 group/field hover:bg-muted/60 transition-colors">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <code className="text-sm text-foreground flex-1 truncate">{account.email}</code>
              <button
                onClick={() => copyToClipboard(account.email, "email")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  copiedField === "email" ? "bg-green-500/10" : "hover:bg-primary/10"
                )}
                title="Copier l'email"
              >
                {copiedField === "email" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground group-hover/field:text-primary transition-colors" />
                )}
              </button>
            </div>

            {/* Password field */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 group/field hover:bg-muted/60 transition-colors">
              <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
              <code className={cn(
                "text-sm flex-1",
                showPassword ? "text-foreground" : "text-muted-foreground"
              )}>
                {showPassword ? account.password : "••••••••••"}
              </code>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(account.password, "password")}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  copiedField === "password" ? "bg-green-500/10" : "hover:bg-primary/10"
                )}
                title="Copier le mot de passe"
              >
                {copiedField === "password" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground group-hover/field:text-primary transition-colors" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick login button */}
        <button
          onClick={handleQuickLogin}
          disabled={isLoggingIn}
          className="sm:self-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isLoggingIn ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          <span>{isLoggingIn ? "Connexion..." : "Connexion rapide"}</span>
        </button>
      </div>
    </GlassCard>
  );
};
