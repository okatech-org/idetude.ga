import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/glass-card";
import { CountrySelector } from "@/components/demo/CountrySelector";
import { DemoAccountCard } from "@/components/demo/DemoAccountCard";
import { DemoAccordion } from "@/components/demo/DemoAccordion";
import { SchoolCard } from "@/components/demo/SchoolCard";
import { SchoolDetailHeader } from "@/components/demo/SchoolDetailHeader";
import { countries, type Country, type School } from "@/data/demo-accounts";
import {
  ArrowLeft,
  Building2,
  MapPin,
  School as SchoolIcon,
  Users,
  GraduationCap,
  BookOpen,
  Briefcase,
} from "lucide-react";

const Demo = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(["admin"]);

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
      setExpandedSections(["admin"]);
    } else {
      setSelectedCountry(null);
      setExpandedSections([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Découvrez iDETUDE en Action"
        subtitle={
          !selectedCountry
            ? "Sélectionnez un pays pour explorer les comptes de démonstration"
            : selectedSchool
            ? "Testez la plateforme avec les comptes ci-dessous"
            : `Explorez les établissements en ${selectedCountry.name}`
        }
      />

      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          {/* Back button */}
          {selectedCountry && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
          )}

          {/* Country Selection */}
          {!selectedCountry && (
            <CountrySelector
              countries={countries}
              onSelect={setSelectedCountry}
            />
          )}

          {/* Country Detail */}
          {selectedCountry && !selectedSchool && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              {/* Country Header */}
              <GlassCard className="p-6 text-center" solid>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-5xl">{selectedCountry.flag}</div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedCountry.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedCountry.schoolGroups.reduce((acc, g) => acc + g.schools.length, 0) +
                        selectedCountry.independentSchools.length}{" "}
                      établissements disponibles
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Ministry */}
              <DemoAccordion
                title={selectedCountry.ministry.name}
                icon={Briefcase}
                expanded={expandedSections.includes("ministry")}
                onToggle={() => toggleSection("ministry")}
                count={selectedCountry.ministry.accounts.length}
              >
                <div className="grid gap-3">
                  {selectedCountry.ministry.accounts.map((account) => (
                    <DemoAccountCard key={account.id} account={account} />
                  ))}
                </div>
              </DemoAccordion>

              {/* Regions */}
              {selectedCountry.regions.map((region) => (
                <DemoAccordion
                  key={region.id}
                  title={region.name}
                  icon={MapPin}
                  expanded={expandedSections.includes(region.id)}
                  onToggle={() => toggleSection(region.id)}
                  count={region.accounts.length}
                >
                  <div className="grid gap-3">
                    {region.accounts.map((account) => (
                      <DemoAccountCard key={account.id} account={account} />
                    ))}
                  </div>
                </DemoAccordion>
              ))}

              {/* School Groups */}
              {selectedCountry.schoolGroups.map((group) => (
                <DemoAccordion
                  key={group.id}
                  title={`${group.name}`}
                  icon={Building2}
                  expanded={expandedSections.includes(group.id)}
                  onToggle={() => toggleSection(group.id)}
                  badge={group.location}
                >
                  <div className="space-y-6">
                    {/* Group Direction */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Direction du Groupe
                      </h4>
                      <div className="grid gap-2">
                        {group.direction.map((account) => (
                          <DemoAccountCard key={account.id} account={account} compact />
                        ))}
                      </div>
                    </div>

                    {/* Schools */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <SchoolIcon className="h-4 w-4" />
                        Établissements ({group.schools.length})
                      </h4>
                      <div className="grid gap-3">
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
                </DemoAccordion>
              ))}

              {/* Independent Schools */}
              {selectedCountry.independentSchools.length > 0 && (
                <DemoAccordion
                  title="Établissements Indépendants"
                  icon={SchoolIcon}
                  expanded={expandedSections.includes("independent")}
                  onToggle={() => toggleSection("independent")}
                  badge={`${selectedCountry.independentSchools.length} établissements`}
                >
                  <div className="grid gap-3">
                    {selectedCountry.independentSchools.map((school) => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        onClick={() => setSelectedSchool(school)}
                      />
                    ))}
                  </div>
                </DemoAccordion>
              )}
            </div>
          )}

          {/* School Detail */}
          {selectedSchool && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <SchoolDetailHeader school={selectedSchool} />

              {/* Administration */}
              <DemoAccordion
                title="Administration"
                icon={Building2}
                expanded={expandedSections.includes("admin")}
                onToggle={() => toggleSection("admin")}
                count={selectedSchool.administration.length}
              >
                <div className="grid gap-3">
                  {selectedSchool.administration.map((account) => (
                    <DemoAccountCard key={account.id} account={account} />
                  ))}
                </div>
              </DemoAccordion>

              {/* Teachers */}
              <DemoAccordion
                title="Enseignants"
                icon={BookOpen}
                expanded={expandedSections.includes("teachers")}
                onToggle={() => toggleSection("teachers")}
                count={selectedSchool.teachers.length}
              >
                <div className="grid gap-3">
                  {selectedSchool.teachers.map((account) => (
                    <DemoAccountCard key={account.id} account={account} />
                  ))}
                </div>
              </DemoAccordion>

              {/* Students */}
              <DemoAccordion
                title="Élèves"
                icon={GraduationCap}
                expanded={expandedSections.includes("students")}
                onToggle={() => toggleSection("students")}
                count={selectedSchool.studentAccounts.length}
              >
                <div className="grid gap-3">
                  {selectedSchool.studentAccounts.map((account) => (
                    <DemoAccountCard key={account.id} account={account} />
                  ))}
                </div>
              </DemoAccordion>

              {/* Parents */}
              <DemoAccordion
                title="Parents"
                icon={Users}
                expanded={expandedSections.includes("parents")}
                onToggle={() => toggleSection("parents")}
                count={selectedSchool.parents.length}
              >
                <div className="grid gap-3">
                  {selectedSchool.parents.map((account) => (
                    <DemoAccountCard key={account.id} account={account} />
                  ))}
                </div>
              </DemoAccordion>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Demo;
