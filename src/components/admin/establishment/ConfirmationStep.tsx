import { cn } from "@/lib/utils";
import { 
  Building2, MapPin, GraduationCap, Users, Globe, Phone, Mail, 
  CheckCircle2, XCircle, MapPinned, School, Languages
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EstablishmentFormData, StaffMember, STAFF_TYPES } from "./types";
import {
  EDUCATION_SYSTEMS, ESTABLISHMENT_TYPES, COUNTRIES,
  getSelectedLevelsDisplay, getLanguageDesignation
} from "./constants";

interface ConfirmationStepProps {
  formData: EstablishmentFormData;
  staff: StaffMember[];
  languageDesignation: { label: string; icon: string; totalLanguages: number } | null;
  groupName?: string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  status?: "complete" | "incomplete" | "optional";
}

const Section = ({ title, icon, children, status = "complete" }: SectionProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {status === "complete" && (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      )}
      {status === "incomplete" && (
        <XCircle className="h-4 w-4 text-destructive" />
      )}
    </div>
    <div className="pl-6 space-y-2 text-sm">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-wrap gap-x-2", className)}>
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium">{value || <span className="text-muted-foreground italic">Non défini</span>}</span>
  </div>
);

export const ConfirmationStep = ({
  formData,
  staff,
  languageDesignation,
  groupName,
}: ConfirmationStepProps) => {
  // Compute full name preview
  const fullName = (() => {
    const elements: Record<string, string> = {
      type: formData.typesWithQualification[0]
        ? ESTABLISHMENT_TYPES.find(t => t.value === formData.typesWithQualification[0].type)?.label || ""
        : "",
      qualification: formData.typesWithQualification[0]?.qualification || "",
      designation: languageDesignation?.label || "",
      name: formData.name || "",
    };
    return formData.nameElementsOrder
      .map(key => elements[key])
      .filter(Boolean)
      .join(" ");
  })();

  const countryInfo = COUNTRIES.find(c => c.code === formData.country_code);
  const hasLocation = formData.latitude !== null && formData.longitude !== null;

  // Staff summary
  const staffByType = STAFF_TYPES.reduce((acc, type) => {
    const count = staff.filter(s => s.staff_type === type.value).length;
    if (count > 0) {
      acc.push({ ...type, count });
    }
    return acc;
  }, [] as Array<typeof STAFF_TYPES[number] & { count: number }>);

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <h3 className="text-lg font-semibold">Récapitulatif de l'établissement</h3>
        <p className="text-sm text-muted-foreground">Vérifiez les informations avant de créer</p>
      </div>

      {/* Full name preview */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-2 border-primary/30 text-center">
        <p className="text-xs text-muted-foreground mb-1">Nom complet de l'établissement</p>
        <p className="text-xl font-bold text-primary">{fullName || "—"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Identification */}
        <div className="p-4 rounded-lg border bg-card space-y-4">
          <Section 
            title="Identification" 
            icon={<Building2 className="h-4 w-4 text-primary" />}
            status={formData.name && formData.typesWithQualification.length > 0 ? "complete" : "incomplete"}
          >
            <InfoRow label="Nom" value={formData.name} />
            <InfoRow 
              label="Type(s)" 
              value={
                formData.typesWithQualification.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {formData.typesWithQualification.map((twq, idx) => {
                      const typeInfo = ESTABLISHMENT_TYPES.find(t => t.value === twq.type);
                      return (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {typeInfo?.label}{twq.qualification ? ` ${twq.qualification}` : ""}
                        </Badge>
                      );
                    })}
                  </div>
                ) : null
              } 
            />
            {groupName && <InfoRow label="Groupe" value={groupName} />}
          </Section>

          <Separator />

          <Section 
            title="Système éducatif" 
            icon={<Globe className="h-4 w-4 text-primary" />}
            status={formData.educationSystems.length > 0 ? "complete" : "incomplete"}
          >
            <InfoRow 
              label="Système(s)" 
              value={
                formData.educationSystems.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {formData.educationSystems.map(sysValue => {
                      const sys = EDUCATION_SYSTEMS.find(s => s.value === sysValue);
                      return (
                        <Badge key={sysValue} variant="outline" className="text-xs">
                          {sys?.icon} {sys?.label}
                        </Badge>
                      );
                    })}
                  </div>
                ) : null
              } 
            />
            {languageDesignation && (
              <InfoRow label="Désignation" value={languageDesignation.label} />
            )}
            {formData.additionalTeachingLanguages.length > 0 && (
              <InfoRow 
                label="Langues additionnelles" 
                value={formData.additionalTeachingLanguages.join(", ")} 
              />
            )}
          </Section>
        </div>

        {/* Niveaux & Contact */}
        <div className="p-4 rounded-lg border bg-card space-y-4">
          <Section 
            title="Niveaux scolaires" 
            icon={<GraduationCap className="h-4 w-4 text-primary" />}
            status={formData.selectedLevels.length > 0 ? "complete" : "incomplete"}
          >
            <InfoRow 
              label="Niveaux" 
              value={getSelectedLevelsDisplay(formData.selectedLevels)} 
            />
            {formData.classesConfig.length > 0 && (
              <InfoRow 
                label="Classes configurées" 
                value={`${formData.classesConfig.reduce((sum, lc) => sum + lc.classes.length, 0)} classe(s)`} 
              />
            )}
            {formData.options.length > 0 && (
              <InfoRow 
                label="Options" 
                value={
                  <div className="flex flex-wrap gap-1">
                    {formData.options.filter(o => !o.startsWith("system:") && !o.startsWith("teaching_lang:") && !o.startsWith("designation:")).map(opt => (
                      <Badge key={opt} variant="secondary" className="text-xs">{opt}</Badge>
                    ))}
                  </div>
                } 
              />
            )}
          </Section>

          <Separator />

          <Section 
            title="Localisation & Contact" 
            icon={<MapPinned className="h-4 w-4 text-primary" />}
            status={hasLocation ? "complete" : "incomplete"}
          >
            <InfoRow 
              label="Pays" 
              value={countryInfo ? `${countryInfo.flag} ${countryInfo.name}` : formData.country_code} 
            />
            <InfoRow 
              label="GPS" 
              value={
                hasLocation ? (
                  <span className="text-green-600 dark:text-green-400">
                    {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-destructive">Non défini (obligatoire)</span>
                )
              } 
            />
            {formData.address && <InfoRow label="Adresse" value={formData.address} />}
            {formData.phone && <InfoRow label="Téléphone" value={formData.phone} />}
            {formData.email && <InfoRow label="Email" value={formData.email} />}
          </Section>
        </div>
      </div>

      {/* Personnel summary */}
      {staff.length > 0 && (
        <div className="p-4 rounded-lg border bg-card">
          <Section 
            title={`Personnel (${staff.length} membre${staff.length > 1 ? "s" : ""})`}
            icon={<Users className="h-4 w-4 text-primary" />}
            status="optional"
          >
            <div className="flex flex-wrap gap-2">
              {staffByType.map(type => (
                <Badge 
                  key={type.value} 
                  variant="outline" 
                  className="text-xs flex items-center gap-1"
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-primary/10 rounded-full text-primary font-semibold">
                    {type.count}
                  </span>
                </Badge>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Validation status */}
      <div className="p-3 rounded-lg bg-muted/50 border">
        <div className="flex items-center gap-2">
          {hasLocation && formData.name && formData.educationSystems.length > 0 && 
           formData.typesWithQualification.length > 0 && formData.selectedLevels.length > 0 ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Toutes les informations obligatoires sont renseignées
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Certaines informations obligatoires sont manquantes
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
