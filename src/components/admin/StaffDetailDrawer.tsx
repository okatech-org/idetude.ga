import { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    FileText,
    Download,
    Printer,
    Eye,
    Clock,
    DollarSign,
    TrendingUp,
    Award,
    GraduationCap,
    FileCheck,
    FilePlus,
    Wallet,
    CalendarDays,
    CalendarX,
    History,
    Building2,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Edit,
    X,
    MoreVertical,
    ClipboardList,
    UserCheck,
    Shield,
    BookOpen,
    Save,
    Upload,
    Send,
    Trash2,
    Check,
    Ban,
} from "lucide-react";

interface StaffMember {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    staff_type: string;
    position: string | null;
    department?: string | null;
    contract_type: string | null;
    is_active: boolean;
    start_date: string | null;
    subjects?: string;
    classes?: string;
    is_class_principal?: boolean;
    pp_class?: string;
}

interface StaffDetailDrawerProps {
    staff: StaffMember | null;
    open: boolean;
    onClose: () => void;
    onUpdate?: (staff: StaffMember) => void;
    establishmentName?: string;
}

// Salary grid based on Gabonese civil service scale
const SALARY_GRID: Record<string, { base: number; bonuses: number }> = {
    direction: { base: 750000, bonuses: 150000 },
    admin: { base: 400000, bonuses: 80000 },
    teacher: { base: 480000, bonuses: 100000 },
    cpe: { base: 450000, bonuses: 80000 },
    surveillant: { base: 320000, bonuses: 50000 },
    maintenance: { base: 250000, bonuses: 40000 },
    other: { base: 280000, bonuses: 45000 },
};

const CONTRACT_MULTIPLIER: Record<string, number> = {
    permanent: 1.0,
    contract: 0.85,
    intern: 0.45,
};

interface Payslip {
    id: string;
    month: string;
    year: number;
    baseSalary: number;
    bonuses: number;
    overtime: number;
    deductions: number;
    netSalary: number;
    status: 'pending' | 'paid';
    paidDate: string | null;
}

// Generate demo payslip history
const generatePayslipHistory = (staff: StaffMember): Payslip[] => {
    const grid = SALARY_GRID[staff.staff_type] || SALARY_GRID.other;
    const multiplier = CONTRACT_MULTIPLIER[staff.contract_type || 'contract'] || 0.85;
    const baseSalary = grid.base * multiplier;
    const bonuses = grid.bonuses * multiplier;

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const currentMonth = new Date().getMonth();
    const currentYear = 2026;

    const payslips: Payslip[] = [];
    for (let i = 0; i < 12; i++) {
        const monthIdx = (currentMonth - i + 12) % 12;
        const year = i > currentMonth ? currentYear - 1 : currentYear;
        const overtime = Math.random() > 0.7 ? Math.floor(Math.random() * 50000) : 0;
        const deductions = Math.floor((baseSalary + bonuses) * 0.12);

        payslips.push({
            id: `payslip-${i}`,
            month: months[monthIdx],
            year,
            baseSalary,
            bonuses,
            overtime,
            deductions,
            netSalary: baseSalary + bonuses + overtime - deductions,
            status: i === 0 ? 'pending' : 'paid',
            paidDate: i === 0 ? null : `${15 + Math.floor(Math.random() * 5)}/${String(monthIdx + 1).padStart(2, '0')}/${year}`,
        });
    }
    return payslips;
};

interface Contract {
    id: string;
    type: string;
    startDate: string;
    endDate: string | null;
    status: 'active' | 'completed';
    position: string | null;
    salary: number;
}

const generateContractHistory = (staff: StaffMember): Contract[] => {
    const startYear = staff.start_date ? parseInt(staff.start_date.split('-')[0]) : 2020;
    const contracts: Contract[] = [];

    if (staff.contract_type === 'permanent') {
        contracts.push({
            id: 'contract-1',
            type: 'CDI',
            startDate: `01/09/${startYear}`,
            endDate: null,
            status: 'active',
            position: staff.position,
            salary: (SALARY_GRID[staff.staff_type]?.base || 280000) + (SALARY_GRID[staff.staff_type]?.bonuses || 45000),
        });
        if (startYear < 2024) {
            contracts.push({
                id: 'contract-0',
                type: 'CDD',
                startDate: `01/09/${startYear - 2}`,
                endDate: `31/08/${startYear}`,
                status: 'completed',
                position: staff.position,
                salary: (SALARY_GRID[staff.staff_type]?.base || 280000) * 0.85,
            });
        }
    } else if (staff.contract_type === 'contract') {
        contracts.push({
            id: 'contract-1',
            type: 'CDD',
            startDate: `01/09/${startYear}`,
            endDate: `31/08/${startYear + 2}`,
            status: 'active',
            position: staff.position,
            salary: (SALARY_GRID[staff.staff_type]?.base || 280000) * 0.85 + (SALARY_GRID[staff.staff_type]?.bonuses || 45000) * 0.85,
        });
    } else {
        contracts.push({
            id: 'contract-1',
            type: 'Stage',
            startDate: `01/09/2025`,
            endDate: `31/08/2026`,
            status: 'active',
            position: `Stagiaire ${staff.position || ''}`,
            salary: (SALARY_GRID[staff.staff_type]?.base || 280000) * 0.45,
        });
    }

    return contracts;
};

interface Document {
    id: string;
    type: string;
    name: string;
    date: string;
    status: 'valid' | 'expired' | 'pending';
}

const generateDocuments = (staff: StaffMember): Document[] => {
    return [
        { id: 'doc-1', type: 'Contrat de travail', name: `Contrat_${staff.last_name}_2024.pdf`, date: '01/09/2024', status: 'valid' },
        { id: 'doc-2', type: 'Pièce d\'identité', name: 'CNI_scan.pdf', date: '15/01/2023', status: 'valid' },
        { id: 'doc-3', type: 'Diplôme', name: 'Licence_Education.pdf', date: '01/07/2018', status: 'valid' },
        { id: 'doc-4', type: 'RIB', name: 'RIB_banque.pdf', date: '20/08/2024', status: 'valid' },
        { id: 'doc-5', type: 'Attestation CNSS', name: 'Attestation_CNSS_2025.pdf', date: '05/01/2025', status: 'valid' },
        { id: 'doc-6', type: 'Certificat médical', name: 'Aptitude_travail_2024.pdf', date: '28/08/2024', status: 'valid' },
    ];
};

interface LeaveBalance {
    annual: { total: number; used: number; remaining: number };
    sick: { total: number; used: number; remaining: number };
    special: { total: number; used: number; remaining: number };
}

const generateLeaveBalance = (): LeaveBalance => ({
    annual: { total: 30, used: 8, remaining: 22 },
    sick: { total: 15, used: 2, remaining: 13 },
    special: { total: 10, used: 3, remaining: 7 },
});

interface LeaveRequest {
    id: string;
    type: string;
    start: string;
    end: string;
    days: number;
    status: 'approved' | 'pending' | 'rejected';
    reason: string;
}

const generateLeaveHistory = (): LeaveRequest[] => [
    { id: 'leave-1', type: 'Congé annuel', start: '23/12/2025', end: '02/01/2026', days: 8, status: 'approved', reason: 'Fêtes de fin d\'année' },
    { id: 'leave-2', type: 'Congé maladie', start: '15/11/2025', end: '16/11/2025', days: 2, status: 'approved', reason: 'Grippe' },
    { id: 'leave-3', type: 'Congé spécial', start: '10/10/2025', end: '12/10/2025', days: 3, status: 'approved', reason: 'Événement familial' },
    { id: 'leave-4', type: 'Congé annuel', start: '01/03/2026', end: '05/03/2026', days: 5, status: 'pending', reason: 'Vacances' },
];

export const StaffDetailDrawer = ({ staff, open, onClose, onUpdate, establishmentName }: StaffDetailDrawerProps) => {
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<StaffMember>>({});

    // Modal states
    const [showPayslipModal, setShowPayslipModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);

    // Leave request form
    const [leaveForm, setLeaveForm] = useState({
        type: 'Congé annuel',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

    const payslips = useMemo(() => staff ? generatePayslipHistory(staff) : [], [staff]);
    const contracts = useMemo(() => staff ? generateContractHistory(staff) : [], [staff]);
    const documents = useMemo(() => staff ? generateDocuments(staff) : [], [staff]);
    const leaveBalance = useMemo(() => generateLeaveBalance(), []);
    const initialLeaveHistory = useMemo(() => generateLeaveHistory(), []);

    // Initialize leave requests from demo data
    useMemo(() => {
        if (leaveRequests.length === 0) {
            setLeaveRequests(initialLeaveHistory);
        }
    }, [initialLeaveHistory]);

    if (!staff) return null;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';

    const getContractLabel = (type: string | null) => {
        if (type === 'permanent') return { label: 'Titulaire (CDI)', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
        if (type === 'contract') return { label: 'Contractuel (CDD)', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        if (type === 'intern') return { label: 'Stagiaire', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
        return { label: type || 'N/A', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' };
    };

    const getStaffTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            direction: 'Direction',
            teacher: 'Enseignant',
            admin: 'Administratif',
            cpe: 'CPE',
            surveillant: 'Surveillant',
            maintenance: 'Maintenance',
            other: 'Autre',
        };
        return labels[type] || type;
    };

    const grid = SALARY_GRID[staff.staff_type] || SALARY_GRID.other;
    const multiplier = CONTRACT_MULTIPLIER[staff.contract_type || 'contract'] || 0.85;
    const currentSalary = (grid.base + grid.bonuses) * multiplier;
    const contract = getContractLabel(staff.contract_type);

    const yearPayslips = payslips.filter(p => p.year === 2026);
    const totalPaidYTD = yearPayslips.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.netSalary, 0);

    // Action handlers
    const handleStartEdit = () => {
        setEditForm({
            first_name: staff.first_name,
            last_name: staff.last_name,
            email: staff.email,
            phone: staff.phone || '',
            position: staff.position,
            department: staff.department,
        });
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        toast.success(`Profil de ${staff.first_name} ${staff.last_name} mis à jour`, {
            description: "Les modifications ont été enregistrées avec succès."
        });
        setIsEditing(false);
        if (onUpdate) {
            onUpdate({ ...staff, ...editForm });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({});
    };

    const handleViewPayslip = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setShowPayslipModal(true);
    };

    const handleDownloadPayslip = (payslip: Payslip) => {
        toast.success(`Téléchargement du bulletin de paie`, {
            description: `${payslip.month} ${payslip.year} - ${staff.first_name} ${staff.last_name}`
        });
    };

    const handlePrintPayslip = (payslip: Payslip) => {
        toast.info(`Impression en cours...`, {
            description: `Bulletin de ${payslip.month} ${payslip.year}`
        });
        window.print();
    };

    const handleExportAllPayslips = () => {
        toast.success(`Export des bulletins de paie`, {
            description: `12 bulletins exportés pour ${staff.first_name} ${staff.last_name}`
        });
    };

    const handleDownloadContract = (contractItem: Contract) => {
        toast.success(`Téléchargement du contrat`, {
            description: `${contractItem.type} - ${contractItem.startDate}`
        });
    };

    const handleViewContract = (contractItem: Contract) => {
        toast.info(`Ouverture du contrat ${contractItem.type}`, {
            description: `Du ${contractItem.startDate} ${contractItem.endDate ? `au ${contractItem.endDate}` : '(durée indéterminée)'}`
        });
    };

    const handleNewContract = () => {
        setShowContractModal(true);
    };

    const handleDownloadDocument = (doc: Document) => {
        toast.success(`Téléchargement de ${doc.type}`, {
            description: doc.name
        });
    };

    const handleAddDocument = () => {
        setShowDocumentModal(true);
    };

    const handleUploadDocument = (type: string) => {
        setShowDocumentModal(false);
        toast.success(`Document ajouté`, {
            description: `${type} a été ajouté au dossier.`
        });
    };

    const handleNewLeaveRequest = () => {
        setLeaveForm({
            type: 'Congé annuel',
            startDate: '',
            endDate: '',
            reason: '',
        });
        setShowLeaveModal(true);
    };

    const handleSubmitLeaveRequest = () => {
        if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
            toast.error("Tous les champs sont requis");
            return;
        }

        const start = new Date(leaveForm.startDate);
        const end = new Date(leaveForm.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const newRequest: LeaveRequest = {
            id: `leave-${Date.now()}`,
            type: leaveForm.type,
            start: start.toLocaleDateString('fr-FR'),
            end: end.toLocaleDateString('fr-FR'),
            days,
            status: 'pending',
            reason: leaveForm.reason,
        };

        setLeaveRequests([newRequest, ...leaveRequests]);
        setShowLeaveModal(false);
        toast.success(`Demande de congé soumise`, {
            description: `${days} jours du ${newRequest.start} au ${newRequest.end}`
        });
    };

    const handleApproveLeave = (leaveId: string) => {
        setLeaveRequests(prev => prev.map(l =>
            l.id === leaveId ? { ...l, status: 'approved' as const } : l
        ));
        toast.success("Demande de congé approuvée");
    };

    const handleRejectLeave = (leaveId: string) => {
        setLeaveRequests(prev => prev.map(l =>
            l.id === leaveId ? { ...l, status: 'rejected' as const } : l
        ));
        toast.error("Demande de congé rejetée");
    };

    const handleDeleteLeave = (leaveId: string) => {
        setLeaveRequests(prev => prev.filter(l => l.id !== leaveId));
        toast.info("Demande de congé supprimée");
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                    {staff.first_name[0]}{staff.last_name[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{staff.first_name} {staff.last_name}</h2>
                                    <p className="text-muted-foreground">{staff.position || getStaffTypeLabel(staff.staff_type)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className={contract.color}>{contract.label}</Badge>
                                        <Badge variant={staff.is_active ? "default" : "destructive"}>
                                            {staff.is_active ? "Actif" : "Inactif"}
                                        </Badge>
                                        {staff.is_class_principal && (
                                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                PP {staff.pp_class}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <GlassButton variant="outline" size="sm" onClick={handleCancelEdit}>
                                            <X className="h-4 w-4 mr-1" />
                                            Annuler
                                        </GlassButton>
                                        <GlassButton variant="primary" size="sm" onClick={handleSaveEdit}>
                                            <Save className="h-4 w-4 mr-1" />
                                            Enregistrer
                                        </GlassButton>
                                    </>
                                ) : (
                                    <GlassButton variant="outline" size="sm" onClick={handleStartEdit}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Modifier
                                    </GlassButton>
                                )}
                                <GlassButton variant="ghost" size="sm" onClick={onClose}>
                                    <X className="h-4 w-4" />
                                </GlassButton>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            <div className="text-center p-3 rounded-lg bg-background/50">
                                <p className="text-lg font-bold text-primary">{formatCurrency(currentSalary)}</p>
                                <p className="text-xs text-muted-foreground">Salaire mensuel</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-background/50">
                                <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaidYTD)}</p>
                                <p className="text-xs text-muted-foreground">Versé en 2026</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-background/50">
                                <p className="text-lg font-bold text-blue-600">{leaveBalance.annual.remaining}</p>
                                <p className="text-xs text-muted-foreground">Jours de congés</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-background/50">
                                <p className="text-lg font-bold">{contracts.length}</p>
                                <p className="text-xs text-muted-foreground">Contrat(s)</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="profile" className="text-xs">
                                    <User className="h-4 w-4 mr-1" />
                                    Profil
                                </TabsTrigger>
                                <TabsTrigger value="payroll" className="text-xs">
                                    <Wallet className="h-4 w-4 mr-1" />
                                    Paie
                                </TabsTrigger>
                                <TabsTrigger value="contracts" className="text-xs">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Contrats
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="text-xs">
                                    <FileCheck className="h-4 w-4 mr-1" />
                                    Documents
                                </TabsTrigger>
                                <TabsTrigger value="leaves" className="text-xs">
                                    <CalendarDays className="h-4 w-4 mr-1" />
                                    Congés
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="h-[400px] px-6 pb-6">
                            {/* Profile Tab */}
                            <TabsContent value="profile" className="mt-4 space-y-6">
                                {/* Contact Information */}
                                <GlassCard className="p-4">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary" />
                                        Informations de Contact
                                    </h4>
                                    {isEditing ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs">Prénom</Label>
                                                <GlassInput
                                                    value={editForm.first_name || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Nom</Label>
                                                <GlassInput
                                                    value={editForm.last_name || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Email</Label>
                                                <GlassInput
                                                    type="email"
                                                    value={editForm.email || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Téléphone</Label>
                                                <GlassInput
                                                    value={editForm.phone || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                    placeholder="+241 XX XX XX XX"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Email</p>
                                                    <p className="font-medium">{staff.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Téléphone</p>
                                                    <p className="font-medium">{staff.phone || 'Non renseigné'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Établissement</p>
                                                    <p className="font-medium">{establishmentName || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Date d'embauche</p>
                                                    <p className="font-medium">{staff.start_date ? new Date(staff.start_date).toLocaleDateString('fr-FR') : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>

                                {/* Employment Details */}
                                <GlassCard className="p-4">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-primary" />
                                        Détails de l'Emploi
                                    </h4>
                                    {isEditing ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs">Poste</Label>
                                                <GlassInput
                                                    value={editForm.position || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Département</Label>
                                                <GlassInput
                                                    value={editForm.department || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Corps</p>
                                                <Badge variant="outline" className="mt-1">{getStaffTypeLabel(staff.staff_type)}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Poste</p>
                                                <p className="font-medium">{staff.position || 'Non défini'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Type de contrat</p>
                                                <Badge className={contract.color}>{contract.label}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Département</p>
                                                <p className="font-medium">{staff.department || 'Non défini'}</p>
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>

                                {/* Teaching Info (for teachers) */}
                                {staff.staff_type === 'teacher' && !isEditing && (
                                    <GlassCard className="p-4">
                                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            Informations Pédagogiques
                                        </h4>
                                        <div className="space-y-3">
                                            {staff.subjects && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-2">Matières enseignées</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {staff.subjects.split(',').map((s, i) => (
                                                            <Badge key={i} variant="secondary">{s.trim()}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {staff.classes && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-2">Classes</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {staff.classes.split(',').map((c, i) => (
                                                            <Badge key={i} variant="outline">{c.trim()}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {staff.is_class_principal && (
                                                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10">
                                                    <Award className="h-5 w-5 text-amber-600" />
                                                    <span className="font-medium text-amber-600">Professeur Principal - {staff.pp_class}</span>
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>
                                )}
                            </TabsContent>

                            {/* Payroll Tab */}
                            <TabsContent value="payroll" className="mt-4 space-y-6">
                                {/* Salary Breakdown */}
                                <GlassCard className="p-4">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        Décomposition Salariale Mensuelle
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span>Salaire de base</span>
                                            <span className="font-mono">{formatCurrency(grid.base * multiplier)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span>Primes et indemnités</span>
                                            <span className="font-mono text-green-600">+ {formatCurrency(grid.bonuses * multiplier)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span>Retenues (CNSS, IRPP)</span>
                                            <span className="font-mono text-red-600">- {formatCurrency((grid.base + grid.bonuses) * multiplier * 0.12)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 font-bold text-lg">
                                            <span>Net à payer</span>
                                            <span className="font-mono text-primary">{formatCurrency(currentSalary * 0.88)}</span>
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Payslip History */}
                                <GlassCard className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <History className="h-4 w-4 text-primary" />
                                            Historique des Bulletins de Paie
                                        </h4>
                                        <GlassButton variant="outline" size="sm" onClick={handleExportAllPayslips}>
                                            <Download className="h-4 w-4 mr-1" />
                                            Tout exporter
                                        </GlassButton>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Période</TableHead>
                                                <TableHead className="text-right">Brut</TableHead>
                                                <TableHead className="text-right">Retenues</TableHead>
                                                <TableHead className="text-right">Net</TableHead>
                                                <TableHead className="text-center">Statut</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payslips.map((p) => (
                                                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                                                    <TableCell className="font-medium">{p.month} {p.year}</TableCell>
                                                    <TableCell className="text-right font-mono text-sm">{formatCurrency(p.baseSalary + p.bonuses + p.overtime)}</TableCell>
                                                    <TableCell className="text-right font-mono text-sm text-red-600">- {formatCurrency(p.deductions)}</TableCell>
                                                    <TableCell className="text-right font-mono font-medium">{formatCurrency(p.netSalary)}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={p.status === 'paid' ? 'default' : 'secondary'}>
                                                            {p.status === 'paid' ? 'Payé' : 'En attente'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <GlassButton variant="ghost" size="sm" title="Voir" onClick={() => handleViewPayslip(p)}>
                                                                <Eye className="h-4 w-4" />
                                                            </GlassButton>
                                                            <GlassButton variant="ghost" size="sm" title="Télécharger" onClick={() => handleDownloadPayslip(p)}>
                                                                <Download className="h-4 w-4" />
                                                            </GlassButton>
                                                            <GlassButton variant="ghost" size="sm" title="Imprimer" onClick={() => handlePrintPayslip(p)}>
                                                                <Printer className="h-4 w-4" />
                                                            </GlassButton>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </GlassCard>
                            </TabsContent>

                            {/* Contracts Tab */}
                            <TabsContent value="contracts" className="mt-4 space-y-6">
                                <GlassCard className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            Historique des Contrats
                                        </h4>
                                        <GlassButton variant="outline" size="sm" onClick={handleNewContract}>
                                            <FilePlus className="h-4 w-4 mr-1" />
                                            Nouveau contrat
                                        </GlassButton>
                                    </div>
                                    <div className="space-y-4">
                                        {contracts.map((c, idx) => (
                                            <div key={c.id} className={`relative p-4 rounded-lg border-2 ${c.status === 'active' ? 'border-green-500/50 bg-green-500/5' : 'border-muted'}`}>
                                                {idx < contracts.length - 1 && (
                                                    <div className="absolute left-6 top-full w-0.5 h-4 bg-muted" />
                                                )}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.status === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">{c.type}</span>
                                                                <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                                                                    {c.status === 'active' ? 'En cours' : 'Terminé'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">{c.position}</p>
                                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {c.startDate} → {c.endDate || 'Indéterminé'}
                                                                </span>
                                                                <span className="flex items-center gap-1 font-mono">
                                                                    <DollarSign className="h-3 w-3" />
                                                                    {formatCurrency(c.salary)}/mois
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <GlassButton variant="ghost" size="sm" onClick={() => handleViewContract(c)}>
                                                            <Eye className="h-4 w-4" />
                                                        </GlassButton>
                                                        <GlassButton variant="ghost" size="sm" onClick={() => handleDownloadContract(c)}>
                                                            <Download className="h-4 w-4" />
                                                        </GlassButton>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </TabsContent>

                            {/* Documents Tab */}
                            <TabsContent value="documents" className="mt-4 space-y-6">
                                <GlassCard className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <FileCheck className="h-4 w-4 text-primary" />
                                            Dossier Administratif
                                        </h4>
                                        <GlassButton variant="outline" size="sm" onClick={handleAddDocument}>
                                            <FilePlus className="h-4 w-4 mr-1" />
                                            Ajouter
                                        </GlassButton>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{doc.type}</p>
                                                        <p className="text-xs text-muted-foreground">{doc.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="outline" className="text-green-600 border-green-500/30 text-xs">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Valide
                                                    </Badge>
                                                    <GlassButton variant="ghost" size="sm" onClick={() => handleDownloadDocument(doc)}>
                                                        <Download className="h-4 w-4" />
                                                    </GlassButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </TabsContent>

                            {/* Leaves Tab */}
                            <TabsContent value="leaves" className="mt-4 space-y-6">
                                {/* Leave Balance */}
                                <div className="grid grid-cols-3 gap-4">
                                    <GlassCard className="p-4 text-center">
                                        <CalendarDays className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                        <p className="text-2xl font-bold">{leaveBalance.annual.remaining}</p>
                                        <p className="text-xs text-muted-foreground">Congés annuels</p>
                                        <Progress value={(leaveBalance.annual.used / leaveBalance.annual.total) * 100} className="h-1.5 mt-2" />
                                        <p className="text-xs text-muted-foreground mt-1">{leaveBalance.annual.used}/{leaveBalance.annual.total} utilisés</p>
                                    </GlassCard>
                                    <GlassCard className="p-4 text-center">
                                        <CalendarX className="h-8 w-8 mx-auto mb-2 text-red-500" />
                                        <p className="text-2xl font-bold">{leaveBalance.sick.remaining}</p>
                                        <p className="text-xs text-muted-foreground">Congés maladie</p>
                                        <Progress value={(leaveBalance.sick.used / leaveBalance.sick.total) * 100} className="h-1.5 mt-2" />
                                        <p className="text-xs text-muted-foreground mt-1">{leaveBalance.sick.used}/{leaveBalance.sick.total} utilisés</p>
                                    </GlassCard>
                                    <GlassCard className="p-4 text-center">
                                        <Award className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                                        <p className="text-2xl font-bold">{leaveBalance.special.remaining}</p>
                                        <p className="text-xs text-muted-foreground">Congés spéciaux</p>
                                        <Progress value={(leaveBalance.special.used / leaveBalance.special.total) * 100} className="h-1.5 mt-2" />
                                        <p className="text-xs text-muted-foreground mt-1">{leaveBalance.special.used}/{leaveBalance.special.total} utilisés</p>
                                    </GlassCard>
                                </div>

                                {/* Leave History */}
                                <GlassCard className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <History className="h-4 w-4 text-primary" />
                                            Historique des Demandes
                                        </h4>
                                        <GlassButton variant="primary" size="sm" onClick={handleNewLeaveRequest}>
                                            <FilePlus className="h-4 w-4 mr-1" />
                                            Nouvelle demande
                                        </GlassButton>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Période</TableHead>
                                                <TableHead className="text-center">Jours</TableHead>
                                                <TableHead>Motif</TableHead>
                                                <TableHead className="text-center">Statut</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {leaveRequests.map((leave) => (
                                                <TableRow key={leave.id}>
                                                    <TableCell className="font-medium">{leave.type}</TableCell>
                                                    <TableCell className="text-sm">{leave.start} → {leave.end}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline">{leave.days}j</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{leave.reason}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={leave.status === 'approved' ? 'default' : leave.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                            {leave.status === 'approved' ? (
                                                                <><CheckCircle2 className="h-3 w-3 mr-1" /> Approuvé</>
                                                            ) : leave.status === 'rejected' ? (
                                                                <><XCircle className="h-3 w-3 mr-1" /> Rejeté</>
                                                            ) : (
                                                                <><Clock className="h-3 w-3 mr-1" /> En attente</>
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {leave.status === 'pending' && (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <GlassButton
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-green-600 hover:text-green-700"
                                                                    onClick={() => handleApproveLeave(leave.id)}
                                                                    title="Approuver"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </GlassButton>
                                                                <GlassButton
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700"
                                                                    onClick={() => handleRejectLeave(leave.id)}
                                                                    title="Rejeter"
                                                                >
                                                                    <Ban className="h-4 w-4" />
                                                                </GlassButton>
                                                                <GlassButton
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-muted-foreground"
                                                                    onClick={() => handleDeleteLeave(leave.id)}
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </GlassButton>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </GlassCard>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Payslip Detail Modal */}
            <Dialog open={showPayslipModal} onOpenChange={setShowPayslipModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            Bulletin de Paie
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPayslip?.month} {selectedPayslip?.year} - {staff.first_name} {staff.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayslip && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Salaire de base</span>
                                    <span className="font-mono">{formatCurrency(selectedPayslip.baseSalary)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Primes</span>
                                    <span className="font-mono text-green-600">+ {formatCurrency(selectedPayslip.bonuses)}</span>
                                </div>
                                {selectedPayslip.overtime > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Heures sup.</span>
                                        <span className="font-mono text-blue-600">+ {formatCurrency(selectedPayslip.overtime)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Retenues</span>
                                    <span className="font-mono text-red-600">- {formatCurrency(selectedPayslip.deductions)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Net à payer</span>
                                    <span className="font-mono text-primary">{formatCurrency(selectedPayslip.netSalary)}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <Badge variant={selectedPayslip.status === 'paid' ? 'default' : 'secondary'}>
                                    {selectedPayslip.status === 'paid' ? 'Payé' : 'En attente'}
                                </Badge>
                                {selectedPayslip.paidDate && (
                                    <span className="text-muted-foreground">Payé le {selectedPayslip.paidDate}</span>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <GlassButton variant="outline" onClick={() => setShowPayslipModal(false)}>
                            Fermer
                        </GlassButton>
                        <GlassButton variant="outline" onClick={() => selectedPayslip && handlePrintPayslip(selectedPayslip)}>
                            <Printer className="h-4 w-4 mr-1" />
                            Imprimer
                        </GlassButton>
                        <GlassButton variant="primary" onClick={() => selectedPayslip && handleDownloadPayslip(selectedPayslip)}>
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Leave Request Modal */}
            <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-primary" />
                            Nouvelle Demande de Congé
                        </DialogTitle>
                        <DialogDescription>
                            Soumettre une demande pour {staff.first_name} {staff.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Type de congé</Label>
                            <Select value={leaveForm.type} onValueChange={(v) => setLeaveForm({ ...leaveForm, type: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Congé annuel">Congé annuel</SelectItem>
                                    <SelectItem value="Congé maladie">Congé maladie</SelectItem>
                                    <SelectItem value="Congé spécial">Congé spécial</SelectItem>
                                    <SelectItem value="Congé maternité">Congé maternité</SelectItem>
                                    <SelectItem value="Congé paternité">Congé paternité</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Date de début</Label>
                                <GlassInput
                                    type="date"
                                    value={leaveForm.startDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Date de fin</Label>
                                <GlassInput
                                    type="date"
                                    value={leaveForm.endDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Motif</Label>
                            <Textarea
                                value={leaveForm.reason}
                                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                placeholder="Décrivez le motif de votre demande..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <GlassButton variant="outline" onClick={() => setShowLeaveModal(false)}>
                            Annuler
                        </GlassButton>
                        <GlassButton variant="primary" onClick={handleSubmitLeaveRequest}>
                            <Send className="h-4 w-4 mr-1" />
                            Soumettre
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Document Modal */}
            <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            Ajouter un Document
                        </DialogTitle>
                        <DialogDescription>
                            Sélectionnez le type de document à ajouter
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        {['Contrat de travail', 'Avenant', 'Attestation', 'Diplôme', 'Certificat médical', 'RIB', 'Pièce d\'identité', 'Autre'].map((type) => (
                            <GlassButton
                                key={type}
                                variant="outline"
                                className="h-20 flex-col gap-2"
                                onClick={() => handleUploadDocument(type)}
                            >
                                <FileText className="h-6 w-6" />
                                <span className="text-xs">{type}</span>
                            </GlassButton>
                        ))}
                    </div>
                    <DialogFooter>
                        <GlassButton variant="outline" onClick={() => setShowDocumentModal(false)}>
                            Annuler
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Contract Modal */}
            <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Nouveau Contrat
                        </DialogTitle>
                        <DialogDescription>
                            Créer un nouveau contrat pour {staff.first_name} {staff.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Type de contrat</Label>
                            <Select defaultValue="CDD">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CDI">CDI - Contrat à Durée Indéterminée</SelectItem>
                                    <SelectItem value="CDD">CDD - Contrat à Durée Déterminée</SelectItem>
                                    <SelectItem value="Stage">Convention de Stage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Date de début</Label>
                                <GlassInput type="date" defaultValue="2026-02-01" />
                            </div>
                            <div>
                                <Label>Date de fin</Label>
                                <GlassInput type="date" />
                            </div>
                        </div>
                        <div>
                            <Label>Poste</Label>
                            <GlassInput defaultValue={staff.position || ''} />
                        </div>
                        <div>
                            <Label>Salaire mensuel (FCFA)</Label>
                            <GlassInput type="number" defaultValue={currentSalary.toString()} />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <GlassButton variant="outline" onClick={() => setShowContractModal(false)}>
                            Annuler
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            onClick={() => {
                                setShowContractModal(false);
                                toast.success("Contrat créé avec succès", {
                                    description: `Nouveau contrat pour ${staff.first_name} ${staff.last_name}`
                                });
                            }}
                        >
                            <FileCheck className="h-4 w-4 mr-1" />
                            Créer le contrat
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StaffDetailDrawer;
