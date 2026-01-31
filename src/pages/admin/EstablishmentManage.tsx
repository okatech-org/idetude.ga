import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { GlassInput } from "@/components/ui/glass-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { StaffDetailDrawer } from "@/components/admin/StaffDetailDrawer";
import {
    ArrowLeft,
    Briefcase,
    Users,
    Receipt,
    FileText,
    GraduationCap,
    BarChart3,
    Building2,
    Calendar,
    Clock,
    UserPlus,
    FileCheck,
    Wallet,
    AlertCircle,
    User,
    DollarSign,
    Eye,
    Download,
    Send,
    Bell,
    CheckCircle2,
    XCircle,
    TrendingUp,
    TrendingDown,
    Printer,
    Mail,
    Phone,
    MapPin,
    AlertTriangle,
    Clock3,
    FileSignature,
    CreditCard,
    PiggyBank,
    Banknote,
    Calculator,
    ClipboardList,
    BookOpen,
    Award,
    UserCheck,
    UserX,
    Settings,
    ChevronRight,
    Plus,
    Filter,
    Search,
    RefreshCw,
    MoreHorizontal,
    Edit,
    Trash2,
    ExternalLink,
} from "lucide-react";

interface Establishment {
    id: string;
    name: string;
    code: string | null;
    type: string;
    address: string | null;
}

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

interface ClassInfo {
    id: string;
    name: string;
    level: string;
    section?: string;
    student_count?: string | number;
    capacity?: string | number;
    main_teacher?: string;
}

// Helper to safely parse numbers from API (may return strings)
const parseNum = (val: string | number | null | undefined): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
};

// Salary grid based on Gabonese civil service scale (demo)
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

// Tuition fees by level (demo)
const TUITION_FEES: Record<string, number> = {
    "6ème": 125000,
    "5ème": 125000,
    "4ème": 135000,
    "3ème": 145000,
    "2nde": 165000,
    "1ère": 175000,
    "Tle": 185000,
};

const EstablishmentManage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, roles: userRoles, isLoading: authLoading } = useAuth();
    const [establishment, setEstablishment] = useState<Establishment | null>(null);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter and Add Staff states
    const [filterType, setFilterType] = useState<string>("all");
    const [filterContract, setFilterContract] = useState<string>("all");
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [newStaffForm, setNewStaffForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        staff_type: "teacher",
        position: "",
        contract_type: "contract",
        department: "",
        // New HR fields
        hire_date: new Date().toISOString().split('T')[0],
        end_date: "",
        diploma: "",
        cnss_number: "",
        rib: "",
        address: "",
    });


    const establishmentId = searchParams.get("id");

    useEffect(() => {
        if (!authLoading && (!user || !userRoles.includes("super_admin"))) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, userRoles, authLoading, navigate]);

    useEffect(() => {
        if (establishmentId) {
            fetchAllData();
        }
    }, [establishmentId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [estRes, staffRes, classesRes] = await Promise.all([
                fetch(`/api/db/establishments/${establishmentId}`),
                fetch(`/api/db/establishments/${establishmentId}/staff-detailed`),
                fetch(`/api/db/establishments/${establishmentId}/classes`),
            ]);

            if (!estRes.ok) throw new Error("Failed to fetch establishment");
            const estData = await estRes.json();
            setEstablishment(estData);

            if (staffRes.ok) {
                const staffData = await staffRes.json();
                setStaff(staffData || []);
            }

            if (classesRes.ok) {
                const classesData = await classesRes.json();
                setClasses(classesData || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const activeStaff = staff.filter(s => s.is_active);
    const teacherCount = activeStaff.filter(s => s.staff_type === 'teacher').length;
    const adminCount = activeStaff.filter(s => s.staff_type !== 'teacher').length;
    const totalStudents = classes.reduce((acc, c) => acc + parseNum(c.student_count), 0);
    const totalCapacity = classes.reduce((acc, c) => acc + (parseNum(c.capacity) || 35), 0);
    const occupancyRate = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

    // Calculate payroll
    const calculateSalary = (s: StaffMember) => {
        const grid = SALARY_GRID[s.staff_type] || SALARY_GRID.other;
        const multiplier = CONTRACT_MULTIPLIER[s.contract_type || 'contract'] || 0.85;
        return (grid.base + grid.bonuses) * multiplier;
    };

    const totalPayroll = activeStaff.reduce((acc, s) => acc + calculateSalary(s), 0);
    const totalTuition = classes.reduce((acc, c) => {
        const fee = TUITION_FEES[c.level] || 150000;
        return acc + (fee * parseNum(c.student_count));
    }, 0);

    // Group staff by type
    const staffByType = {
        direction: activeStaff.filter(s => s.staff_type === 'direction'),
        teachers: activeStaff.filter(s => s.staff_type === 'teacher'),
        admin: activeStaff.filter(s => s.staff_type === 'admin'),
        vieScolaire: activeStaff.filter(s => ['cpe', 'surveillant'].includes(s.staff_type)),
        services: activeStaff.filter(s => ['maintenance', 'other'].includes(s.staff_type)),
    };

    // Filtered staff for search and filters
    const filteredStaff = activeStaff.filter(s => {
        const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.position?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || s.staff_type === filterType;
        const matchesContract = filterContract === "all" || s.contract_type === filterContract;
        return matchesSearch && matchesType && matchesContract;
    });

    // Add staff handler
    const handleAddStaff = () => {
        if (!newStaffForm.first_name || !newStaffForm.last_name || !newStaffForm.email) {
            toast.error("Veuillez remplir les champs obligatoires");
            return;
        }

        const newStaff: StaffMember = {
            id: `staff-${Date.now()}`,
            first_name: newStaffForm.first_name,
            last_name: newStaffForm.last_name,
            email: newStaffForm.email,
            phone: newStaffForm.phone || undefined,
            staff_type: newStaffForm.staff_type,
            position: newStaffForm.position || null,
            department: newStaffForm.department || null,
            contract_type: newStaffForm.contract_type,
            is_active: true,
            start_date: newStaffForm.hire_date || new Date().toISOString().split('T')[0],
        };

        setStaff([...staff, newStaff]);
        setShowAddStaffModal(false);
        setNewStaffForm({
            first_name: "", last_name: "", email: "", phone: "",
            staff_type: "teacher", position: "", contract_type: "contract", department: "",
            hire_date: new Date().toISOString().split('T')[0], end_date: "",
            diploma: "", cnss_number: "", rib: "", address: "",
        });
        toast.success(`${newStaff.first_name} ${newStaff.last_name} ajouté(e)`, {
            description: `Poste: ${newStaff.position || getStaffTypeLabel(newStaff.staff_type)}`
        });
    };


    // Export staff list
    const handleExportStaff = () => {
        toast.success("Export en cours...", {
            description: `${filteredStaff.length} agent(s) exportés au format CSV`
        });
    };

    // Clear filters
    const handleClearFilters = () => {
        setFilterType("all");
        setFilterContract("all");
        setSearchTerm("");
        toast.info("Filtres réinitialisés");
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';

    const getContractLabel = (type: string | null) => {
        if (type === 'permanent') return { label: 'Titulaire', color: 'bg-green-500/10 text-green-600' };
        if (type === 'contract') return { label: 'Contractuel', color: 'bg-blue-500/10 text-blue-600' };
        if (type === 'intern') return { label: 'Stagiaire', color: 'bg-amber-500/10 text-amber-600' };
        return { label: type || 'N/A', color: 'bg-gray-500/10 text-gray-600' };
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

    if (authLoading || loading) {
        return (
            <UserLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </UserLayout>
        );
    }

    if (!establishment) {
        return (
            <UserLayout>
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Établissement non trouvé</p>
                    <GlassButton onClick={() => navigate("/admin/establishments")} className="mt-4">
                        Retour à la liste
                    </GlassButton>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 flex-wrap">
                    <GlassButton variant="ghost" size="sm" onClick={() => navigate("/admin/establishments")}>
                        <ArrowLeft className="h-4 w-4" />
                    </GlassButton>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Hub de Gestion</h1>
                                <p className="text-muted-foreground">{establishment.name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            2024-2025
                        </Badge>
                        <GlassButton variant="ghost" size="sm" onClick={fetchAllData}>
                            <RefreshCw className="h-4 w-4" />
                        </GlassButton>
                        <GlassButton variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                        </GlassButton>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                        <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Tableau de bord</span>
                        </TabsTrigger>
                        <TabsTrigger value="rh" className="flex items-center gap-2 py-3">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">RH</span>
                            <Badge variant="secondary" className="ml-1 text-xs">{activeStaff.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="finance" className="flex items-center gap-2 py-3">
                            <Wallet className="h-4 w-4" />
                            <span className="hidden sm:inline">Finance</span>
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="flex items-center gap-2 py-3">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Administration</span>
                        </TabsTrigger>
                        <TabsTrigger value="reporting" className="flex items-center gap-2 py-3">
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Reporting</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6">
                        {/* KPI Cards Row 1 */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <GlassCard className="p-4" solid>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Personnel Actif</p>
                                        <p className="text-3xl font-bold text-foreground mt-1">{activeStaff.length}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {teacherCount} enseignants • {adminCount} admin
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-4" solid>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Élèves Inscrits</p>
                                        <p className="text-3xl font-bold text-foreground mt-1">{totalStudents}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Progress value={occupancyRate} className="w-16 h-1.5" />
                                            <span className="text-xs text-muted-foreground">{occupancyRate.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <GraduationCap className="h-5 w-5 text-green-500" />
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-4" solid>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Masse Salariale</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalPayroll)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">/mois</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <Banknote className="h-5 w-5 text-purple-500" />
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-4" solid>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Recettes Scolarité</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalTuition)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">/an estimé</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <PiggyBank className="h-5 w-5 text-amber-500" />
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Quick Actions + Alerts */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Quick Actions */}
                            <GlassCard className="p-6 lg:col-span-2" solid>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    Actions Rapides
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("rh")}>
                                        <UserPlus className="h-6 w-6 text-blue-500" />
                                        <span className="text-xs">Nouveau Personnel</span>
                                    </GlassButton>
                                    <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("admin")}>
                                        <GraduationCap className="h-6 w-6 text-green-500" />
                                        <span className="text-xs">Nouvelle Inscription</span>
                                    </GlassButton>
                                    <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("finance")}>
                                        <CreditCard className="h-6 w-6 text-purple-500" />
                                        <span className="text-xs">Saisir Paiement</span>
                                    </GlassButton>
                                    <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("admin")}>
                                        <FileSignature className="h-6 w-6 text-amber-500" />
                                        <span className="text-xs">Générer Certificat</span>
                                    </GlassButton>
                                    <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("rh")}>
                                        <Calendar className="h-6 w-6 text-red-500" />
                                        <span className="text-xs">Saisir Absence</span>
                                    </GlassButton>
                                    <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("finance")}>
                                        <Printer className="h-6 w-6 text-cyan-500" />
                                        <span className="text-xs">Imprimer Facture</span>
                                    </GlassButton>
                                    <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("rh")}>
                                        <Clock className="h-6 w-6 text-orange-500" />
                                        <span className="text-xs">Pointage</span>
                                    </GlassButton>
                                    <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("reporting")}>
                                        <Download className="h-6 w-6 text-indigo-500" />
                                        <span className="text-xs">Exporter Données</span>
                                    </GlassButton>
                                </div>
                            </GlassCard>

                            {/* Alerts & Notifications */}
                            <GlassCard className="p-6" solid>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-amber-500" />
                                    Alertes
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">3 contrats expirent ce mois</p>
                                            <p className="text-xs text-muted-foreground">À renouveler avant le 28/02</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <Clock3 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Paie à valider</p>
                                            <p className="text-xs text-muted-foreground">{activeStaff.length} bulletins en attente</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Inscriptions complètes</p>
                                            <p className="text-xs text-muted-foreground">{totalStudents} élèves confirmés</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Staff Overview + Classes */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Staff by Category */}
                            <GlassCard className="p-6" solid>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        Répartition du Personnel
                                    </h3>
                                    <GlassButton variant="ghost" size="sm" onClick={() => setActiveTab("rh")}>
                                        Voir tout <ChevronRight className="h-4 w-4 ml-1" />
                                    </GlassButton>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Direction', count: staffByType.direction.length, color: 'bg-purple-500', max: 10 },
                                        { label: 'Enseignants', count: staffByType.teachers.length, color: 'bg-blue-500', max: 30 },
                                        { label: 'Administration', count: staffByType.admin.length, color: 'bg-green-500', max: 10 },
                                        { label: 'Vie Scolaire', count: staffByType.vieScolaire.length, color: 'bg-orange-500', max: 15 },
                                        { label: 'Services', count: staffByType.services.length, color: 'bg-gray-500', max: 10 },
                                    ].map((item) => (
                                        <div key={item.label} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{item.label}</span>
                                                <span className="font-medium">{item.count}</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.color} transition-all`}
                                                    style={{ width: `${(item.count / item.max) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            {/* Classes Overview */}
                            <GlassCard className="p-6" solid>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-green-500" />
                                        Classes ({classes.length})
                                    </h3>
                                    <GlassButton variant="ghost" size="sm" onClick={() => navigate(`/admin/establishments/config?id=${establishmentId}`)}>
                                        Configurer <ChevronRight className="h-4 w-4 ml-1" />
                                    </GlassButton>
                                </div>
                                <ScrollArea className="h-[200px]">
                                    <div className="space-y-2">
                                        {classes.map((c) => (
                                            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline">{c.level}</Badge>
                                                    <span className="font-medium">{c.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">{parseNum(c.student_count)} élèves</span>
                                                    <GlassButton variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </GlassButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </GlassCard>
                        </div>
                    </TabsContent>

                    {/* RH Tab */}
                    <TabsContent value="rh" className="space-y-6">
                        {/* RH Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <GlassCard className="p-4 text-center">
                                <p className="text-2xl font-bold text-purple-600">{staffByType.direction.length}</p>
                                <p className="text-xs text-muted-foreground">Direction</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center">
                                <p className="text-2xl font-bold text-blue-600">{staffByType.teachers.length}</p>
                                <p className="text-xs text-muted-foreground">Enseignants</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center">
                                <p className="text-2xl font-bold text-green-600">{staffByType.admin.length}</p>
                                <p className="text-xs text-muted-foreground">Administratifs</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center">
                                <p className="text-2xl font-bold text-orange-600">{staffByType.vieScolaire.length}</p>
                                <p className="text-xs text-muted-foreground">Vie Scolaire</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center">
                                <p className="text-2xl font-bold text-gray-600">{staffByType.services.length}</p>
                                <p className="text-xs text-muted-foreground">Services</p>
                            </GlassCard>
                        </div>

                        {/* Staff Table */}
                        <GlassCard className="p-6" solid>
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-purple-500" />
                                    Gestion du Personnel & Paie
                                </h3>
                                <div className="flex items-center gap-2">
                                    <GlassInput
                                        icon={Search}
                                        placeholder="Rechercher..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-48"
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <GlassButton variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-1" />
                                                Filtrer
                                                {(filterType !== 'all' || filterContract !== 'all') && (
                                                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                                        {(filterType !== 'all' ? 1 : 0) + (filterContract !== 'all' ? 1 : 0)}
                                                    </Badge>
                                                )}
                                            </GlassButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>Type de personnel</DropdownMenuLabel>
                                            <DropdownMenuCheckboxItem checked={filterType === 'all'} onCheckedChange={() => setFilterType('all')}>Tous</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterType === 'direction'} onCheckedChange={() => setFilterType('direction')}>Direction</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterType === 'teacher'} onCheckedChange={() => setFilterType('teacher')}>Enseignants</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterType === 'admin'} onCheckedChange={() => setFilterType('admin')}>Administratifs</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterType === 'cpe'} onCheckedChange={() => setFilterType('cpe')}>CPE</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterType === 'surveillant'} onCheckedChange={() => setFilterType('surveillant')}>Surveillants</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterType === 'maintenance'} onCheckedChange={() => setFilterType('maintenance')}>Maintenance</DropdownMenuCheckboxItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Type de contrat</DropdownMenuLabel>
                                            <DropdownMenuCheckboxItem checked={filterContract === 'all'} onCheckedChange={() => setFilterContract('all')}>Tous</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterContract === 'permanent'} onCheckedChange={() => setFilterContract('permanent')}>Titulaires (CDI)</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterContract === 'contract'} onCheckedChange={() => setFilterContract('contract')}>Contractuels (CDD)</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={filterContract === 'intern'} onCheckedChange={() => setFilterContract('intern')}>Stagiaires</DropdownMenuCheckboxItem>
                                            <DropdownMenuSeparator />
                                            <GlassButton variant="ghost" size="sm" className="w-full justify-start" onClick={handleClearFilters}>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Réinitialiser
                                            </GlassButton>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <GlassButton variant="outline" size="sm" onClick={handleExportStaff}>
                                        <Download className="h-4 w-4 mr-1" />
                                        Export
                                    </GlassButton>
                                    <GlassButton variant="primary" size="sm" onClick={() => setShowAddStaffModal(true)}>
                                        <UserPlus className="h-4 w-4 mr-1" />
                                        Ajouter
                                    </GlassButton>
                                </div>
                            </div>
                            <ScrollArea className="h-[450px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Agent</TableHead>
                                            <TableHead>Fonction</TableHead>
                                            <TableHead>Corps</TableHead>
                                            <TableHead>Contrat</TableHead>
                                            <TableHead className="text-right">Salaire Base</TableHead>
                                            <TableHead className="text-right">Primes</TableHead>
                                            <TableHead className="text-right">Net</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStaff.map((s) => {
                                            const grid = SALARY_GRID[s.staff_type] || SALARY_GRID.other;
                                            const multiplier = CONTRACT_MULTIPLIER[s.contract_type || 'contract'] || 0.85;
                                            const contract = getContractLabel(s.contract_type);
                                            return (
                                                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedStaff(s); setShowStaffModal(true); }}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{s.first_name} {s.last_name}</p>
                                                                <p className="text-xs text-muted-foreground">{s.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{s.position || '-'}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {getStaffTypeLabel(s.staff_type)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`text-xs ${contract.color}`}>
                                                            {contract.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-sm">
                                                        {formatCurrency(grid.base * multiplier)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-sm">
                                                        {formatCurrency(grid.bonuses * multiplier)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-medium">
                                                        {formatCurrency((grid.base + grid.bonuses) * multiplier)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <GlassButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedStaff(s); setShowStaffModal(true); }}>
                                                                <Eye className="h-4 w-4" />
                                                            </GlassButton>
                                                            <GlassButton variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </GlassButton>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                            <div className="mt-4 pt-4 border-t flex flex-wrap justify-between items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {filteredStaff.length} agent(s) • {activeStaff.filter(s => s.contract_type === 'permanent').length} titulaires • {activeStaff.filter(s => s.contract_type === 'contract').length} contractuels
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">Total mensuel:</span>
                                    <span className="text-xl font-bold text-primary">{formatCurrency(totalPayroll)}</span>
                                </div>
                            </div>
                        </GlassCard>
                    </TabsContent>

                    {/* Finance Tab */}
                    <TabsContent value="finance" className="space-y-6">
                        {/* Finance Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <GlassCard className="p-4" solid>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Recettes Estimées</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalTuition)}</p>
                                        <p className="text-xs text-muted-foreground">{totalStudents} élèves × frais</p>
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                </div>
                            </GlassCard>
                            <GlassCard className="p-4" solid>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Charges Salariales</p>
                                        <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalPayroll * 12)}</p>
                                        <p className="text-xs text-muted-foreground">Annuelles</p>
                                    </div>
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                </div>
                            </GlassCard>
                            <GlassCard className="p-4" solid>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Solde Prévisionnel</p>
                                        <p className={`text-2xl font-bold mt-1 ${totalTuition - (totalPayroll * 12) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(totalTuition - (totalPayroll * 12))}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Recettes - Charges</p>
                                    </div>
                                    <Calculator className="h-5 w-5 text-purple-500" />
                                </div>
                            </GlassCard>
                            <GlassCard className="p-4" solid>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Impayés</p>
                                        <p className="text-2xl font-bold text-amber-600 mt-1">0 FCFA</p>
                                        <p className="text-xs text-muted-foreground">0 élèves en retard</p>
                                    </div>
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                </div>
                            </GlassCard>
                        </div>

                        {/* Tuition by Class */}
                        <GlassCard className="p-6" solid>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-green-500" />
                                    Frais de Scolarité par Classe
                                </h3>
                                <div className="flex gap-2">
                                    <GlassButton variant="outline" size="sm">
                                        <Printer className="h-4 w-4 mr-1" />
                                        Imprimer
                                    </GlassButton>
                                    <GlassButton variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-1" />
                                        Exporter
                                    </GlassButton>
                                </div>
                            </div>
                            <ScrollArea className="h-[350px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Classe</TableHead>
                                            <TableHead>Niveau</TableHead>
                                            <TableHead className="text-right">Effectif</TableHead>
                                            <TableHead className="text-right">Frais/élève</TableHead>
                                            <TableHead className="text-right">Total Attendu</TableHead>
                                            <TableHead className="text-right">Encaissé</TableHead>
                                            <TableHead className="text-center">Statut</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classes.map((c) => {
                                            const fee = TUITION_FEES[c.level] || 150000;
                                            const total = fee * parseNum(c.student_count);
                                            // Demo: random collection rate
                                            const collected = Math.floor(total * (0.7 + Math.random() * 0.3));
                                            const rate = total > 0 ? (collected / total) * 100 : 100;
                                            return (
                                                <TableRow key={c.id}>
                                                    <TableCell className="font-medium">{c.name}</TableCell>
                                                    <TableCell><Badge variant="outline">{c.level}</Badge></TableCell>
                                                    <TableCell className="text-right">{parseNum(c.student_count)}</TableCell>
                                                    <TableCell className="text-right font-mono">{formatCurrency(fee)}</TableCell>
                                                    <TableCell className="text-right font-mono">{formatCurrency(total)}</TableCell>
                                                    <TableCell className="text-right font-mono text-green-600">{formatCurrency(collected)}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={rate >= 100 ? 'default' : rate >= 80 ? 'secondary' : 'destructive'}>
                                                            {rate.toFixed(0)}%
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </GlassCard>
                    </TabsContent>

                    {/* Admin Tab */}
                    <TabsContent value="admin" className="space-y-6">
                        {/* Admin Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <GlassCard className="p-4 text-center" solid>
                                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                <p className="text-2xl font-bold">{totalStudents}</p>
                                <p className="text-sm text-muted-foreground">Élèves inscrits</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center" solid>
                                <Building2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                <p className="text-2xl font-bold">{classes.length}</p>
                                <p className="text-sm text-muted-foreground">Classes actives</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center" solid>
                                <FileCheck className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Documents en attente</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center" solid>
                                <UserCheck className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Transferts en cours</p>
                            </GlassCard>
                        </div>

                        {/* Admin Actions Grid */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <GlassCard className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group" solid>
                                <div className="flex items-start justify-between mb-4">
                                    <GraduationCap className="h-10 w-10 text-blue-500" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h4 className="font-semibold text-lg mb-1">Inscriptions</h4>
                                <p className="text-sm text-muted-foreground mb-3">Gérer les nouvelles inscriptions et réinscriptions</p>
                                <Badge>{totalStudents} inscrits</Badge>
                            </GlassCard>

                            <GlassCard className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group" solid>
                                <div className="flex items-start justify-between mb-4">
                                    <FileSignature className="h-10 w-10 text-green-500" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h4 className="font-semibold text-lg mb-1">Certificats & Attestations</h4>
                                <p className="text-sm text-muted-foreground mb-3">Générer des documents officiels</p>
                                <div className="flex gap-2">
                                    <Badge variant="outline">Scolarité</Badge>
                                    <Badge variant="outline">Inscription</Badge>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group" solid>
                                <div className="flex items-start justify-between mb-4">
                                    <UserCheck className="h-10 w-10 text-amber-500" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h4 className="font-semibold text-lg mb-1">Transferts</h4>
                                <p className="text-sm text-muted-foreground mb-3">Gérer les départs et arrivées d'élèves</p>
                                <Badge variant="secondary">0 en cours</Badge>
                            </GlassCard>

                            <GlassCard className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group" solid>
                                <div className="flex items-start justify-between mb-4">
                                    <Mail className="h-10 w-10 text-cyan-500" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h4 className="font-semibold text-lg mb-1">Communication</h4>
                                <p className="text-sm text-muted-foreground mb-3">Envoyer des messages aux parents et staff</p>
                                <div className="flex gap-2">
                                    <Badge variant="outline">SMS</Badge>
                                    <Badge variant="outline">Email</Badge>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group" solid>
                                <div className="flex items-start justify-between mb-4">
                                    <ClipboardList className="h-10 w-10 text-purple-500" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h4 className="font-semibold text-lg mb-1">Dossiers Scolaires</h4>
                                <p className="text-sm text-muted-foreground mb-3">Consulter et gérer les dossiers élèves</p>
                                <Badge>{totalStudents} dossiers</Badge>
                            </GlassCard>

                            <GlassCard className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group" solid>
                                <div className="flex items-start justify-between mb-4">
                                    <Award className="h-10 w-10 text-red-500" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h4 className="font-semibold text-lg mb-1">Discipline</h4>
                                <p className="text-sm text-muted-foreground mb-3">Suivi des sanctions et récompenses</p>
                                <Badge variant="secondary">Aucun incident</Badge>
                            </GlassCard>
                        </div>
                    </TabsContent>

                    {/* Reporting Tab */}
                    <TabsContent value="reporting" className="space-y-6">
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Budget Overview */}
                            <GlassCard className="p-6" solid>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <PiggyBank className="h-5 w-5 text-green-500" />
                                    Budget Annuel
                                </h3>
                                <div className="space-y-6">
                                    <div className="text-center py-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">Solde Prévisionnel</p>
                                        <p className={`text-4xl font-bold ${totalTuition - (totalPayroll * 12) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(totalTuition - (totalPayroll * 12))}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-500/10 rounded-lg text-center">
                                            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                            <p className="text-lg font-bold text-green-600">{formatCurrency(totalTuition)}</p>
                                            <p className="text-xs text-muted-foreground">Recettes</p>
                                        </div>
                                        <div className="p-4 bg-red-500/10 rounded-lg text-center">
                                            <TrendingDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                            <p className="text-lg font-bold text-red-600">{formatCurrency(totalPayroll * 12)}</p>
                                            <p className="text-xs text-muted-foreground">Charges RH</p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Staff Distribution */}
                            <GlassCard className="p-6" solid>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Répartition RH
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Direction', count: staffByType.direction.length, color: 'bg-purple-500', salary: staffByType.direction.reduce((a, s) => a + calculateSalary(s), 0) },
                                        { label: 'Enseignants', count: staffByType.teachers.length, color: 'bg-blue-500', salary: staffByType.teachers.reduce((a, s) => a + calculateSalary(s), 0) },
                                        { label: 'Administratifs', count: staffByType.admin.length, color: 'bg-green-500', salary: staffByType.admin.reduce((a, s) => a + calculateSalary(s), 0) },
                                        { label: 'Vie Scolaire', count: staffByType.vieScolaire.length, color: 'bg-orange-500', salary: staffByType.vieScolaire.reduce((a, s) => a + calculateSalary(s), 0) },
                                        { label: 'Services', count: staffByType.services.length, color: 'bg-gray-500', salary: staffByType.services.reduce((a, s) => a + calculateSalary(s), 0) },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                                <span className="font-medium">{item.label}</span>
                                                <Badge variant="secondary">{item.count}</Badge>
                                            </div>
                                            <span className="font-mono text-sm">{formatCurrency(item.salary)}/mois</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>

                        {/* Export Options */}
                        <GlassCard className="p-6" solid>
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Download className="h-5 w-5 text-indigo-500" />
                                Exports & Rapports
                            </h3>
                            <div className="grid md:grid-cols-4 gap-4">
                                <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2">
                                    <FileText className="h-6 w-6" />
                                    <span className="text-sm">Liste du Personnel</span>
                                    <Badge variant="secondary">Excel</Badge>
                                </GlassButton>
                                <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2">
                                    <GraduationCap className="h-6 w-6" />
                                    <span className="text-sm">Liste des Élèves</span>
                                    <Badge variant="secondary">Excel</Badge>
                                </GlassButton>
                                <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2">
                                    <Wallet className="h-6 w-6" />
                                    <span className="text-sm">États de Paie</span>
                                    <Badge variant="secondary">PDF</Badge>
                                </GlassButton>
                                <GlassButton variant="outline" className="h-auto py-4 flex-col gap-2">
                                    <BarChart3 className="h-6 w-6" />
                                    <span className="text-sm">Rapport Financier</span>
                                    <Badge variant="secondary">PDF</Badge>
                                </GlassButton>
                            </div>
                        </GlassCard>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Add Staff Modal - Enhanced with HR fields */}
            <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Ajouter un Agent
                        </DialogTitle>
                        <DialogDescription>
                            Remplissez les informations du nouvel agent
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Section 1: Identité */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Identité
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm">Prénom *</Label>
                                    <GlassInput
                                        value={newStaffForm.first_name}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, first_name: e.target.value })}
                                        placeholder="Prénom"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Nom *</Label>
                                    <GlassInput
                                        value={newStaffForm.last_name}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, last_name: e.target.value })}
                                        placeholder="Nom"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Email *</Label>
                                    <GlassInput
                                        type="email"
                                        value={newStaffForm.email}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Téléphone</Label>
                                    <GlassInput
                                        value={newStaffForm.phone}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                                        placeholder="+241 XX XX XX XX"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-sm">Adresse</Label>
                                    <GlassInput
                                        value={newStaffForm.address}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, address: e.target.value })}
                                        placeholder="Adresse postale"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Poste & Contrat */}
                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Poste & Contrat
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm">Corps</Label>
                                    <Select value={newStaffForm.staff_type} onValueChange={(v) => setNewStaffForm({ ...newStaffForm, staff_type: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="direction">Direction</SelectItem>
                                            <SelectItem value="teacher">Enseignant</SelectItem>
                                            <SelectItem value="admin">Administratif</SelectItem>
                                            <SelectItem value="cpe">CPE</SelectItem>
                                            <SelectItem value="surveillant">Surveillant</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="other">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm">Poste</Label>
                                    <GlassInput
                                        value={newStaffForm.position}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, position: e.target.value })}
                                        placeholder="Ex: Professeur de Mathématiques"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Type de contrat</Label>
                                    <Select value={newStaffForm.contract_type} onValueChange={(v) => setNewStaffForm({ ...newStaffForm, contract_type: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanent">Titulaire (CDI)</SelectItem>
                                            <SelectItem value="contract">Contractuel (CDD)</SelectItem>
                                            <SelectItem value="intern">Stagiaire</SelectItem>
                                            <SelectItem value="vacation">Vacataire</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm">Département</Label>
                                    <GlassInput
                                        value={newStaffForm.department}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
                                        placeholder="Ex: Direction Générale"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">Date d'embauche *</Label>
                                    <GlassInput
                                        type="date"
                                        value={newStaffForm.hire_date}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, hire_date: e.target.value })}
                                    />
                                </div>
                                {(newStaffForm.contract_type === 'contract' || newStaffForm.contract_type === 'intern') && (
                                    <div>
                                        <Label className="text-sm">Date de fin</Label>
                                        <GlassInput
                                            type="date"
                                            value={newStaffForm.end_date}
                                            onChange={(e) => setNewStaffForm({ ...newStaffForm, end_date: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label className="text-sm">Diplôme / Niveau d'études</Label>
                                    <GlassInput
                                        value={newStaffForm.diploma}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, diploma: e.target.value })}
                                        placeholder="Ex: Master en Sciences de l'Éducation"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Informations administratives */}
                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Informations administratives
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm">Numéro CNSS</Label>
                                    <GlassInput
                                        value={newStaffForm.cnss_number}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, cnss_number: e.target.value })}
                                        placeholder="Numéro de sécurité sociale"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm">RIB</Label>
                                    <GlassInput
                                        value={newStaffForm.rib}
                                        onChange={(e) => setNewStaffForm({ ...newStaffForm, rib: e.target.value })}
                                        placeholder="Relevé d'Identité Bancaire"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Salary Preview */}
                        <div className="pt-4 border-t">
                            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-primary" />
                                    Aperçu Salaire (selon grille configurée)
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Salaire Base</p>
                                        <p className="text-lg font-semibold">
                                            {formatCurrency(
                                                newStaffForm.staff_type === 'direction' ? 750000 :
                                                    newStaffForm.staff_type === 'teacher' ? 480000 :
                                                        newStaffForm.staff_type === 'admin' ? 400000 :
                                                            newStaffForm.staff_type === 'cpe' ? 450000 :
                                                                newStaffForm.staff_type === 'surveillant' ? 320000 :
                                                                    newStaffForm.staff_type === 'maintenance' ? 250000 : 350000
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Multiplicateur</p>
                                        <p className="text-lg font-semibold">
                                            ×{newStaffForm.contract_type === 'permanent' ? '100%' :
                                                newStaffForm.contract_type === 'contract' ? '85%' :
                                                    newStaffForm.contract_type === 'intern' ? '45%' : '60%'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Net Estimé</p>
                                        <p className="text-lg font-bold text-primary">
                                            {formatCurrency(Math.round(
                                                ((newStaffForm.staff_type === 'direction' ? 750000 :
                                                    newStaffForm.staff_type === 'teacher' ? 480000 :
                                                        newStaffForm.staff_type === 'admin' ? 400000 :
                                                            newStaffForm.staff_type === 'cpe' ? 450000 :
                                                                newStaffForm.staff_type === 'surveillant' ? 320000 :
                                                                    newStaffForm.staff_type === 'maintenance' ? 250000 : 350000) *
                                                    (newStaffForm.contract_type === 'permanent' ? 1 :
                                                        newStaffForm.contract_type === 'contract' ? 0.85 :
                                                            newStaffForm.contract_type === 'intern' ? 0.45 : 0.6)) * 0.845
                                            ))}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    * Net calculé après CNSS (5.5%) et IRS (10%)
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <GlassButton variant="outline" onClick={() => setShowAddStaffModal(false)}>
                            Annuler
                        </GlassButton>
                        <GlassButton variant="primary" onClick={handleAddStaff}>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Ajouter l'agent
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Staff Detail Drawer */}
            <StaffDetailDrawer
                staff={selectedStaff}
                open={showStaffModal}
                onClose={() => setShowStaffModal(false)}
                establishmentName={establishment.name}
            />
        </UserLayout>
    );
};

export default EstablishmentManage;
