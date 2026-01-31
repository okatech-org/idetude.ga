import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FileText,
    FileSignature,
    Wallet,
    Edit,
    Plus,
    Trash2,
    Download,
    Eye,
    Copy,
    Briefcase,
    Users,
    GraduationCap,
    Settings,
    CheckCircle2,
    AlertCircle,
    Percent,
    Building2,
    Calculator,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface ContractTemplate {
    id: string;
    type: "permanent" | "contract" | "intern" | "vacation";
    label: string;
    defaultDuration: number; // months
    isActive: boolean;
    clauses: string[];
}

interface SalaryGridEntry {
    staffType: string;
    label: string;
    baseSalary: number;
    bonuses: {
        responsibility: number;
        seniority: number;
        performance: number;
    };
}

interface PayslipConfig {
    cnssRate: number;
    irsRate: number;
    showGross: boolean;
    showDeductions: boolean;
    footerText: string;
}

// Default data
const DEFAULT_CONTRACT_TEMPLATES: ContractTemplate[] = [
    {
        id: "ct-1",
        type: "permanent",
        label: "Contrat à Durée Indéterminée (CDI)",
        defaultDuration: 0,
        isActive: true,
        clauses: [
            "Période d'essai de 3 mois renouvelable une fois",
            "Préavis de démission: 1 mois",
            "Convention collective de l'enseignement privé",
        ],
    },
    {
        id: "ct-2",
        type: "contract",
        label: "Contrat à Durée Déterminée (CDD)",
        defaultDuration: 12,
        isActive: true,
        clauses: [
            "Durée du contrat: 12 mois",
            "Renouvellement possible 2 fois maximum",
            "Prime de fin de contrat: 10% du salaire brut",
        ],
    },
    {
        id: "ct-3",
        type: "intern",
        label: "Convention de Stage",
        defaultDuration: 6,
        isActive: true,
        clauses: [
            "Stage non rémunéré avec indemnité de transport",
            "Encadrement par un tuteur désigné",
            "Rapport de stage obligatoire",
        ],
    },
    {
        id: "ct-4",
        type: "vacation",
        label: "Contrat de Vacation",
        defaultDuration: 3,
        isActive: false,
        clauses: [
            "Paiement à l'heure effectuée",
            "Pas de lien de subordination permanent",
        ],
    },
];

const DEFAULT_SALARY_GRID: SalaryGridEntry[] = [
    {
        staffType: "direction",
        label: "Direction",
        baseSalary: 750000,
        bonuses: { responsibility: 100000, seniority: 50000, performance: 0 },
    },
    {
        staffType: "teacher",
        label: "Enseignant",
        baseSalary: 480000,
        bonuses: { responsibility: 50000, seniority: 30000, performance: 20000 },
    },
    {
        staffType: "admin",
        label: "Administratif",
        baseSalary: 400000,
        bonuses: { responsibility: 40000, seniority: 20000, performance: 20000 },
    },
    {
        staffType: "cpe",
        label: "CPE",
        baseSalary: 450000,
        bonuses: { responsibility: 40000, seniority: 20000, performance: 20000 },
    },
    {
        staffType: "surveillant",
        label: "Surveillant",
        baseSalary: 320000,
        bonuses: { responsibility: 20000, seniority: 15000, performance: 15000 },
    },
    {
        staffType: "maintenance",
        label: "Maintenance",
        baseSalary: 250000,
        bonuses: { responsibility: 15000, seniority: 15000, performance: 10000 },
    },
];

const DEFAULT_PAYSLIP_CONFIG: PayslipConfig = {
    cnssRate: 5.5,
    irsRate: 10,
    showGross: true,
    showDeductions: true,
    footerText: "Document généré automatiquement - Valeur probante",
};

const CONTRACT_MULTIPLIERS: Record<string, number> = {
    permanent: 1.0,
    contract: 0.85,
    intern: 0.45,
    vacation: 0.6,
};

interface HRConfigTabProps {
    establishmentId: string;
    establishmentName?: string;
}

export const HRConfigTab = ({
    establishmentId,
    establishmentName,
}: HRConfigTabProps) => {
    // State
    const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>(
        DEFAULT_CONTRACT_TEMPLATES
    );
    const [salaryGrid, setSalaryGrid] = useState<SalaryGridEntry[]>(
        DEFAULT_SALARY_GRID
    );
    const [payslipConfig, setPayslipConfig] =
        useState<PayslipConfig>(DEFAULT_PAYSLIP_CONFIG);

    // Modal states
    const [showContractModal, setShowContractModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [editingContract, setEditingContract] =
        useState<ContractTemplate | null>(null);
    const [editingSalary, setEditingSalary] = useState<SalaryGridEntry | null>(
        null
    );

    // Form states
    const [contractForm, setContractForm] = useState({
        type: "contract" as ContractTemplate["type"],
        label: "",
        defaultDuration: 12,
        clauses: "",
        isActive: true,
    });

    const [salaryForm, setSalaryForm] = useState({
        staffType: "",
        label: "",
        baseSalary: 400000,
        responsibilityBonus: 40000,
        seniorityBonus: 20000,
        performanceBonus: 20000,
    });

    // Helpers
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";

    const getContractTypeColor = (type: string) => {
        switch (type) {
            case "permanent":
                return "bg-green-500/10 text-green-600";
            case "contract":
                return "bg-blue-500/10 text-blue-600";
            case "intern":
                return "bg-amber-500/10 text-amber-600";
            case "vacation":
                return "bg-purple-500/10 text-purple-600";
            default:
                return "bg-gray-500/10 text-gray-600";
        }
    };

    const getContractTypeLabel = (type: string) => {
        switch (type) {
            case "permanent":
                return "CDI";
            case "contract":
                return "CDD";
            case "intern":
                return "Stage";
            case "vacation":
                return "Vacation";
            default:
                return type;
        }
    };

    // Contract handlers
    const handleSaveContract = () => {
        if (!contractForm.label) {
            toast.error("Le nom du modèle est obligatoire");
            return;
        }

        const clausesArray = contractForm.clauses
            .split("\n")
            .filter((c) => c.trim());

        if (editingContract) {
            setContractTemplates((prev) =>
                prev.map((ct) =>
                    ct.id === editingContract.id
                        ? {
                            ...ct,
                            type: contractForm.type,
                            label: contractForm.label,
                            defaultDuration: contractForm.defaultDuration,
                            clauses: clausesArray,
                            isActive: contractForm.isActive,
                        }
                        : ct
                )
            );
            toast.success("Modèle de contrat modifié");
        } else {
            const newContract: ContractTemplate = {
                id: `ct-${Date.now()}`,
                type: contractForm.type,
                label: contractForm.label,
                defaultDuration: contractForm.defaultDuration,
                clauses: clausesArray,
                isActive: contractForm.isActive,
            };
            setContractTemplates((prev) => [...prev, newContract]);
            toast.success("Modèle de contrat créé");
        }

        setShowContractModal(false);
        resetContractForm();
    };

    const handleEditContract = (contract: ContractTemplate) => {
        setEditingContract(contract);
        setContractForm({
            type: contract.type,
            label: contract.label,
            defaultDuration: contract.defaultDuration,
            clauses: contract.clauses.join("\n"),
            isActive: contract.isActive,
        });
        setShowContractModal(true);
    };

    const handleDeleteContract = (id: string) => {
        if (!confirm("Supprimer ce modèle de contrat ?")) return;
        setContractTemplates((prev) => prev.filter((ct) => ct.id !== id));
        toast.success("Modèle supprimé");
    };

    const handleToggleContract = (id: string) => {
        setContractTemplates((prev) =>
            prev.map((ct) =>
                ct.id === id ? { ...ct, isActive: !ct.isActive } : ct
            )
        );
    };

    const resetContractForm = () => {
        setContractForm({
            type: "contract",
            label: "",
            defaultDuration: 12,
            clauses: "",
            isActive: true,
        });
        setEditingContract(null);
    };

    // Salary handlers
    const handleSaveSalary = () => {
        if (!salaryForm.label || !salaryForm.staffType) {
            toast.error("Tous les champs obligatoires doivent être remplis");
            return;
        }

        if (editingSalary) {
            setSalaryGrid((prev) =>
                prev.map((sg) =>
                    sg.staffType === editingSalary.staffType
                        ? {
                            staffType: salaryForm.staffType,
                            label: salaryForm.label,
                            baseSalary: salaryForm.baseSalary,
                            bonuses: {
                                responsibility: salaryForm.responsibilityBonus,
                                seniority: salaryForm.seniorityBonus,
                                performance: salaryForm.performanceBonus,
                            },
                        }
                        : sg
                )
            );
            toast.success("Grille salariale modifiée");
        } else {
            const exists = salaryGrid.find(
                (sg) => sg.staffType === salaryForm.staffType
            );
            if (exists) {
                toast.error("Ce type de personnel existe déjà");
                return;
            }
            const newEntry: SalaryGridEntry = {
                staffType: salaryForm.staffType,
                label: salaryForm.label,
                baseSalary: salaryForm.baseSalary,
                bonuses: {
                    responsibility: salaryForm.responsibilityBonus,
                    seniority: salaryForm.seniorityBonus,
                    performance: salaryForm.performanceBonus,
                },
            };
            setSalaryGrid((prev) => [...prev, newEntry]);
            toast.success("Entrée ajoutée à la grille salariale");
        }

        setShowSalaryModal(false);
        resetSalaryForm();
    };

    const handleEditSalary = (entry: SalaryGridEntry) => {
        setEditingSalary(entry);
        setSalaryForm({
            staffType: entry.staffType,
            label: entry.label,
            baseSalary: entry.baseSalary,
            responsibilityBonus: entry.bonuses.responsibility,
            seniorityBonus: entry.bonuses.seniority,
            performanceBonus: entry.bonuses.performance,
        });
        setShowSalaryModal(true);
    };

    const resetSalaryForm = () => {
        setSalaryForm({
            staffType: "",
            label: "",
            baseSalary: 400000,
            responsibilityBonus: 40000,
            seniorityBonus: 20000,
            performanceBonus: 20000,
        });
        setEditingSalary(null);
    };

    // Calculate net salary
    const calculateNetSalary = (
        entry: SalaryGridEntry,
        contractType: keyof typeof CONTRACT_MULTIPLIERS = "permanent"
    ) => {
        const multiplier = CONTRACT_MULTIPLIERS[contractType];
        const gross =
            (entry.baseSalary +
                entry.bonuses.responsibility +
                entry.bonuses.seniority +
                entry.bonuses.performance) *
            multiplier;
        const cnss = gross * (payslipConfig.cnssRate / 100);
        const irs = gross * (payslipConfig.irsRate / 100);
        return gross - cnss - irs;
    };

    const handleGenerateContract = (template: ContractTemplate) => {
        toast.success("Génération du modèle de contrat en cours...", {
            description: `Modèle: ${template.label}`,
        });
        // Here would be PDF generation logic
    };

    return (
        <div className="space-y-6">
            {/* Section 1: Contract Templates */}
            <GlassCard className="p-6" solid>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                            <FileSignature className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Modèles de Contrats
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Configurez les types de contrats disponibles
                            </p>
                        </div>
                    </div>
                    <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                            resetContractForm();
                            setShowContractModal(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Nouveau modèle
                    </GlassButton>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {contractTemplates.map((template) => (
                        <div
                            key={template.id}
                            className={`p-4 rounded-lg border transition-colors ${template.isActive
                                    ? "bg-muted/30 border-border"
                                    : "bg-muted/10 border-dashed border-muted-foreground/30 opacity-60"
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Badge className={getContractTypeColor(template.type)}>
                                        {getContractTypeLabel(template.type)}
                                    </Badge>
                                    {!template.isActive && (
                                        <Badge variant="outline" className="text-xs">
                                            Inactif
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <GlassButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleContract(template.id)}
                                        title={template.isActive ? "Désactiver" : "Activer"}
                                    >
                                        {template.isActive ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </GlassButton>
                                    <GlassButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditContract(template)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </GlassButton>
                                    <GlassButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteContract(template.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </GlassButton>
                                </div>
                            </div>

                            <h4 className="font-medium text-foreground mb-1">
                                {template.label}
                            </h4>
                            {template.defaultDuration > 0 && (
                                <p className="text-xs text-muted-foreground mb-2">
                                    Durée par défaut: {template.defaultDuration} mois
                                </p>
                            )}

                            {template.clauses.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Clauses ({template.clauses.length}):
                                    </p>
                                    <ul className="text-xs text-muted-foreground space-y-0.5">
                                        {template.clauses.slice(0, 2).map((clause, idx) => (
                                            <li key={idx} className="truncate">
                                                • {clause}
                                            </li>
                                        ))}
                                        {template.clauses.length > 2 && (
                                            <li className="text-primary">
                                                +{template.clauses.length - 2} autres...
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-3 flex gap-2">
                                <GlassButton
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleGenerateContract(template)}
                                >
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                    Générer
                                </GlassButton>
                                <GlassButton variant="ghost" size="sm">
                                    <Eye className="h-3.5 w-3.5" />
                                </GlassButton>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Section 2: Salary Grid */}
            <GlassCard className="p-6" solid>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                Grille Salariale
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Définissez les salaires de base par corps de métier
                            </p>
                        </div>
                    </div>
                    <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                            resetSalaryForm();
                            setShowSalaryModal(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                    </GlassButton>
                </div>

                <ScrollArea className="h-[350px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Corps</TableHead>
                                <TableHead className="text-right">Salaire Base</TableHead>
                                <TableHead className="text-right">P. Responsabilité</TableHead>
                                <TableHead className="text-right">P. Ancienneté</TableHead>
                                <TableHead className="text-right">P. Performance</TableHead>
                                <TableHead className="text-right">Total Brut</TableHead>
                                <TableHead className="text-right">Net CDI*</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salaryGrid.map((entry) => {
                                const totalBrut =
                                    entry.baseSalary +
                                    entry.bonuses.responsibility +
                                    entry.bonuses.seniority +
                                    entry.bonuses.performance;
                                const netCDI = calculateNetSalary(entry, "permanent");

                                return (
                                    <TableRow key={entry.staffType}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{entry.label}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {formatCurrency(entry.baseSalary)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm text-green-600">
                                            +{formatCurrency(entry.bonuses.responsibility)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm text-blue-600">
                                            +{formatCurrency(entry.bonuses.seniority)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm text-purple-600">
                                            +{formatCurrency(entry.bonuses.performance)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium">
                                            {formatCurrency(totalBrut)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-primary">
                                            {formatCurrency(netCDI)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <GlassButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditSalary(entry)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </GlassButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        * Net calculé avec CNSS ({payslipConfig.cnssRate}%) et IRS (
                        {payslipConfig.irsRate}%)
                    </span>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">CDI: 100%</Badge>
                        <Badge variant="secondary">CDD: 85%</Badge>
                        <Badge variant="secondary">Stage: 45%</Badge>
                    </div>
                </div>
            </GlassCard>

            {/* Section 3: Payslip Config */}
            <GlassCard className="p-6" solid>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">
                            Configuration Fiche de Paie
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Paramètres des bulletins de salaire
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Cotisations */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <Percent className="h-4 w-4 text-primary" />
                            Cotisations Sociales
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <div>
                                    <Label className="text-sm">CNSS (Part salariale)</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Caisse Nationale de Sécurité Sociale
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GlassInput
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="20"
                                        value={payslipConfig.cnssRate}
                                        onChange={(e) =>
                                            setPayslipConfig({
                                                ...payslipConfig,
                                                cnssRate: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="w-20 text-center"
                                    />
                                    <span className="text-sm text-muted-foreground">%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <div>
                                    <Label className="text-sm">IRS (Impôt sur le revenu)</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Impôt sur les Revenus Salariaux
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GlassInput
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="50"
                                        value={payslipConfig.irsRate}
                                        onChange={(e) =>
                                            setPayslipConfig({
                                                ...payslipConfig,
                                                irsRate: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        className="w-20 text-center"
                                    />
                                    <span className="text-sm text-muted-foreground">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <Settings className="h-4 w-4 text-primary" />
                            Options d'affichage
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <div>
                                    <Label className="text-sm">Afficher le salaire brut</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Montrer le total avant déductions
                                    </p>
                                </div>
                                <Switch
                                    checked={payslipConfig.showGross}
                                    onCheckedChange={(checked) =>
                                        setPayslipConfig({ ...payslipConfig, showGross: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <div>
                                    <Label className="text-sm">Détail des déductions</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Afficher le détail CNSS/IRS
                                    </p>
                                </div>
                                <Switch
                                    checked={payslipConfig.showDeductions}
                                    onCheckedChange={(checked) =>
                                        setPayslipConfig({
                                            ...payslipConfig,
                                            showDeductions: checked,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Text */}
                <div className="mt-6 pt-4 border-t">
                    <Label className="text-sm">Pied de page du bulletin</Label>
                    <Textarea
                        value={payslipConfig.footerText}
                        onChange={(e) =>
                            setPayslipConfig({ ...payslipConfig, footerText: e.target.value })
                        }
                        placeholder="Texte affiché en bas du bulletin de paie"
                        className="mt-2"
                        rows={2}
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <GlassButton
                        variant="primary"
                        onClick={() => toast.success("Configuration sauvegardée")}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Enregistrer
                    </GlassButton>
                </div>
            </GlassCard>

            {/* Contract Template Modal */}
            <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSignature className="h-5 w-5 text-primary" />
                            {editingContract
                                ? "Modifier le modèle"
                                : "Nouveau modèle de contrat"}
                        </DialogTitle>
                        <DialogDescription>
                            Configurez les paramètres du modèle de contrat
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm">Type de contrat</Label>
                                <Select
                                    value={contractForm.type}
                                    onValueChange={(v) =>
                                        setContractForm({
                                            ...contractForm,
                                            type: v as ContractTemplate["type"],
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="permanent">CDI - Titulaire</SelectItem>
                                        <SelectItem value="contract">CDD - Contractuel</SelectItem>
                                        <SelectItem value="intern">Stage</SelectItem>
                                        <SelectItem value="vacation">Vacation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm">Durée par défaut (mois)</Label>
                                <GlassInput
                                    type="number"
                                    min="0"
                                    value={contractForm.defaultDuration}
                                    onChange={(e) =>
                                        setContractForm({
                                            ...contractForm,
                                            defaultDuration: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0 = Indéterminée"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm">Nom du modèle *</Label>
                            <GlassInput
                                value={contractForm.label}
                                onChange={(e) =>
                                    setContractForm({ ...contractForm, label: e.target.value })
                                }
                                placeholder="Ex: Contrat Enseignant CDI"
                            />
                        </div>

                        <div>
                            <Label className="text-sm">Clauses (une par ligne)</Label>
                            <Textarea
                                value={contractForm.clauses}
                                onChange={(e) =>
                                    setContractForm({ ...contractForm, clauses: e.target.value })
                                }
                                placeholder="Période d'essai de 3 mois&#10;Préavis de démission: 1 mois&#10;..."
                                rows={4}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <Label className="text-sm">Modèle actif</Label>
                            <Switch
                                checked={contractForm.isActive}
                                onCheckedChange={(checked) =>
                                    setContractForm({ ...contractForm, isActive: checked })
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <GlassButton
                            variant="outline"
                            onClick={() => setShowContractModal(false)}
                        >
                            Annuler
                        </GlassButton>
                        <GlassButton variant="primary" onClick={handleSaveContract}>
                            {editingContract ? "Modifier" : "Créer"}
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Salary Grid Modal */}
            <Dialog open={showSalaryModal} onOpenChange={setShowSalaryModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            {editingSalary
                                ? "Modifier la grille"
                                : "Ajouter à la grille salariale"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm">Code corps *</Label>
                                <GlassInput
                                    value={salaryForm.staffType}
                                    onChange={(e) =>
                                        setSalaryForm({
                                            ...salaryForm,
                                            staffType: e.target.value.toLowerCase(),
                                        })
                                    }
                                    placeholder="ex: teacher"
                                    disabled={!!editingSalary}
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Libellé *</Label>
                                <GlassInput
                                    value={salaryForm.label}
                                    onChange={(e) =>
                                        setSalaryForm({ ...salaryForm, label: e.target.value })
                                    }
                                    placeholder="ex: Enseignant"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm">Salaire de base (FCFA)</Label>
                            <GlassInput
                                type="number"
                                min="0"
                                step="10000"
                                value={salaryForm.baseSalary}
                                onChange={(e) =>
                                    setSalaryForm({
                                        ...salaryForm,
                                        baseSalary: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>

                        <div className="pt-2 border-t">
                            <Label className="text-sm text-muted-foreground">Primes</Label>
                            <div className="grid grid-cols-3 gap-3 mt-2">
                                <div>
                                    <Label className="text-xs">Responsabilité</Label>
                                    <GlassInput
                                        type="number"
                                        min="0"
                                        value={salaryForm.responsibilityBonus}
                                        onChange={(e) =>
                                            setSalaryForm({
                                                ...salaryForm,
                                                responsibilityBonus: parseInt(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Ancienneté</Label>
                                    <GlassInput
                                        type="number"
                                        min="0"
                                        value={salaryForm.seniorityBonus}
                                        onChange={(e) =>
                                            setSalaryForm({
                                                ...salaryForm,
                                                seniorityBonus: parseInt(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Performance</Label>
                                    <GlassInput
                                        type="number"
                                        min="0"
                                        value={salaryForm.performanceBonus}
                                        onChange={(e) =>
                                            setSalaryForm({
                                                ...salaryForm,
                                                performanceBonus: parseInt(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-primary/10 text-center">
                            <p className="text-sm text-muted-foreground">Total brut estimé</p>
                            <p className="text-xl font-bold text-primary">
                                {formatCurrency(
                                    salaryForm.baseSalary +
                                    salaryForm.responsibilityBonus +
                                    salaryForm.seniorityBonus +
                                    salaryForm.performanceBonus
                                )}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <GlassButton
                            variant="outline"
                            onClick={() => setShowSalaryModal(false)}
                        >
                            Annuler
                        </GlassButton>
                        <GlassButton variant="primary" onClick={handleSaveSalary}>
                            {editingSalary ? "Modifier" : "Ajouter"}
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HRConfigTab;
