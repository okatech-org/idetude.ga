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
} from "lucide-react";
import { OrgChart } from "@/components/admin/OrgChart";
import { AssignUserModal } from "@/components/admin/AssignUserModal";
import { StudentEnrollmentModal } from "@/components/admin/StudentEnrollmentModal";
import { QuickAssignDropdown } from "@/components/admin/QuickAssignDropdown";
import { SubjectConfigModal } from "@/components/admin/SubjectConfigModal";
import { LinguisticSectionsModal } from "@/components/admin/LinguisticSectionsModal";

interface Establishment {
  id: string;
  name: string;
  code: string | null;
  type: string;
  address: string | null;
  levels: string | null;
  group_id: string | null;
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

      // Fetch departments
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("order_index");

      if (deptError) throw deptError;
      setDepartments(deptData || []);

      // Fetch positions for all departments
      if (deptData && deptData.length > 0) {
        const deptIds = deptData.map((d) => d.id);
        const { data: posData, error: posError } = await supabase
          .from("positions")
          .select("*")
          .in("department_id", deptIds)
          .order("order_index");

        if (posError) throw posError;
        setPositions(posData || []);

        // Fetch user positions
        if (posData && posData.length > 0) {
          const posIds = posData.map((p) => p.id);
          const { data: upData, error: upError } = await supabase
            .from("user_positions")
            .select("*")
            .in("position_id", posIds)
            .eq("is_active", true);

          if (upError) throw upError;
          
          // Fetch profiles for user positions
          if (upData && upData.length > 0) {
            const userIds = [...new Set(upData.map((up) => up.user_id))];
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, email")
              .in("id", userIds);

            const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
            const enrichedData = upData.map((up) => ({
              ...up,
              profiles: profilesMap.get(up.user_id),
            }));
            setUserPositions(enrichedData);
          } else {
            setUserPositions([]);
          }
        }
      }

      // Fetch classes
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("level")
        .order("name");

      if (classError) throw classError;
      setClasses(classData || []);

      // Fetch class teachers
      if (classData && classData.length > 0) {
        const classIds = classData.map((c) => c.id);
        const { data: ctData, error: ctError } = await supabase
          .from("class_teachers")
          .select("*")
          .in("class_id", classIds);

        if (ctError) throw ctError;
        
        // Fetch profiles for teachers
        if (ctData && ctData.length > 0) {
          const teacherIds = [...new Set(ctData.map((ct) => ct.teacher_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .in("id", teacherIds);

          const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
          const enrichedData = ctData.map((ct) => ({
            ...ct,
            profiles: profilesMap.get(ct.teacher_id),
          }));
          setClassTeachers(enrichedData);
        } else {
          setClassTeachers([]);
        }

        // Fetch class students
        const { data: csData, error: csError } = await supabase
          .from("class_students")
          .select("*")
          .in("class_id", classIds);

        if (csError) throw csError;

        if (csData && csData.length > 0) {
          const studentIds = [...new Set(csData.map((cs) => cs.student_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .in("id", studentIds);

          const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
          const enrichedData = csData.map((cs) => ({
            ...cs,
            profiles: profilesMap.get(cs.student_id),
          }));
          setClassStudents(enrichedData);
        } else {
          setClassStudents([]);
        }
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
        toast.success("Classe modifiée");
      } else {
        const { error } = await supabase.from("classes").insert({
          establishment_id: establishmentId,
          name: classForm.name,
          code: classForm.code || null,
          level: classForm.level,
          section: classForm.section || null,
          school_year: classForm.school_year,
          capacity: classForm.capacity,
          room: classForm.room || null,
        });

        if (error) throw error;
        toast.success("Classe créée");
      }

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
    setClassForm({ name: "", code: "", level: "", section: "", school_year: "2024-2025", capacity: 30, room: "" });
    setEditingClass(null);
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
    setClassForm({
      name: cls.name,
      code: cls.code || "",
      level: cls.level,
      section: cls.section || "",
      school_year: cls.school_year,
      capacity: cls.capacity || 30,
      room: cls.room || "",
    });
    setShowClassModal(true);
  };

  const getPositionsForDepartment = (deptId: string) => positions.filter((p) => p.department_id === deptId);
  const getUsersForPosition = (posId: string) => userPositions.filter((up) => up.position_id === posId);
  const getTeachersForClass = (classId: string) => classTeachers.filter((ct) => ct.class_id === classId);
  const getStudentsForClass = (classId: string) => classStudents.filter((cs) => cs.class_id === classId);

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orgchart" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Organigramme
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Administration
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="pedagogy" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Pédagogie
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
              <div className="space-y-4">
                {departments
                  .filter((d) => !d.parent_id)
                  .map((dept) => (
                    <GlassCard key={dept.id} className="p-4" solid>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FolderTree className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{dept.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {typeLabels[dept.type] || dept.type}
                              </Badge>
                            </div>
                            {dept.description && (
                              <p className="text-sm text-muted-foreground">{dept.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              resetPositionForm();
                              setSelectedDepartmentId(dept.id);
                              setShowPositionModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Poste
                          </GlassButton>
                          <GlassButton variant="ghost" size="sm" onClick={() => openEditDepartment(dept)}>
                            <Edit className="h-4 w-4" />
                          </GlassButton>
                          <GlassButton variant="ghost" size="sm" onClick={() => handleDeleteDepartment(dept.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </GlassButton>
                        </div>
                      </div>

                      {/* Positions in this department */}
                      {getPositionsForDepartment(dept.id).length > 0 && (
                        <div className="mt-4 ml-6 space-y-3">
                          {getPositionsForDepartment(dept.id).map((pos) => (
                            <div
                              key={pos.id}
                              className="p-3 rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-foreground">{pos.name}</p>
                                      {pos.is_head && (
                                        <Badge variant="secondary" className="text-xs">
                                          Chef
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePositionClick(pos)}
                                    title="Gérer les affectations"
                                  >
                                    <UserPlus className="h-3 w-3" />
                                  </GlassButton>
                                  <GlassButton variant="ghost" size="sm" onClick={() => openEditPosition(pos)}>
                                    <Edit className="h-3 w-3" />
                                  </GlassButton>
                                  <GlassButton variant="ghost" size="sm" onClick={() => handleDeletePosition(pos.id)}>
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </GlassButton>
                                </div>
                              </div>
                              {/* Quick assign dropdown */}
                              <QuickAssignDropdown
                                positionId={pos.id}
                                positionName={pos.name}
                                currentAssignments={getUsersForPosition(pos.id)}
                                onSuccess={fetchEstablishmentData}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Sub-departments */}
                      {departments
                        .filter((sd) => sd.parent_id === dept.id)
                        .map((subDept) => (
                          <div key={subDept.id} className="mt-3 ml-6 p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium text-foreground">{subDept.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {typeLabels[subDept.type] || subDept.type}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <GlassButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    resetPositionForm();
                                    setSelectedDepartmentId(subDept.id);
                                    setShowPositionModal(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </GlassButton>
                                <GlassButton variant="ghost" size="sm" onClick={() => openEditDepartment(subDept)}>
                                  <Edit className="h-3 w-3" />
                                </GlassButton>
                                <GlassButton variant="ghost" size="sm" onClick={() => handleDeleteDepartment(subDept.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </GlassButton>
                              </div>
                            </div>
                            {/* Positions in sub-department */}
                            {getPositionsForDepartment(subDept.id).map((pos) => (
                              <div
                                key={pos.id}
                                className="mt-2 ml-4 p-2 rounded bg-muted/30 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{pos.name}</span>
                                  {pos.is_head && (
                                    <Badge variant="secondary" className="text-xs">
                                      Chef
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                    </GlassCard>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-4">
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
              <div className="grid gap-4 md:grid-cols-2">
                {classes.map((cls) => {
                  const teachers = getTeachersForClass(cls.id);
                  const mainTeacher = teachers.find((t) => t.is_main_teacher);

                  const students = getStudentsForClass(cls.id);

                  return (
                    <GlassCard key={cls.id} className="p-4" solid>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{cls.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {cls.level} {cls.section && `• ${cls.section}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {cls.school_year}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {students.length} / {cls.capacity || "∞"} élèves
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <GlassButton 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openStudentEnrollment(cls)}
                            title="Gérer les élèves"
                          >
                            <UserPlus className="h-4 w-4" />
                          </GlassButton>
                          <GlassButton variant="ghost" size="sm" onClick={() => openEditClass(cls)}>
                            <Edit className="h-4 w-4" />
                          </GlassButton>
                          <GlassButton variant="ghost" size="sm" onClick={() => handleDeleteClass(cls.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </GlassButton>
                        </div>
                      </div>

                      {/* Teachers */}
                      {teachers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">Enseignants :</p>
                          <div className="space-y-1">
                            {teachers.map((t) => (
                              <div key={t.id} className="flex items-center gap-2 text-sm">
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <span>
                                  {t.profiles?.first_name} {t.profiles?.last_name}
                                </span>
                                {t.is_main_teacher && (
                                  <Badge variant="secondary" className="text-xs">
                                    PP
                                  </Badge>
                                )}
                                {t.subject && (
                                  <span className="text-muted-foreground">({t.subject})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Students preview */}
                      {students.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">
                            Élèves ({students.length}) :
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {students.slice(0, 5).map((s) => (
                              <Badge key={s.id} variant="outline" className="text-xs">
                                {s.profiles?.first_name} {s.profiles?.last_name?.charAt(0)}.
                              </Badge>
                            ))}
                            {students.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{students.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {cls.room && (
                        <p className="text-xs text-muted-foreground mt-2">Salle : {cls.room}</p>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
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
