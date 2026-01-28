import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bell,
    Plus,
    Edit,
    Trash2,
    AlertTriangle,
    Info,
    AlertCircle,
    XCircle,
    RefreshCw,
    Settings,
} from "lucide-react";
import { toast } from "sonner";

interface AlertRule {
    id: string;
    name: string;
    description: string | null;
    condition_type: string;
    resource_type: string;
    condition_config: Record<string, unknown>;
    alert_type: string;
    is_active: boolean;
    created_at: string;
}

const alertTypeIcons: Record<string, React.ElementType> = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    critical: XCircle,
};

const alertTypeColors: Record<string, string> = {
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    critical: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export const AlertsConfig = () => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        condition_type: "threshold",
        resource_type: "establishment",
        alert_type: "warning",
        is_active: true,
        threshold_value: "",
    });

    // Récupérer les règles d'alertes (using any to bypass type checking for new table)
    const { data: rules, isLoading } = useQuery({
        queryKey: ["alert-rules"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("alert_rules")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.warn("Alert rules table not available:", error.message);
                return [];
            }
            return data as AlertRule[];
        },
    });

    // Mutation pour créer/modifier une règle
    const saveMutation = useMutation({
        mutationFn: async (rule: Partial<AlertRule>) => {
            if (editingRule) {
                const { error } = await (supabase as any)
                    .from("alert_rules")
                    .update(rule)
                    .eq("id", editingRule.id);
                if (error) throw error;
            } else {
                const { error } = await (supabase as any).from("alert_rules").insert(rule);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
            toast.success(editingRule ? "Règle modifiée" : "Règle créée");
            handleCloseDialog();
        },
        onError: () => {
            toast.error("Erreur lors de la sauvegarde");
        },
    });

    // Mutation pour supprimer une règle
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any).from("alert_rules").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
            toast.success("Règle supprimée");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
        },
    });

    // Mutation pour toggle actif/inactif
    const toggleMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { error } = await (supabase as any)
                .from("alert_rules")
                .update({ is_active })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
        },
    });

    const handleOpenDialog = (rule?: AlertRule) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({
                name: rule.name,
                description: rule.description || "",
                condition_type: rule.condition_type,
                resource_type: rule.resource_type,
                alert_type: rule.alert_type,
                is_active: rule.is_active,
                threshold_value: String(rule.condition_config.threshold || rule.condition_config.min_count || ""),
            });
        } else {
            setEditingRule(null);
            setFormData({
                name: "",
                description: "",
                condition_type: "threshold",
                resource_type: "establishment",
                alert_type: "warning",
                is_active: true,
                threshold_value: "",
            });
        }
        setIsOpen(true);
    };

    const handleCloseDialog = () => {
        setIsOpen(false);
        setEditingRule(null);
    };

    const handleSave = () => {
        if (!formData.name) {
            toast.error("Le nom est requis");
            return;
        }

        const conditionConfig: Record<string, unknown> = {};
        if (formData.condition_type === "threshold") {
            conditionConfig.threshold = Number(formData.threshold_value);
        } else if (formData.condition_type === "count") {
            conditionConfig.min_count = Number(formData.threshold_value);
        }

        saveMutation.mutate({
            name: formData.name,
            description: formData.description || null,
            condition_type: formData.condition_type,
            resource_type: formData.resource_type,
            condition_config: conditionConfig,
            alert_type: formData.alert_type,
            is_active: formData.is_active,
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Règles d'alertes</CardTitle>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2" onClick={() => handleOpenDialog()}>
                                <Plus className="h-4 w-4" />
                                Nouvelle règle
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingRule ? "Modifier la règle" : "Nouvelle règle d'alerte"}
                                </DialogTitle>
                                <DialogDescription>
                                    Configurez les conditions de déclenchement de l'alerte
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nom de la règle"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description de la règle"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type de condition</Label>
                                        <Select
                                            value={formData.condition_type}
                                            onValueChange={(v) => setFormData({ ...formData, condition_type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="threshold">Seuil</SelectItem>
                                                <SelectItem value="count">Comptage</SelectItem>
                                                <SelectItem value="absence">Absence</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ressource</Label>
                                        <Select
                                            value={formData.resource_type}
                                            onValueChange={(v) => setFormData({ ...formData, resource_type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="establishment">Établissement</SelectItem>
                                                <SelectItem value="user">Utilisateur</SelectItem>
                                                <SelectItem value="comment">Commentaire</SelectItem>
                                                <SelectItem value="class">Classe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type d'alerte</Label>
                                        <Select
                                            value={formData.alert_type}
                                            onValueChange={(v) => setFormData({ ...formData, alert_type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="warning">Avertissement</SelectItem>
                                                <SelectItem value="error">Erreur</SelectItem>
                                                <SelectItem value="critical">Critique</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.condition_type !== "absence" && (
                                        <div className="space-y-2">
                                            <Label>Valeur seuil</Label>
                                            <Input
                                                type="number"
                                                value={formData.threshold_value}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, threshold_value: e.target.value })
                                                }
                                                placeholder="Ex: 5"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="is_active">Règle active</Label>
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, is_active: checked })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={handleCloseDialog}>
                                    Annuler
                                </Button>
                                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                                    {saveMutation.isPending && (
                                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    )}
                                    {editingRule ? "Modifier" : "Créer"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <CardDescription>
                    Définissez les règles pour générer automatiquement des alertes
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : !rules || rules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune règle d'alerte configurée</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                            {rules.map((rule) => {
                                const Icon = alertTypeIcons[rule.alert_type] || AlertTriangle;
                                return (
                                    <div
                                        key={rule.id}
                                        className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`p-2 rounded-lg ${alertTypeColors[rule.alert_type]}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{rule.name}</p>
                                                    {!rule.is_active && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Inactif
                                                        </Badge>
                                                    )}
                                                </div>
                                                {rule.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {rule.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {rule.resource_type}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {rule.condition_type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={rule.is_active}
                                                onCheckedChange={(checked) =>
                                                    toggleMutation.mutate({ id: rule.id, is_active: checked })
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(rule)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteMutation.mutate(rule.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
};

export default AlertsConfig;
