import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, Trash2, Edit2, Upload, UserPlus } from "lucide-react";
import { StaffMember, STAFF_TYPES, POSITIONS_BY_TYPE, CONTRACT_TYPES } from "./types";
import { MultiFileImport, AnalysisResult } from "../MultiFileImport";
import { toast } from "sonner";

interface StaffManagementTabProps {
  staff: StaffMember[];
  onChange: (staff: StaffMember[]) => void;
}

export const StaffManagementTab = ({ staff, onChange }: StaffManagementTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    staff_type: 'admin',
    is_active: true,
  });

  const handleAddStaff = () => {
    if (!staffForm.first_name || !staffForm.last_name) {
      toast.error("Nom et prénom requis");
      return;
    }

    const newStaff: StaffMember = {
      staff_type: staffForm.staff_type as StaffMember['staff_type'],
      position: staffForm.position,
      department: staffForm.department,
      contract_type: staffForm.contract_type as StaffMember['contract_type'],
      start_date: staffForm.start_date,
      is_active: staffForm.is_active ?? true,
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

    setStaffForm({ staff_type: 'admin', is_active: true });
    setShowAddModal(false);
    toast.success(editingIndex !== null ? "Personnel modifié" : "Personnel ajouté");
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
    onChange(staff.filter((_, i) => i !== index));
    toast.success("Personnel supprimé");
  };

  const handleImportAnalysis = (result: AnalysisResult) => {
    if (result.success && Array.isArray(result.data)) {
      const imported: StaffMember[] = result.data.map((item: Record<string, unknown>) => ({
        staff_type: (item.staff_type as StaffMember['staff_type']) || 'admin',
        position: item.position as string,
        department: item.department as string,
        contract_type: item.contract_type as StaffMember['contract_type'],
        is_active: true,
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
      })).filter((s: StaffMember) => s.first_name && s.last_name);

      if (imported.length > 0) {
        onChange([...staff, ...imported]);
        toast.success(`${imported.length} membre(s) du personnel importé(s)`);
        setShowImportModal(false);
      }
    }
  };

  const staffByType = STAFF_TYPES.map(type => ({
    ...type,
    members: staff.filter(s => s.staff_type === type.value),
  }));

  const filteredStaff = selectedType 
    ? staff.filter(s => s.staff_type === selectedType)
    : staff;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Personnel et acteurs
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez le personnel administratif, enseignant, les élèves et tuteurs
          </p>
        </div>
        <div className="flex gap-2">
          <GlassButton variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4" />
            Importer
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Ajouter
          </GlassButton>
        </div>
      </div>

      {/* Statistiques par type */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {staffByType.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(selectedType === type.value ? null : type.value)}
            className={cn(
              "p-3 rounded-lg border text-center transition-all",
              selectedType === type.value
                ? "bg-primary/10 border-primary"
                : "bg-muted/30 hover:bg-muted/50"
            )}
          >
            <span className="text-2xl">{type.icon}</span>
            <p className="text-sm font-medium mt-1">{type.label}</p>
            <Badge variant={type.members.length > 0 ? "default" : "secondary"} className="mt-1">
              {type.members.length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Liste du personnel */}
      {filteredStaff.length === 0 ? (
        <GlassCard className="p-8 text-center" solid>
          <UserPlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            {selectedType 
              ? `Aucun ${STAFF_TYPES.find(t => t.value === selectedType)?.label.toLowerCase()} ajouté`
              : "Aucun personnel ajouté"}
          </p>
          <GlassButton 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Ajouter du personnel
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredStaff.map((member, index) => {
            const typeInfo = STAFF_TYPES.find(t => t.value === member.staff_type);
            const realIndex = staff.indexOf(member);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeInfo?.icon}</span>
                  <div>
                    <p className="font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {member.position && <span>{member.position}</span>}
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
                    onClick={() => handleEdit(realIndex)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(realIndex)}
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

      {/* Modal d'ajout */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Modifier" : "Ajouter"} un membre du personnel
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
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

            <div className="space-y-2">
              <Label>Type de personnel *</Label>
              <div className="grid grid-cols-3 gap-2">
                {STAFF_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setStaffForm({ ...staffForm, staff_type: type.value, position: "" })}
                    className={cn(
                      "p-2 rounded-lg border text-center transition-all",
                      staffForm.staff_type === type.value
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <p className="text-xs mt-1">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Poste / Fonction</Label>
              <Select
                value={staffForm.position || "none"}
                onValueChange={(v) => setStaffForm({ ...staffForm, position: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un poste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Autre / Non spécifié</SelectItem>
                  {(POSITIONS_BY_TYPE[staffForm.staff_type || 'admin'] || []).map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {staffForm.staff_type && !['student', 'tutor'].includes(staffForm.staff_type) && (
              <div className="space-y-2">
                <Label>Type de contrat</Label>
                <Select
                  value={staffForm.contract_type || "none"}
                  onValueChange={(v) => setStaffForm({ ...staffForm, contract_type: v === "none" ? undefined : v as StaffMember['contract_type'] })}
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

            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="date"
                value={staffForm.start_date || ""}
                onChange={(e) => setStaffForm({ ...staffForm, start_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <GlassButton variant="ghost" onClick={() => {
              setShowAddModal(false);
              setEditingIndex(null);
              setStaffForm({ staff_type: 'admin', is_active: true });
            }}>
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
                <li>• Type (direction, admin, teacher, student, tutor, technical)</li>
                <li>• Poste, Département</li>
              </ul>
            </GlassCard>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
