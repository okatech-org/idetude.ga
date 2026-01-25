import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { countries, getCountryStats, type Country, type School, type DemoAccount } from "@/data/demo-accounts";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  School as SchoolIcon,
  Users,
  GraduationCap,
  BookOpen,
  Copy,
  LogIn,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Demo = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleBack = () => {
    if (selectedSchool) {
      setSelectedSchool(null);
    } else {
      setSelectedCountry(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Découvrez iDETUDE en Action"
        subtitle="Sélectionnez un pays pour accéder aux comptes de démonstration"
      />

      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          {/* Back button */}
          {selectedCountry && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          )}

          {/* Country Selection */}
          {!selectedCountry && (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {countries.map((country, index) => {
                const stats = getCountryStats(country);
                return (
                  <GlassCard
                    key={country.code}
                    className="p-8 cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                    onClick={() => setSelectedCountry(country)}
                  >
                    <div className="text-center">
                      <div className="text-7xl mb-4">{country.flag}</div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {country.name}
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        {stats.totalSchools} établissements
                        {stats.totalGroups > 0 && ` • ${stats.totalGroups} groupe scolaire`}
                      </p>
                      <GlassButton variant="outline">
                        Explorer <ArrowRight className="h-4 w-4" />
                      </GlassButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Country Detail */}
          {selectedCountry && !selectedSchool && (
            <div className="max-w-4xl mx-auto space-y-6 animate-glass-in">
              {/* Country Header */}
              <GlassCard className="p-6 text-center">
                <div className="text-5xl mb-2">{selectedCountry.flag}</div>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCountry.name}
                </h2>
              </GlassCard>

              {/* Ministry */}
              <AccordionSection
                title={selectedCountry.ministry.name}
                icon={Building2}
                expanded={expandedSections.includes("ministry")}
                onToggle={() => toggleSection("ministry")}
              >
                <div className="grid gap-3">
                  {selectedCountry.ministry.accounts.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </AccordionSection>

              {/* Regions */}
              {selectedCountry.regions.map((region) => (
                <AccordionSection
                  key={region.id}
                  title={region.name}
                  icon={MapPin}
                  expanded={expandedSections.includes(region.id)}
                  onToggle={() => toggleSection(region.id)}
                >
                  <div className="grid gap-3">
                    {region.accounts.map((account) => (
                      <AccountCard key={account.id} account={account} />
                    ))}
                  </div>
                </AccordionSection>
              ))}

              {/* School Groups */}
              {selectedCountry.schoolGroups.map((group) => (
                <AccordionSection
                  key={group.id}
                  title={`${group.name} (${group.location})`}
                  icon={Building2}
                  expanded={expandedSections.includes(group.id)}
                  onToggle={() => toggleSection(group.id)}
                  badge={`${group.schools.length} établissements`}
                >
                  <div className="space-y-4">
                    {/* Group Direction */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Direction du Groupe
                      </h4>
                      <div className="grid gap-2">
                        {group.direction.map((account) => (
                          <AccountCard key={account.id} account={account} compact />
                        ))}
                      </div>
                    </div>

                    {/* Schools */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Établissements
                      </h4>
                      <div className="grid gap-2">
                        {group.schools.map((school) => (
                          <SchoolCard
                            key={school.id}
                            school={school}
                            onClick={() => setSelectedSchool(school)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionSection>
              ))}

              {/* Independent Schools */}
              {selectedCountry.independentSchools.length > 0 && (
                <AccordionSection
                  title="Établissements Indépendants"
                  icon={SchoolIcon}
                  expanded={expandedSections.includes("independent")}
                  onToggle={() => toggleSection("independent")}
                  badge={`${selectedCountry.independentSchools.length} établissements`}
                >
                  <div className="grid gap-2">
                    {selectedCountry.independentSchools.map((school) => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        onClick={() => setSelectedSchool(school)}
                      />
                    ))}
                  </div>
                </AccordionSection>
              )}
            </div>
          )}

          {/* School Detail */}
          {selectedSchool && (
            <div className="max-w-4xl mx-auto space-y-6 animate-glass-in">
              <GlassCard className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <SchoolIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {selectedSchool.name}
                    </h2>
                    <p className="text-muted-foreground flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      {selectedSchool.address}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                        {selectedSchool.levels}
                      </span>
                      <span className="px-2 py-1 rounded bg-accent/10 text-accent">
                        {selectedSchool.studentCount} élèves
                      </span>
                      {selectedSchool.options?.map((opt) => (
                        <span key={opt} className="px-2 py-1 rounded bg-muted text-muted-foreground">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Administration */}
              <AccordionSection
                title="Administration"
                icon={Building2}
                expanded={expandedSections.includes("admin")}
                onToggle={() => toggleSection("admin")}
                defaultExpanded
              >
                <div className="grid gap-3">
                  {selectedSchool.administration.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </AccordionSection>

              {/* Teachers */}
              <AccordionSection
                title="Enseignants"
                icon={BookOpen}
                expanded={expandedSections.includes("teachers")}
                onToggle={() => toggleSection("teachers")}
              >
                <div className="grid gap-3">
                  {selectedSchool.teachers.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </AccordionSection>

              {/* Students */}
              <AccordionSection
                title="Élèves"
                icon={GraduationCap}
                expanded={expandedSections.includes("students")}
                onToggle={() => toggleSection("students")}
              >
                <div className="grid gap-3">
                  {selectedSchool.studentAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </AccordionSection>

              {/* Parents */}
              <AccordionSection
                title="Parents"
                icon={Users}
                expanded={expandedSections.includes("parents")}
                onToggle={() => toggleSection("parents")}
              >
                <div className="grid gap-3">
                  {selectedSchool.parents.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </AccordionSection>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Accordion Section Component
interface AccordionSectionProps {
  title: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  defaultExpanded?: boolean;
}

const AccordionSection = ({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
  badge,
}: AccordionSectionProps) => (
  <GlassCard className="overflow-hidden" hover={false}>
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="font-semibold text-foreground">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
            {badge}
          </span>
        )}
      </div>
      {expanded ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
    <div
      className={cn(
        "overflow-hidden transition-all duration-300",
        expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="p-4 pt-0">{children}</div>
    </div>
  </GlassCard>
);

// School Card Component
interface SchoolCardProps {
  school: School;
  onClick: () => void;
}

const SchoolCard = ({ school, onClick }: SchoolCardProps) => (
  <button
    onClick={onClick}
    className="w-full p-4 rounded-lg glass-card text-left hover:bg-primary/5 transition-all flex items-center justify-between group"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <SchoolIcon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-medium text-foreground">{school.name}</p>
        <p className="text-sm text-muted-foreground">
          {school.levels} • {school.studentCount} élèves
        </p>
      </div>
    </div>
    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
  </button>
);

// Account Card Component
interface AccountCardProps {
  account: DemoAccount;
  compact?: boolean;
}

const AccountCard = ({ account, compact = false }: AccountCardProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Email copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickLogin = () => {
    toast.info("Redirection vers la connexion...");
    // In a real app, this would redirect to the login page with pre-filled credentials
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.role}</p>
          </div>
        </div>
        <button
          onClick={() => copyToClipboard(account.email)}
          className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    );
  }

  return (
    <GlassCard className="p-4" hover={false}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
              {account.role}
            </span>
          </div>
          <p className="font-medium text-foreground">{account.name}</p>
          <p className="text-sm text-muted-foreground truncate">{account.email}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => copyToClipboard(account.email)}
            className="p-2 rounded-lg glass-card hover:bg-primary/10 transition-colors"
            title="Copier l'email"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={handleQuickLogin}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <LogIn className="h-4 w-4" />
            Connexion
          </button>
        </div>
      </div>
      <div className="mt-3 p-2 rounded-lg bg-muted/30 flex items-center justify-between">
        <code className="text-xs text-muted-foreground">
          Mot de passe: {account.password}
        </code>
      </div>
    </GlassCard>
  );
};

export default Demo;
