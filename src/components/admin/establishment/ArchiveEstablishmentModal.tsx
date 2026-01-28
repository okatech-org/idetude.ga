/**
 * Archive Establishment Modal
 * 
 * Confirmation modal for archiving, restoring, or permanently deleting establishments
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import { Archive, Undo2, Trash2, AlertTriangle, Building2, Users, GraduationCap, FolderTree, BookOpen } from "lucide-react";
import {
    getEstablishmentArchiveStats,
    archiveEstablishment,
    restoreEstablishment,
    permanentDeleteEstablishment,
    type ArchiveStats
} from "./establishmentArchiveService";
import { toast } from "sonner";

export type ArchiveAction = "archive" | "restore" | "delete";

interface ArchiveEstablishmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    establishmentId: string | null;
    establishmentName: string;
    action: ArchiveAction;
    userId: string;
    onSuccess: () => void;
}

export function ArchiveEstablishmentModal({
    open,
    onOpenChange,
    establishmentId,
    establishmentName,
    action,
    userId,
    onSuccess,
}: ArchiveEstablishmentModalProps) {
    const [stats, setStats] = useState<ArchiveStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [executing, setExecuting] = useState(false);

    useEffect(() => {
        if (open && establishmentId) {
            setLoading(true);
            setConfirmText("");
            getEstablishmentArchiveStats(establishmentId)
                .then(setStats)
                .finally(() => setLoading(false));
        }
    }, [open, establishmentId]);

    const handleConfirm = async () => {
        if (!establishmentId) return;

        // For permanent delete, require typing "SUPPRIMER"
        if (action === "delete" && confirmText !== "SUPPRIMER") {
            toast.error("Veuillez taper SUPPRIMER pour confirmer");
            return;
        }

        setExecuting(true);
        let result;

        try {
            switch (action) {
                case "archive":
                    result = await archiveEstablishment(establishmentId, userId);
                    if (result.success) {
                        toast.success(`"${establishmentName}" a été archivé`);
                    } else {
                        toast.error(result.error || "Erreur lors de l'archivage");
                    }
                    break;

                case "restore":
                    result = await restoreEstablishment(establishmentId);
                    if (result.success) {
                        toast.success(`"${establishmentName}" a été restauré`);
                    } else {
                        toast.error(result.error || "Erreur lors de la restauration");
                    }
                    break;

                case "delete":
                    result = await permanentDeleteEstablishment(establishmentId);
                    if (result.success) {
                        toast.success(`"${establishmentName}" a été supprimé définitivement`);
                    } else {
                        toast.error(result.error || "Erreur lors de la suppression");
                    }
                    break;
            }

            if (result?.success) {
                onSuccess();
                onOpenChange(false);
            }
        } finally {
            setExecuting(false);
        }
    };

    const getActionConfig = () => {
        switch (action) {
            case "archive":
                return {
                    icon: Archive,
                    title: "Archiver l'établissement",
                    description: "L'établissement sera masqué de la liste principale mais pourra être restauré ultérieurement.",
                    buttonText: "Archiver",
                    buttonVariant: "outline" as const,
                    isDestructive: false,
                    color: "text-amber-600",
                    bgColor: "bg-amber-500/10",
                };
            case "restore":
                return {
                    icon: Undo2,
                    title: "Restaurer l'établissement",
                    description: "L'établissement sera de nouveau visible dans la liste principale.",
                    buttonText: "Restaurer",
                    buttonVariant: "primary" as const,
                    isDestructive: false,
                    color: "text-green-600",
                    bgColor: "bg-green-500/10",
                };
            case "delete":
                return {
                    icon: Trash2,
                    title: "Supprimer définitivement",
                    description: "ATTENTION : Cette action est irréversible. Toutes les données associées seront perdues.",
                    buttonText: "Supprimer définitivement",
                    buttonVariant: "outline" as const,
                    isDestructive: true,
                    color: "text-red-600",
                    bgColor: "bg-red-500/10",
                };
        }
    };

    const config = getActionConfig();
    const Icon = config.icon;
    const totalAffected = stats
        ? stats.classesCount + stats.staffCount + stats.departmentsCount + stats.subjectsCount + stats.sectionsCount
        : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        {config.title}
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        {config.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Establishment info */}
                    <GlassCard className="p-4" solid>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{establishmentName}</p>
                                <p className="text-sm text-muted-foreground">ID: {establishmentId?.slice(0, 8)}...</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Impact stats */}
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : stats && totalAffected > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Données associées ({totalAffected})
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {stats.classesCount > 0 && (
                                    <Badge variant="secondary" className="justify-start gap-2 py-2">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        {stats.classesCount} classe(s)
                                    </Badge>
                                )}
                                {stats.staffCount > 0 && (
                                    <Badge variant="secondary" className="justify-start gap-2 py-2">
                                        <Users className="h-3.5 w-3.5" />
                                        {stats.staffCount} personnel(s)
                                    </Badge>
                                )}
                                {stats.departmentsCount > 0 && (
                                    <Badge variant="secondary" className="justify-start gap-2 py-2">
                                        <FolderTree className="h-3.5 w-3.5" />
                                        {stats.departmentsCount} département(s)
                                    </Badge>
                                )}
                                {stats.subjectsCount > 0 && (
                                    <Badge variant="secondary" className="justify-start gap-2 py-2">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        {stats.subjectsCount} matière(s)
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Confirmation input for permanent delete */}
                    {action === "delete" && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Tapez <span className="font-mono font-bold text-red-600">SUPPRIMER</span> pour confirmer :
                            </p>
                            <GlassInput
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="SUPPRIMER"
                                className="font-mono"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <GlassButton variant="ghost" onClick={() => onOpenChange(false)} disabled={executing}>
                            Annuler
                        </GlassButton>
                        <GlassButton
                            variant={config.buttonVariant}
                            onClick={handleConfirm}
                            disabled={executing || (action === "delete" && confirmText !== "SUPPRIMER")}
                            className={`gap-2 ${config.isDestructive ? "border-red-500 text-red-600 hover:bg-red-500/10" : ""}`}
                        >
                            {executing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                                <Icon className="h-4 w-4" />
                            )}
                            {config.buttonText}
                        </GlassButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
