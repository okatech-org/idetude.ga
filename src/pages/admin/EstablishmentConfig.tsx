import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  FolderTree,
  Briefcase,
  User,
  School,
  Network,
  UserPlus,
  Languages,
  Settings,
  Star,
  Info,
} from "lucide-react";
import { OrgChart } from "@/components/admin/OrgChart";
import { AssignUserModal } from "@/components/admin/AssignUserModal";
import { StudentEnrollmentModal } from "@/components/admin/StudentEnrollmentModal";
import { QuickAssignDropdown } from "@/components/admin/QuickAssignDropdown";
import { SubjectConfigModal } from "@/components/admin/SubjectConfigModal";
import { LinguisticSectionsModal } from "@/components/admin/LinguisticSectionsModal";
import { ModulesConfigTab } from "@/components/admin/establishment/ModulesConfigTab";
import { HRConfigTab } from "@/components/admin/establishment/HRConfigTab";
import { EstablishmentSearch } from "@/components/admin/establishment/EstablishmentSearch";

interface Establishment {
  id: string;
  name: string;
  code: string | null;
  type: string;
  address: string | null;
  levels: string | null;
  group_id: string | null;
  enabled_modules: string[] | null;
}

interface Department {
  id: string;
  establishment_id: string;
  parent_id: string | null;
  name: string;
  code: string | null;
  type: string;
  description: string | null;
  order_index: number;
}

interface Position {
  id: string;
  department_id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_head: boolean;
  order_index: number;
}

interface UserPosition {
  id: string;
  user_id: string;
  position_id: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Class {
  id: string;
  establishment_id: string;
  name: string;
  code: string | null;
  level: string;
  section: string | null;
  school_year: string;
  capacity: number | null;
  room: string | null;
}

interface ClassTeacher {
  id: string;
  class_id: string;
  teacher_id: string;
  subject: string | null;
  is_main_teacher: boolean;
  school_year: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface ClassStudent {
  id: string;
  class_id: string;
  student_id: string;
  school_year: string;
  status: string | null;
  enrollment_date: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface LinguisticSection {
  id: string;
  name: string;
  code: string | null;
  teaching_language: string;
  is_default: boolean;
  color: string | null;
}

interface ClassSection {
  id: string;
  class_id: string;
  section_id: string;
}

interface EstablishmentStaff {
  id: string;
  establishment_id: string;
  user_id: string | null;
  staff_type: string;
  category: string | null;
  position: string | null;
  department: string | null;
  contract_type: string | null;
  is_active: boolean;
  is_class_principal: boolean | null;
  start_date: string | null;
  // From Cloud SQL API join with profiles
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}

const typeLabels: Record<string, string> = {
  direction: "Direction",
  department: "Département",
  service: "Service",
  bureau: "Bureau",
};

const EstablishmentConfig = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const establishmentId = searchParams.get("id");
  const { user, roles: userRoles, isLoading: authLoading } = useAuth();

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([]);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [linguisticSections, setLinguisticSections] = useState<LinguisticSection[]>([]);
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [establishmentStaff, setEstablishmentStaff] = useState<EstablishmentStaff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showStudentEnrollmentModal, setShowStudentEnrollmentModal] = useState(false);
  const [showSubjectConfigModal, setShowSubjectConfigModal] = useState(false);
  const [showLinguisticSectionsModal, setShowLinguisticSectionsModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedClassForEnrollment, setSelectedClassForEnrollment] = useState<Class | null>(null);

  // Form states
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    code: "",
    type: "department" as string,
    description: "",
    parent_id: null as string | null,
  });

  const [positionForm, setPositionForm] = useState({
    name: "",
    code: "",
    description: "",
    is_head: false,
  });

  const [classForm, setClassForm] = useState({
    name: "",
    code: "",
    level: "",
    section: "",
    school_year: "2024-2025",
    capacity: 30,
    room: "",
    linguistic_section_ids: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && (!user || (!userRoles.includes("super_admin") && !userRoles.includes("school_director")))) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, userRoles, authLoading, navigate]);

  useEffect(() => {
    if (establishmentId) {
      fetchEstablishmentData();
    } else {
      setLoading(false);
    }
  }, [establishmentId]);

  const fetchEstablishmentData = async () => {
    if (!establishmentId) return;
    setLoading(true);

    try {
      // Fetch establishment
      const { data: estData, error: estError } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", establishmentId)
        .maybeSingle();

      if (estError) throw estError;
      setEstablishment(estData);

      // Fetch departments from Cloud SQL API
      try {
        const deptResponse = await fetch(`/api/db/establishments/${establishmentId}/departments`);
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData || []);
        } else {
          setDepartments([]);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]);
      }

      // Fetch positions from Cloud SQL API
      try {
        const posResponse = await fetch(`/api/db/establishments/${establishmentId}/positions`);
        if (posResponse.ok) {
          const posData = await posResponse.json();
          setPositions(posData || []);
        } else {
          setPositions([]);
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
        setPositions([]);
      }

      // User positions (still from Supabase for now - requires profile join)
      setUserPositions([]);

      // Fetch classes from Cloud SQL API
      try {
        const classesResponse = await fetch(`/api/db/establishments/${establishmentId}/classes`);
        if (classesResponse.ok) {
          const classData = await classesResponse.json();
          setClasses(classData || []);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
      }

      // Fetch class teachers from Cloud SQL API
      try {
        const ctResponse = await fetch(`/api/db/establishments/${establishmentId}/teacher-assignments`);
        if (ctResponse.ok) {
          const ctData = await ctResponse.json();
          // Transform to match expected format with profiles object
          const enrichedData = ctData.map((ct: any) => ({
            ...ct,
            profiles: {
              first_name: ct.first_name,
              last_name: ct.last_name,
              email: ct.email,
            },
            subject: ct.subject_name,
          }));
          setClassTeachers(enrichedData);
        } else {
          setClassTeachers([]);
        }
      } catch (error) {
        console.error("Error fetching class teachers:", error);
        setClassTeachers([]);
      }

      // Fetch class students from Cloud SQL API
      try {
        const studentsResponse = await fetch(`/api/db/establishments/${establishmentId}/students`);
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          // Transform to match expected format
          const enrichedData = studentsData.map((s: any) => ({
            ...s,
            profiles: {
              first_name: s.first_name,
              last_name: s.last_name,
              email: s.email,
            },
          }));
          setClassStudents(enrichedData);
        } else {
          setClassStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setClassStudents([]);
      }

      // Fetch class sections (linguistic sections) from Supabase (still there)
      const { data: curClasses } = await supabase
        .from("classes")
        .select("id")
        .eq("establishment_id", establishmentId);

      if (curClasses && curClasses.length > 0) {
        const { data: clsSectionsData } = await supabase
          .from("class_sections")
          .select("*")
          .in("class_id", curClasses.map(c => c.id));
        setClassSections(clsSectionsData || []);
      }

      // Fetch linguistic sections for this establishment
      const { data: lingSectionsData, error: lingSectionsError } = await supabase
        .from("linguistic_sections")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("order_index");

      if (lingSectionsError) throw lingSectionsError;
      setLinguisticSections(lingSectionsData || []);

      // Fetch establishment staff from Cloud SQL API
      try {
        const staffResponse = await fetch(`/api/db/establishments/${establishmentId}/staff-detailed`);
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          setEstablishmentStaff(staffData || []);
        } else {
          setEstablishmentStaff([]);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        setEstablishmentStaff([]);
      }
    } catch (error) {
      console.error("Error fetching establishment data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDepartment = async () => {
    if (!establishmentId || !departmentForm.name) return;

    try {
      if (editingDepartment) {
        const { error } = await supabase
          .from("departments")
          .update({
            name: departmentForm.name,
            code: departmentForm.code || null,
            type: departmentForm.type,
            description: departmentForm.description || null,
            parent_id: departmentForm.parent_id,
          })
          .eq("id", editingDepartment.id);

        if (error) throw error;
        toast.success("Département modifié");
      } else {
        const { error } = await supabase.from("departments").insert({
          establishment_id: establishmentId,
          name: departmentForm.name,
          code: departmentForm.code || null,
          type: departmentForm.type,
          description: departmentForm.description || null,
          parent_id: departmentForm.parent_id,
          order_index: departments.length,
        });

        if (error) throw error;
        toast.success("Département créé");
      }

      setShowDepartmentModal(false);
      resetDepartmentForm();
      fetchEstablishmentData();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleSavePosition = async () => {
    if (!selectedDepartmentId || !positionForm.name) return;

    try {
      if (editingPosition) {
        const { error } = await supabase
          .from("positions")
          .update({
            name: positionForm.name,
            code: positionForm.code || null,
            description: positionForm.description || null,
            is_head: positionForm.is_head,
          })
          .eq("id", editingPosition.id);

        if (error) throw error;
        toast.success("Poste modifié");
      } else {
        const { error } = await supabase.from("positions").insert({
          department_id: selectedDepartmentId,
          name: positionForm.name,
          code: positionForm.code || null,
          description: positionForm.description || null,
          is_head: positionForm.is_head,
          order_index: positions.filter((p) => p.department_id === selectedDepartmentId).length,
        });

        if (error) throw error;
        toast.success("Poste créé");
      }

      setShowPositionModal(false);
      resetPositionForm();
      fetchEstablishmentData();
    } catch (error) {
      console.error("Error saving position:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleSaveClass = async () => {
    if (!establishmentId || !classForm.name || !classForm.level) return;

    try {
      let classId = editingClass?.id;

      if (editingClass) {
        const { error } = await supabase
          .from("classes")
          .update({
            name: classForm.name,
            code: classForm.code || null,
            level: classForm.level,
            section: classForm.section || null,
            school_year: classForm.school_year,
            capacity: classForm.capacity,
            room: classForm.room || null,
          })
          .eq("id", editingClass.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("classes").insert({
          establishment_id: establishmentId,
          name: classForm.name,
          code: classForm.code || null,
          level: classForm.level,
          section: classForm.section || null,
          school_year: classForm.school_year,
          capacity: classForm.capacity,
          room: classForm.room || null,
        }).select("id").single();

        if (error) throw error;
        classId = data.id;
      }

      // Gérer les associations de sections linguistiques
      if (classId) {
        // Supprimer les anciennes associations
        await supabase
          .from("class_sections")
          .delete()
          .eq("class_id", classId);

        // Ajouter les nouvelles associations
        if (classForm.linguistic_section_ids.length > 0) {
          const insertData = classForm.linguistic_section_ids.map(sectionId => ({
            class_id: classId,
            section_id: sectionId,
          }));

          const { error: insertError } = await supabase
            .from("class_sections")
            .insert(insertData);

          if (insertError) throw insertError;
        }
      }

      toast.success(editingClass ? "Classe modifiée" : "Classe créée");
      setShowClassModal(false);
      resetClassForm();
      fetchEstablishmentData();
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm("Supprimer ce département et tous ses postes ?")) return;

    try {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Département supprimé");
      fetchEstablishmentData();
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (!confirm("Supprimer ce poste ?")) return;

    try {
      const { error } = await supabase.from("positions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Poste supprimé");
      fetchEstablishmentData();
    } catch (error) {
      console.error("Error deleting position:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Supprimer cette classe ?")) return;

    try {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Classe supprimée");
      fetchEstablishmentData();
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({ name: "", code: "", type: "department", description: "", parent_id: null });
    setEditingDepartment(null);
  };

  const resetPositionForm = () => {
    setPositionForm({ name: "", code: "", description: "", is_head: false });
    setEditingPosition(null);
  };

  const resetClassForm = () => {
    setClassForm({ name: "", code: "", level: "", section: "", school_year: "2024-2025", capacity: 30, room: "", linguistic_section_ids: [] });
    setEditingClass(null);
  };

  const handleModulesChange = async (modules: string[]) => {
    if (!establishment) return;

    try {
      const { error } = await supabase
        .from("establishments")
        .update({ enabled_modules: modules })
        .eq("id", establishment.id);

      if (error) throw error;

      setEstablishment({ ...establishment, enabled_modules: modules });
      toast.success("Modules mis à jour");
    } catch (error) {
      console.error("Error updating modules:", error);
      toast.error("Erreur lors de la mise à jour des modules");
    }
  };

  const openEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setDepartmentForm({
      name: dept.name,
      code: dept.code || "",
      type: dept.type,
      description: dept.description || "",
      parent_id: dept.parent_id,
    });
    setShowDepartmentModal(true);
  };

  const openEditPosition = (pos: Position) => {
    setEditingPosition(pos);
    setPositionForm({
      name: pos.name,
      code: pos.code || "",
      description: pos.description || "",
      is_head: pos.is_head,
    });
    setSelectedDepartmentId(pos.department_id);
    setShowPositionModal(true);
  };

  const openEditClass = (cls: Class) => {
    setEditingClass(cls);
    const currentSectionIds = classSections
      .filter(cs => cs.class_id === cls.id)
      .map(cs => cs.section_id);
    setClassForm({
      name: cls.name,
      code: cls.code || "",
      level: cls.level,
      section: cls.section || "",
      school_year: cls.school_year,
      capacity: cls.capacity || 30,
      room: cls.room || "",
      linguistic_section_ids: currentSectionIds,
    });
    setShowClassModal(true);
  };

  const getPositionsForDepartment = (deptId: string) => positions.filter((p) => p.department_id === deptId);
  const getUsersForPosition = (posId: string) => userPositions.filter((up) => up.position_id === posId);
  const getTeachersForClass = (classId: string) => classTeachers.filter((ct) => ct.class_id === classId);
  const getStudentsForClass = (classId: string) => classStudents.filter((cs) => cs.class_id === classId);
  const getSectionsForClass = (classId: string) => {
    const sectionIds = classSections.filter(cs => cs.class_id === classId).map(cs => cs.section_id);
    return linguisticSections.filter(ls => sectionIds.includes(ls.id));
  };

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position);
    setShowAssignUserModal(true);
  };

  const openStudentEnrollment = (cls: Class) => {
    setSelectedClassForEnrollment(cls);
    setShowStudentEnrollmentModal(true);
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

  if (!establishmentId) {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <GlassButton variant="ghost" onClick={() => navigate("/admin/establishments")}>
              <ArrowLeft className="h-4 w-4" />
            </GlassButton>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sélectionner un établissement</h1>
              <p className="text-muted-foreground">Veuillez choisir un établissement à configurer</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <GlassButton variant="ghost" onClick={() => navigate("/admin/establishments")}>
              <ArrowLeft className="h-4 w-4" />
            </GlassButton>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                {establishment?.name || "Configuration"}
              </h1>
              <p className="text-muted-foreground">
                Structure administrative et classes
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 text-center" solid>
            <FolderTree className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{departments.length}</p>
            <p className="text-xs text-muted-foreground">Départements</p>
          </GlassCard>
          <GlassCard className="p-4 text-center" solid>
            <Briefcase className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{positions.length}</p>
            <p className="text-xs text-muted-foreground">Postes</p>
          </GlassCard>
          <GlassCard className="p-4 text-center" solid>
            <School className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{classes.length}</p>
            <p className="text-xs text-muted-foreground">Classes</p>
          </GlassCard>
          <GlassCard className="p-4 text-center" solid>
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{userPositions.length}</p>
            <p className="text-xs text-muted-foreground">Personnels affectés</p>
          </GlassCard>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orgchart" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="orgchart" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Organigramme</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              <span className="hidden sm:inline">Administration</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="pedagogy" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Pédagogie</span>
            </TabsTrigger>
            <TabsTrigger value="hr" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">RH</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Modules</span>
            </TabsTrigger>
          </TabsList>

          {/* Organigramme Tab */}
          <TabsContent value="orgchart" className="space-y-4">
            <OrgChart
              departments={departments}
              positions={positions}
              userPositions={userPositions}
              establishmentName={establishment?.name}
              onPositionClick={handlePositionClick}
            />
          </TabsContent>

          {/* Administrative Structure Tab */}
          <TabsContent value="admin" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Structure Administrative</h2>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => {
                  resetDepartmentForm();
                  setShowDepartmentModal(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nouveau département
              </GlassButton>
            </div>

            {departments.length === 0 ? (
              <GlassCard className="p-8 text-center" solid>
                <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun département configuré</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Commencez par créer la structure administrative
                </p>
              </GlassCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Show ALL departments (including sub-departments) as separate cards */}
                {departments.map((dept) => {
                  const positionsCount = getPositionsForDepartment(dept.id).length;
                  const isMainDept = !dept.parent_id;
                  const parentDept = dept.parent_id ? departments.find(d => d.id === dept.parent_id) : null;

                  return (
                    <GlassCard
                      key={dept.id}
                      className={`p-4 ${isMainDept ? 'border-primary/30' : 'border-muted/50'}`}
                      solid
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${isMainDept ? 'bg-primary/10' : 'bg-muted/30'} flex items-center justify-center`}>
                            <FolderTree className={`h-5 w-5 ${isMainDept ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{dept.name}</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant={isMainDept ? "default" : "outline"} className="text-xs">
                                {typeLabels[dept.type] || dept.type}
                              </Badge>
                              {parentDept && (
                                <span className="text-xs text-muted-foreground">• {parentDept.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDepartment(dept.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </GlassButton>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {positionsCount} poste{positionsCount > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <GlassButton
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            resetPositionForm();
                            setSelectedDepartmentId(dept.id);
                            setShowPositionModal(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Poste
                        </GlassButton>
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDepartment(dept)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </GlassButton>
                      </div>

                      {/* Positions preview */}
                      {positionsCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex flex-wrap gap-1.5">
                            {getPositionsForDepartment(dept.id).slice(0, 3).map((pos) => (
                              <Badge key={pos.id} variant="secondary" className="text-xs">
                                {pos.name}
                                {pos.is_head && <Star className="h-2.5 w-2.5 ml-1 text-yellow-500" />}
                              </Badge>
                            ))}
                            {positionsCount > 3 && (
                              <Badge variant="outline" className="text-xs">+{positionsCount - 3}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            )}

            {/* Personnel segmenté par Corps */}
            <div className="mt-6 space-y-6">
              {establishmentStaff.length === 0 ? (
                <GlassCard className="p-8 text-center" solid>
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun personnel enregistré</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Le personnel ajouté lors de la création de l'établissement apparaîtra ici
                  </p>
                </GlassCard>
              ) : (
                <>
                  {/* Corps Administratif */}
                  {(() => {
                    const adminCorps = establishmentStaff.filter(s =>
                      ['direction', 'admin', 'cpe', 'surveillant', 'maintenance', 'other'].includes(s.staff_type)
                    );

                    // Sub-group by type
                    const direction = adminCorps.filter(s => s.staff_type === 'direction');
                    const vieScolaire = adminCorps.filter(s => ['cpe', 'surveillant'].includes(s.staff_type));
                    const administration = adminCorps.filter(s => s.staff_type === 'admin');
                    const services = adminCorps.filter(s => ['maintenance', 'other'].includes(s.staff_type));

                    const renderStaffCard = (staff: typeof establishmentStaff[0], icon: React.ReactNode, color: string) => {
                      const name = staff.first_name && staff.last_name
                        ? `${staff.first_name} ${staff.last_name}`
                        : staff.email || "Non renseigné";

                      // Get position info from positions list
                      const positionInfo = positions.find(p => p.name === staff.position);
                      const deptInfo = positionInfo ? departments.find(d => d.id === positionInfo.department_id) : null;

                      return (
                        <div
                          key={staff.id}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
                                {icon}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{name}</p>
                                {staff.position && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{staff.position}</p>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GlassButton variant="ghost" size="sm" title="Configurer">
                                <Settings className="h-3.5 w-3.5" />
                              </GlassButton>
                              <GlassButton variant="ghost" size="sm" title="Modifier">
                                <Edit className="h-3.5 w-3.5" />
                              </GlassButton>
                            </div>
                          </div>

                          {/* Department & Function */}
                          <div className="space-y-1.5">
                            {deptInfo && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FolderTree className="h-3 w-3" />
                                <span>{deptInfo.name}</span>
                              </div>
                            )}

                            {/* Status badges */}
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                {staff.staff_type === 'direction' ? 'Direction' :
                                  staff.staff_type === 'admin' ? 'Admin' :
                                    staff.staff_type === 'cpe' ? 'CPE' :
                                      staff.staff_type === 'surveillant' ? 'Vie Scolaire' :
                                        staff.staff_type === 'maintenance' ? 'Maintenance' : 'Autre'}
                              </Badge>
                              {staff.contract_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {staff.contract_type === 'permanent' ? 'Titulaire' :
                                    staff.contract_type === 'contract' ? 'Contractuel' :
                                      staff.contract_type === 'intern' ? 'Stagiaire' : staff.contract_type}
                                </Badge>
                              )}
                              {!staff.is_active && (
                                <Badge variant="destructive" className="text-xs">Inactif</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return adminCorps.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Corps Administratif</h3>
                            <p className="text-xs text-muted-foreground">{adminCorps.length} membres</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Direction */}
                          {direction.length > 0 && (
                            <GlassCard className="p-4" solid>
                              <div className="flex items-center gap-2 mb-3">
                                <GraduationCap className="h-4 w-4 text-purple-500" />
                                <h4 className="font-medium text-sm text-foreground">Direction</h4>
                                <Badge variant="secondary" className="text-xs ml-auto">{direction.length}</Badge>
                              </div>
                              <div className="grid gap-2 md:grid-cols-3">
                                {direction.map(s => renderStaffCard(s, <GraduationCap className="h-5 w-5 text-purple-500" />, "bg-purple-500/10"))}
                              </div>
                            </GlassCard>
                          )}

                          {/* Vie Scolaire */}
                          {vieScolaire.length > 0 && (
                            <GlassCard className="p-4" solid>
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="h-4 w-4 text-orange-500" />
                                <h4 className="font-medium text-sm text-foreground">Vie Scolaire</h4>
                                <Badge variant="secondary" className="text-xs ml-auto">{vieScolaire.length}</Badge>
                              </div>
                              <div className="grid gap-2 md:grid-cols-3">
                                {vieScolaire.map(s => renderStaffCard(s, <Users className="h-5 w-5 text-orange-500" />, "bg-orange-500/10"))}
                              </div>
                            </GlassCard>
                          )}

                          {/* Administration */}
                          {administration.length > 0 && (
                            <GlassCard className="p-4" solid>
                              <div className="flex items-center gap-2 mb-3">
                                <Briefcase className="h-4 w-4 text-green-500" />
                                <h4 className="font-medium text-sm text-foreground">Administration</h4>
                                <Badge variant="secondary" className="text-xs ml-auto">{administration.length}</Badge>
                              </div>
                              <div className="grid gap-2 md:grid-cols-3">
                                {administration.map(s => renderStaffCard(s, <Briefcase className="h-5 w-5 text-green-500" />, "bg-green-500/10"))}
                              </div>
                            </GlassCard>
                          )}

                          {/* Services Généraux */}
                          {services.length > 0 && (
                            <GlassCard className="p-4" solid>
                              <div className="flex items-center gap-2 mb-3">
                                <Settings className="h-4 w-4 text-gray-500" />
                                <h4 className="font-medium text-sm text-foreground">Services Généraux</h4>
                                <Badge variant="secondary" className="text-xs ml-auto">{services.length}</Badge>
                              </div>
                              <div className="grid gap-2 md:grid-cols-3">
                                {services.map(s => renderStaffCard(s, <Settings className="h-5 w-5 text-gray-500" />, "bg-gray-500/10"))}
                              </div>
                            </GlassCard>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Corps Enseignants */}
                  {(() => {
                    const teachers = establishmentStaff.filter(s => s.staff_type === 'teacher');

                    // Get assignments for a teacher
                    const getTeacherAssignments = (userId: string | null) => {
                      if (!userId) return [];
                      return classTeachers.filter(ct => ct.teacher_id === userId);
                    };

                    // Get unique subjects for a teacher
                    const getTeacherSubjects = (userId: string | null) => {
                      const assignments = getTeacherAssignments(userId);
                      const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))];
                      return subjects as string[];
                    };

                    // Get classes for a teacher
                    const getTeacherClasses = (userId: string | null) => {
                      const assignments = getTeacherAssignments(userId);
                      const classIds = [...new Set(assignments.map(a => a.class_id))];
                      return classIds.map(id => classes.find(c => c.id === id)).filter(Boolean);
                    };

                    // Get PP class for a teacher
                    const getPPClass = (userId: string | null) => {
                      const assignments = getTeacherAssignments(userId);
                      const ppAssignment = assignments.find(a => a.is_main_teacher);
                      if (ppAssignment) {
                        return classes.find(c => c.id === ppAssignment.class_id);
                      }
                      return null;
                    };

                    const renderTeacherCard = (staff: typeof establishmentStaff[0]) => {
                      const name = staff.first_name && staff.last_name
                        ? `${staff.first_name} ${staff.last_name}`
                        : staff.email || "Non renseigné";

                      const subjects = getTeacherSubjects(staff.user_id);
                      const teacherClasses = getTeacherClasses(staff.user_id);
                      const ppClass = getPPClass(staff.user_id);

                      return (
                        <div
                          key={staff.id}
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{name}</p>
                                {ppClass && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs text-yellow-600">PP {ppClass.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GlassButton variant="ghost" size="sm" title="Configurer">
                                <Settings className="h-3.5 w-3.5" />
                              </GlassButton>
                              <GlassButton variant="ghost" size="sm" title="Modifier">
                                <Edit className="h-3.5 w-3.5" />
                              </GlassButton>
                            </div>
                          </div>

                          {/* Subjects */}
                          {subjects.length > 0 && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-1">
                                {subjects.slice(0, 2).map((subject, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                                {subjects.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{subjects.length - 2}</Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Classes */}
                          {teacherClasses.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>
                                {teacherClasses.slice(0, 3).map(c => c?.name).join(', ')}
                                {teacherClasses.length > 3 && ` +${teacherClasses.length - 3}`}
                              </span>
                            </div>
                          )}

                          {/* No assignments */}
                          {subjects.length === 0 && teacherClasses.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">
                              Aucune affectation
                            </p>
                          )}
                        </div>
                      );
                    };

                    return teachers.length > 0 ? (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">Corps Enseignants</h3>
                              <p className="text-xs text-muted-foreground">{teachers.length} enseignants</p>
                            </div>
                          </div>
                          <GlassButton variant="primary" size="sm">
                            <Plus className="h-4 w-4" />
                            Ajouter
                          </GlassButton>
                        </div>

                        <GlassCard className="p-4" solid>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {teachers.map(renderTeacherCard)}
                          </div>
                        </GlassCard>
                      </div>
                    ) : null;
                  })()}
                </>
              )}
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Gestion des Classes</h2>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => {
                  resetClassForm();
                  setShowClassModal(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nouvelle classe
              </GlassButton>
            </div>

            {classes.length === 0 ? (
              <GlassCard className="p-8 text-center" solid>
                <School className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune classe configurée</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Commencez par créer les classes de l'établissement
                </p>
              </GlassCard>
            ) : (
              <>
                {/* Segmented by School Level */}
                {(() => {
                  // Group classes by cycle
                  const collegeClasses = classes.filter((c) => ["6eme", "5eme", "4eme", "3eme"].includes(c.level));
                  const lyceeClasses = classes.filter((c) => ["2nde", "1ere", "tle"].includes(c.level));
                  const otherClasses = classes.filter((c) => !["6eme", "5eme", "4eme", "3eme", "2nde", "1ere", "tle"].includes(c.level));

                  // Sort classes within each group
                  const levelOrder: Record<string, number> = { "6eme": 1, "5eme": 2, "4eme": 3, "3eme": 4, "2nde": 5, "1ere": 6, "tle": 7 };
                  const sortClasses = (a: any, b: any) => {
                    const levelDiff = (levelOrder[a.level] || 99) - (levelOrder[b.level] || 99);
                    if (levelDiff !== 0) return levelDiff;
                    return (a.name || "").localeCompare(b.name || "");
                  };

                  const renderClassCard = (cls: any) => {
                    const teachers = getTeachersForClass(cls.id);
                    const mainTeacher = teachers.find((t) => t.is_main_teacher);
                    const students = getStudentsForClass(cls.id);
                    const occupancy = cls.capacity ? Math.round((students.length / cls.capacity) * 100) : 0;

                    return (
                      <div key={cls.id} className="group relative">
                        <GlassCard className="p-4 h-full transition-all hover:shadow-lg hover:border-primary/30" solid>
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                                <GraduationCap className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">{cls.name}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs">{cls.level}</Badge>
                                  {cls.section && <span className="text-xs text-muted-foreground">{cls.section}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="text-right shrink-0">
                              <p className="text-lg font-bold text-foreground">{students.length}</p>
                              <p className="text-xs text-muted-foreground">élèves</p>
                            </div>
                          </div>

                          {/* PP & Capacity Row */}
                          <div className="mt-3 flex items-center justify-between gap-2">
                            {mainTeacher ? (
                              <Badge variant="secondary" className="text-xs gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                <Star className="h-3 w-3" />
                                PP: {mainTeacher.profiles?.first_name} {(mainTeacher.profiles?.last_name || "").charAt(0)}.
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">Aucun PP</Badge>
                            )}

                            {/* Occupancy Bar */}
                            {cls.capacity && (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${occupancy > 90 ? 'bg-red-500' : occupancy > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                    style={{ width: `${Math.min(occupancy, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{occupancy}%</span>
                              </div>
                            )}
                          </div>

                          {/* Actions Row - Compact */}
                          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{cls.school_year}</span>
                              {cls.room && <span>• {cls.room}</span>}
                              <span>• {teachers.length} profs</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <GlassButton variant="primary" size="sm" onClick={() => openStudentEnrollment(cls)} title="Élèves" className="gap-1">
                                <UserPlus className="h-3.5 w-3.5" />
                              </GlassButton>
                              <GlassButton variant="ghost" size="sm" onClick={() => openEditClass(cls)} title="Modifier">
                                <Edit className="h-3.5 w-3.5" />
                              </GlassButton>
                              <GlassButton variant="ghost" size="sm" onClick={() => handleDeleteClass(cls.id)} title="Supprimer">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </GlassButton>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-8">
                      {/* Collège Section */}
                      {collegeClasses.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <School className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">Collège</h3>
                              <p className="text-xs text-muted-foreground">{collegeClasses.length} classes • 6ème → 3ème</p>
                            </div>
                            <Badge variant="secondary" className="ml-auto">
                              {collegeClasses.reduce((acc, c) => acc + getStudentsForClass(c.id).length, 0)} élèves
                            </Badge>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            {collegeClasses.sort(sortClasses).map(renderClassCard)}
                          </div>
                        </div>
                      )}

                      {/* Lycée Section */}
                      {lyceeClasses.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <GraduationCap className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">Lycée</h3>
                              <p className="text-xs text-muted-foreground">{lyceeClasses.length} classes • 2nde → Terminale</p>
                            </div>
                            <Badge variant="secondary" className="ml-auto">
                              {lyceeClasses.reduce((acc, c) => acc + getStudentsForClass(c.id).length, 0)} élèves
                            </Badge>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            {lyceeClasses.sort(sortClasses).map(renderClassCard)}
                          </div>
                        </div>
                      )}

                      {/* Other Classes */}
                      {otherClasses.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">Autres</h3>
                              <p className="text-xs text-muted-foreground">{otherClasses.length} classes</p>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            {otherClasses.map(renderClassCard)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </TabsContent>

          {/* Pedagogy Tab */}
          <TabsContent value="pedagogy" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Configuration Pédagogique</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Matières */}
              <GlassCard className="p-6" solid>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Matières enseignées</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configurez les matières, coefficients, et langues enseignées (LV1, LV2, LV3)
                    </p>
                    <GlassButton
                      variant="primary"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowSubjectConfigModal(true)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Gérer les matières
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>

              {/* Sections linguistiques */}
              <GlassCard className="p-6" solid>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                    <Languages className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Sections linguistiques</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Définissez les sections par langue d'enseignement (Francophone, Anglophone, etc.)
                    </p>
                    <GlassButton
                      variant="primary"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowLinguisticSectionsModal(true)}
                    >
                      <Languages className="h-4 w-4 mr-2" />
                      Gérer les sections
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          {/* HR Config Tab */}
          <TabsContent value="hr" className="space-y-4">
            {establishmentId && (
              <HRConfigTab
                establishmentId={establishmentId}
                establishmentName={establishment?.name}
              />
            )}
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <ModulesConfigTab
              enabledModules={establishment?.enabled_modules || []}
              onModulesChange={handleModulesChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Department Modal */}
      <Dialog open={showDepartmentModal} onOpenChange={setShowDepartmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Modifier le département" : "Nouveau département"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={departmentForm.name}
                onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                placeholder="Ex: Direction Générale"
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={departmentForm.code}
                onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value })}
                placeholder="Ex: DG"
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={departmentForm.type}
                onValueChange={(v) => setDepartmentForm({ ...departmentForm, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direction">Direction</SelectItem>
                  <SelectItem value="department">Département</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="bureau">Bureau</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Département parent</Label>
              <Select
                value={departmentForm.parent_id || "none"}
                onValueChange={(v) =>
                  setDepartmentForm({ ...departmentForm, parent_id: v === "none" ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun (niveau racine)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun (niveau racine)</SelectItem>
                  {departments
                    .filter((d) => d.id !== editingDepartment?.id)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={departmentForm.description}
                onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                placeholder="Description du département..."
              />
            </div>
          </div>
          <DialogFooter>
            <GlassButton variant="outline" onClick={() => setShowDepartmentModal(false)}>
              Annuler
            </GlassButton>
            <GlassButton variant="primary" onClick={handleSaveDepartment}>
              {editingDepartment ? "Modifier" : "Créer"}
            </GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Position Modal */}
      <Dialog open={showPositionModal} onOpenChange={setShowPositionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPosition ? "Modifier le poste" : "Nouveau poste"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du poste *</Label>
              <Input
                value={positionForm.name}
                onChange={(e) => setPositionForm({ ...positionForm, name: e.target.value })}
                placeholder="Ex: Directeur, Secrétaire..."
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={positionForm.code}
                onChange={(e) => setPositionForm({ ...positionForm, code: e.target.value })}
                placeholder="Ex: DIR"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={positionForm.description}
                onChange={(e) => setPositionForm({ ...positionForm, description: e.target.value })}
                placeholder="Description du poste..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_head"
                checked={positionForm.is_head}
                onChange={(e) => setPositionForm({ ...positionForm, is_head: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_head">Poste de responsable / chef</Label>
            </div>
          </div>
          <DialogFooter>
            <GlassButton variant="outline" onClick={() => setShowPositionModal(false)}>
              Annuler
            </GlassButton>
            <GlassButton variant="primary" onClick={handleSavePosition}>
              {editingPosition ? "Modifier" : "Créer"}
            </GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Modal */}
      <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClass ? "Modifier la classe" : "Nouvelle classe"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de la classe *</Label>
                <Input
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="Ex: 6ème A"
                />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={classForm.code}
                  onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                  placeholder="Ex: 6A"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau *</Label>
                <Input
                  value={classForm.level}
                  onChange={(e) => setClassForm({ ...classForm, level: e.target.value })}
                  placeholder="Ex: 6ème, Terminale..."
                />
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Input
                  value={classForm.section}
                  onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                  placeholder="Ex: S, L, ES..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Année scolaire *</Label>
                <Input
                  value={classForm.school_year}
                  onChange={(e) => setClassForm({ ...classForm, school_year: e.target.value })}
                  placeholder="Ex: 2024-2025"
                />
              </div>
              <div className="space-y-2">
                <Label>Capacité</Label>
                <Input
                  type="number"
                  value={classForm.capacity}
                  onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Salle</Label>
              <Input
                value={classForm.room}
                onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                placeholder="Ex: Salle 101"
              />
            </div>

            {/* Sections linguistiques */}
            {linguisticSections.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Sections linguistiques
                </Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/20">
                  {linguisticSections.map((section) => {
                    const isSelected = classForm.linguistic_section_ids.includes(section.id);
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setClassForm({
                              ...classForm,
                              linguistic_section_ids: classForm.linguistic_section_ids.filter(
                                (id) => id !== section.id
                              ),
                            });
                          } else {
                            setClassForm({
                              ...classForm,
                              linguistic_section_ids: [
                                ...classForm.linguistic_section_ids,
                                section.id,
                              ],
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                          }`}
                      >
                        {section.name}
                        {section.code && (
                          <span className="ml-1 opacity-70">({section.code})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cliquez pour sélectionner/désélectionner les sections
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <GlassButton variant="outline" onClick={() => setShowClassModal(false)}>
              Annuler
            </GlassButton>
            <GlassButton variant="primary" onClick={handleSaveClass}>
              {editingClass ? "Modifier" : "Créer"}
            </GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign User Modal */}
      <AssignUserModal
        isOpen={showAssignUserModal}
        onClose={() => {
          setShowAssignUserModal(false);
          setSelectedPosition(null);
        }}
        position={selectedPosition}
        currentAssignments={selectedPosition ? getUsersForPosition(selectedPosition.id) : []}
        onSuccess={fetchEstablishmentData}
      />

      {/* Student Enrollment Modal */}
      <StudentEnrollmentModal
        isOpen={showStudentEnrollmentModal}
        onClose={() => {
          setShowStudentEnrollmentModal(false);
          setSelectedClassForEnrollment(null);
        }}
        classes={classes}
        selectedClass={selectedClassForEnrollment}
        currentStudents={selectedClassForEnrollment ? getStudentsForClass(selectedClassForEnrollment.id) : []}
        onSuccess={fetchEstablishmentData}
        establishmentId={establishmentId || ""}
      />

      {/* Subject Config Modal */}
      {establishmentId && (
        <SubjectConfigModal
          open={showSubjectConfigModal}
          onOpenChange={setShowSubjectConfigModal}
          establishmentId={establishmentId}
          onSuccess={fetchEstablishmentData}
        />
      )}

      {/* Linguistic Sections Modal */}
      {establishmentId && (
        <LinguisticSectionsModal
          open={showLinguisticSectionsModal}
          onOpenChange={setShowLinguisticSectionsModal}
          establishmentId={establishmentId}
          onSuccess={fetchEstablishmentData}
        />
      )}
    </UserLayout>
  );
};

export default EstablishmentConfig;
