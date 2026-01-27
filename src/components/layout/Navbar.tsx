import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, User, LogOut, ChevronDown, Building2, Users, GraduationCap as GradCap, BookOpen } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Accueil", path: "/" },
];

const solutionsLinks = [
  { name: "Établissements", path: "/etablissements", icon: Building2, description: "Pour les directeurs et fondateurs" },
  { name: "Parents", path: "/parents", icon: Users, description: "Suivi de la scolarité en temps réel" },
  { name: "Professeurs", path: "/professeurs", icon: BookOpen, description: "Outils pour l'enseignement" },
  { name: "Élèves", path: "/eleves", icon: GradCap, description: "L'école dans ta poche" },
];

const otherLinks = [
  { name: "Tutoriels", path: "/tutoriels" },
  { name: "Démo", path: "/demo" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(event.target as Node)) {
        setIsSolutionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass-nav shadow-glass" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">iDETUDE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Solutions Dropdown */}
            <div ref={solutionsRef} className="relative">
              <button
                onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1",
                  solutionsLinks.some(l => location.pathname === l.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                )}
              >
                Solutions
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isSolutionsOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {isSolutionsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 glass-card-solid rounded-xl border border-border/30 shadow-lg overflow-hidden z-50">
                  <div className="p-2">
                    {solutionsLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsSolutionsOpen(false)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                          location.pathname === link.path
                            ? "bg-primary/10"
                            : "hover:bg-primary/5"
                        )}
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <link.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{link.name}</p>
                          <p className="text-xs text-muted-foreground">{link.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {otherLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {profile?.first_name || "Mon espace"}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <GlassButton href="/auth" size="sm">
                Connexion
              </GlassButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-primary/5 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden glass-card-solid border-t border-border/30 overflow-hidden transition-all duration-300",
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === link.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              )}
            >
              {link.name}
            </Link>
          ))}

          {/* Solutions Mobile */}
          <div className="space-y-1">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Solutions</p>
            {solutionsLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </div>

          {otherLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === link.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-border/30 mt-2">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {profile?.first_name || "Mon espace"}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Se déconnecter</span>
                </button>
              </div>
            ) : (
              <GlassButton href="/auth" className="w-full">
                Connexion
              </GlassButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
