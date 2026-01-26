import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Users, Trash2, Edit2, Upload, UserPlus, Building2, GraduationCap, Link } from "lucide-react";
import { 
  StaffMember, 
  StaffCategory,
  StaffType,
  STAFF_CATEGORIES,
  STAFF_TYPES_BY_CATEGORY, 
  POSITIONS_BY_TYPE, 
  CONTRACT_TYPES,
  TUTOR_RELATIONS,
  requiresStudentLink,
  hasContract,
  getCategoryForType,
} from "./staffTypes";
import { MultiFileImport, AnalysisResult } from "../MultiFileImport";
import { toast } from "sonner";

interface StaffManagementTabProps {
  staff: StaffMember[];
  onChange: (staff: StaffMember[]) => void;
}

export const StaffManagementTab = ({ staff, onChange }: StaffManagementTabProps) => {
  const [activeCategory, setActiveCategory] = useState<StaffCategory>('administrative');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedType, setSelectedType] = useState<StaffType | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    staff_type: 'admin',
    category: 'administrative',
    is_active: true,
    is_class_principal: false,
  });

  // Récupérer les élèves pour le lien tuteur/prof particulier
  const students = staff.filter(s => s.staff_type === 'student');

  const handleAddStaff = () => {
    if (!staffForm.first_name || !staffForm.last_name) {
      toast.error("Nom et prénom requis");
      return;
    }

    // Vérifier le lien étudiant si requis
    if (requiresStudentLink(staffForm.staff_type as StaffType) && !staffForm.linked_student_id) {
      toast.error("Veuillez sélectionner l'élève associé");
      return;
    }

    const newStaff: StaffMember = {
      staff_type: staffForm.staff_type as StaffType,
      category: getCategoryForType(staffForm.staff_type as StaffType),
      position: staffForm.position,
      department: staffForm.department,
      contract_type: staffForm.contract_type as StaffMember['contract_type'],
      start_date: staffForm.start_date,
      is_active: staffForm.is_active ?? true,
      is_class_principal: staffForm.is_class_principal ?? false,
      linked_student_id: staffForm.linked_student_id,
      first_name: staffForm.first_name,
      last_name: staffForm.last_name,
      email: staffForm.email,
      phone: staffForm.phone,
      metadata: {
        first_name: staffForm.first_name,
        last_name: staffForm.last_name,
        email: staffForm.email,
        phone: staffForm.phone,
      },
    };

    if (editingIndex !== null) {
      const updated = [...staff];
      updated[editingIndex] = newStaff;
      onChange(updated);
      setEditingIndex(null);
    } else {
      onChange([...staff, newStaff]);
    }

    resetForm();
    toast.success(editingIndex !== null ? "Personnel modifié" : "Personnel ajouté");
  };

  const resetForm = () => {
    setStaffForm({
      staff_type: activeCategory === 'administrative' ? 'admin' : 'student',
      category: activeCategory,
      is_active: true,
      is_class_principal: false,
    });
    setShowAddModal(false);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    const member = staff[index];
    setStaffForm({
      ...member,
      first_name: member.first_name || (member.metadata as Record<string, unknown>)?.first_name as string,
      last_name: member.last_name || (member.metadata as Record<string, unknown>)?.last_name as string,
      email: member.email || (member.metadata as Record<string, unknown>)?.email as string,
      phone: member.phone || (member.metadata as Record<string, unknown>)?.phone as string,
    });
    setEditingIndex(index);
    setShowAddModal(true);
  };

  const handleDelete = (index: number) => {
    // Vérifier si c'est un élève avec des dépendants
    const member = staff[index];
    if (member.staff_type === 'student') {
      const linkedMembers = staff.filter(s => s.linked_student_id === member.id);
      if (linkedMembers.length > 0) {
        toast.error("Cet élève a des tuteurs ou professeurs particuliers rattachés. Supprimez-les d'abord.");
        return;
      }
    }
    onChange(staff.filter((_, i) => i !== index));
    toast.success("Personnel supprimé");
  };

  const handleImportAnalysis = (result: AnalysisResult) => {
    if (result.success && Array.isArray(result.data)) {
      const imported: StaffMember[] = result.data.map((item: Record<string, unknown>) => {
        const staffType = (item.staff_type as StaffType) || 'admin';
        return {
          staff_type: staffType,
          category: getCategoryForType(staffType),
          position: item.position as string,
          department: item.department as string,
          contract_type: item.contract_type as StaffMember['contract_type'],
          is_active: true,
          is_class_principal: false,
          first_name: (item.first_name || item.firstName) as string,
          last_name: (item.last_name || item.lastName) as string,
          email: item.email as string,
          phone: item.phone as string,
          metadata: {
            first_name: (item.first_name || item.firstName) as string,
            last_name: (item.last_name || item.lastName) as string,
            email: item.email as string,
            phone: item.phone as string,
          },
        };
      }).filter((s: StaffMember) => s.first_name && s.last_name);

      if (imported.length > 0) {
        onChange([...staff, ...imported]);
        toast.success(`${imported.length} membre(s) du personnel importé(s)`);
        setShowImportModal(false);
      }
    }
  };

  const openAddModal = (category: StaffCategory) => {
    setActiveCategory(category);
    setStaffForm({
      staff_type: category === 'administrative' ? 'admin' : 'student',
      category,
      is_active: true,
      is_class_principal: false,
    });
    setShowAddModal(true);
  };

  // Filtrer le personnel par catégorie
  const administrativeStaff = staff.filter(s => getCategoryForType(s.staff_type) === 'administrative');
  const educationalStaff = staff.filter(s => getCategoryForType(s.staff_type) === 'educational');

  // Stats par type pour la catégorie active
  const currentStaff = activeCategory === 'administrative' ? administrativeStaff : educationalStaff;
  const staffTypes = STAFF_TYPES_BY_CATEGORY[activeCategory];

  // Récupérer le nom d'un élève par son ID temporaire (index)
  const getStudentName = (studentId: string | undefined) => {
    if (!studentId) return null;
    const student = staff.find(s => s.staff_type === 'student' && 
      (s.id === studentId || `temp-${staff.indexOf(s)}` === studentId));
    if (student) {
      return `${student.first_name} ${student.last_name}`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Personnel et acteurs
          </h3>
          <p className="text-sm text-muted-foreground">
            Gérez le personnel administratif et les acteurs éducatifs de l'établissement
          </p>
        </div>
        <GlassButton variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
          <Upload className="h-4 w-4" />
          Importer
        </GlassButton>
      </div>

      {/* Onglets Administratif / Éducatif */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as StaffCategory)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="administrative" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Administratif
            <Badge variant="secondary" className="ml-1">{administrativeStaff.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="educational" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Éducatif
            <Badge variant="secondary" className="ml-1">{educationalStaff.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="administrative" className="space-y-4 mt-4">
          <StaffCategoryContent
            category="administrative"
            staffTypes={staffTypes}
            staff={administrativeStaff}
            allStaff={staff}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            onAdd={() => openAddModal('administrative')}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStudentName={getStudentName}
          />
        </TabsContent>

        <TabsContent value="educational" className="space-y-4 mt-4">
          <StaffCategoryContent
            category="educational"
            staffTypes={staffTypes}
            staff={educationalStaff}
            allStaff={staff}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            onAdd={() => openAddModal('educational')}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStudentName={getStudentName}
          />
        </TabsContent>
      </Tabs>

      {/* Modal d'ajout/modification */}
      <Dialog open={showAddModal} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Modifier" : "Ajouter"} - {activeCategory === 'administrative' ? 'Personnel administratif' : 'Acteur éducatif'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Type de personnel */}
            <div className="space-y-2">
              <Label>Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                {STAFF_TYPES_BY_CATEGORY[activeCategory].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setStaffForm({ 
                      ...staffForm, 
                      staff_type: type.value, 
                      position: "",
                      linked_student_id: undefined,
                    })}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      staffForm.staff_type === type.value
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{type.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input
                  value={staffForm.first_name || ""}
                  onChange={(e) => setStaffForm({ ...staffForm, first_name: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={staffForm.last_name || ""}
                  onChange={(e) => setStaffForm({ ...staffForm, last_name: e.target.value })}
                  placeholder="Nom"
                />
              </div>
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={staffForm.email || ""}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={staffForm.phone || ""}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  placeholder="+241 XX XX XX XX"
                />
              </div>
            </div>

            {/* Lien avec élève (pour tuteur et prof particulier) */}
            {requiresStudentLink(staffForm.staff_type as StaffType) && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Élève associé *
                </Label>
                {students.length === 0 ? (
                  <div className="p-3 rounded-lg border border-dashed bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      Aucun élève disponible. Ajoutez d'abord des élèves dans l'onglet Éducatif.
                    </p>
                  </div>
                ) : (
                  <Select
                    value={staffForm.linked_student_id || "none"}
                    onValueChange={(v) => setStaffForm({ 
                      ...staffForm, 
                      linked_student_id: v === "none" ? undefined : v 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'élève" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sélectionner...</SelectItem>
                      {students.map((student, idx) => (
                        <SelectItem 
                          key={student.id || `temp-${staff.indexOf(student)}`} 
                          value={student.id || `temp-${staff.indexOf(student)}`}
                        >
                          {student.first_name} {student.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Poste / Fonction */}
            <div className="space-y-2">
              <Label>
                {staffForm.staff_type === 'tutor' ? 'Relation avec l\'élève' : 'Poste / Fonction'}
              </Label>
              <Select
                value={staffForm.position || "none"}
                onValueChange={(v) => setStaffForm({ ...staffForm, position: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Autre / Non spécifié</SelectItem>
                  {(staffForm.staff_type === 'tutor' 
                    ? TUTOR_RELATIONS 
                    : POSITIONS_BY_TYPE[staffForm.staff_type as StaffType] || []
                  ).map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Professeur Principal (pour enseignants éducatifs) */}
            {staffForm.staff_type === 'teacher' && activeCategory === 'educational' && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <Label>Professeur Principal</Label>
                  <p className="text-xs text-muted-foreground">Responsable de la classe</p>
                </div>
                <Switch
                  checked={staffForm.is_class_principal ?? false}
                  onCheckedChange={(checked) => setStaffForm({ ...staffForm, is_class_principal: checked })}
                />
              </div>
            )}

            {/* Type de contrat (sauf élèves et tuteurs) */}
            {hasContract(staffForm.staff_type as StaffType) && (
              <div className="space-y-2">
                <Label>Type de contrat</Label>
                <Select
                  value={staffForm.contract_type || "none"}
                  onValueChange={(v) => setStaffForm({ 
                    ...staffForm, 
                    contract_type: v === "none" ? undefined : v as StaffMember['contract_type'] 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non spécifié</SelectItem>
                    {CONTRACT_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date de début */}
            <div className="space-y-2">
              <Label>{staffForm.staff_type === 'student' ? 'Date d\'inscription' : 'Date de début'}</Label>
              <Input
                type="date"
                value={staffForm.start_date || ""}
                onChange={(e) => setStaffForm({ ...staffForm, start_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <GlassButton variant="ghost" onClick={resetForm}>
              Annuler
            </GlassButton>
            <GlassButton variant="primary" onClick={handleAddStaff}>
              {editingIndex !== null ? "Modifier" : "Ajouter"}
            </GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'import */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importer du personnel</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Importez une liste de personnel depuis un fichier CSV, PDF, ou image. 
              L'IA analysera le contenu et extraira les informations.
            </p>
            
            <MultiFileImport
              context="staff"
              onAnalysisComplete={handleImportAnalysis}
            />

            <GlassCard className="p-4" solid>
              <h5 className="font-medium text-sm mb-2">Colonnes attendues :</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Prénom, Nom (obligatoires)</li>
                <li>• Email, Téléphone</li>
                <li>• Type (direction, admin, teacher, student, tutor, technical, private_teacher)</li>
                <li>• Poste, Département</li>
              </ul>
            </GlassCard>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Composant interne pour le contenu d'une catégorie
interface StaffCategoryContentProps {
  category: StaffCategory;
  staffTypes: { value: StaffType; label: string; icon: string; description: string }[];
  staff: StaffMember[];
  allStaff: StaffMember[];
  selectedType: StaffType | null;
  onSelectType: (type: StaffType | null) => void;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  getStudentName: (id: string | undefined) => string | null;
}

const StaffCategoryContent = ({
  category,
  staffTypes,
  staff,
  allStaff,
  selectedType,
  onSelectType,
  onAdd,
  onEdit,
  onDelete,
  getStudentName,
}: StaffCategoryContentProps) => {
  const filteredStaff = selectedType 
    ? staff.filter(s => s.staff_type === selectedType)
    : staff;

  return (
    <>
      {/* Boutons de filtre par type */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {staffTypes.map((type) => {
          const count = staff.filter(s => s.staff_type === type.value).length;
          return (
            <button
              key={type.value}
              onClick={() => onSelectType(selectedType === type.value ? null : type.value)}
              className={cn(
                "p-3 rounded-lg border text-center transition-all",
                selectedType === type.value
                  ? "bg-primary/10 border-primary"
                  : "bg-muted/30 hover:bg-muted/50"
              )}
            >
              <span className="text-2xl">{type.icon}</span>
              <p className="text-sm font-medium mt-1">{type.label}</p>
              <Badge variant={count > 0 ? "default" : "secondary"} className="mt-1">
                {count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Bouton d'ajout */}
      <div className="flex justify-end">
        <GlassButton variant="primary" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Ajouter
        </GlassButton>
      </div>

      {/* Liste du personnel */}
      {filteredStaff.length === 0 ? (
        <GlassCard className="p-8 text-center" solid>
          <UserPlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {selectedType 
              ? `Aucun ${staffTypes.find(t => t.value === selectedType)?.label.toLowerCase()} ajouté`
              : `Aucun personnel ${category === 'administrative' ? 'administratif' : 'éducatif'} ajouté`}
          </p>
          <GlassButton 
            variant="outline" 
            className="mt-4"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            Ajouter du personnel
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {filteredStaff.map((member) => {
            const typeInfo = staffTypes.find(t => t.value === member.staff_type);
            const realIndex = allStaff.indexOf(member);
            const studentName = getStudentName(member.linked_student_id);
            
            return (
              <div
                key={realIndex}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeInfo?.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      {member.is_class_principal && (
                        <Badge variant="default" className="text-xs">Principal</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {member.position && <span>{member.position}</span>}
                      {studentName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            {studentName}
                          </span>
                        </>
                      )}
                      {member.email && (
                        <>
                          <span>•</span>
                          <span>{member.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{typeInfo?.label}</Badge>
                  {member.contract_type && (
                    <Badge variant="secondary">
                      {CONTRACT_TYPES.find(c => c.value === member.contract_type)?.label}
                    </Badge>
                  )}
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(realIndex)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(realIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </GlassButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
