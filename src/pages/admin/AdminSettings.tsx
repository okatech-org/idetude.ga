import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Settings, 
  Bell,
  Shield,
  Globe,
  Mail,
  Database,
  Palette,
  Save,
  RefreshCw,
  AlertTriangle,
  Building2,
  Layers,
  Maximize2,
  PanelTop
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { 
  CreationMethod,
  DisplayMode,
  useCreationMethodConfig, 
  getMethodLabel, 
  getMethodDescription 
} from "@/hooks/useCreationMethodConfig";

interface PlatformSettings {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  activityDigest: boolean;
  
  // Security
  twoFactorRequired: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  
  // Platform
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  defaultLanguage: string;
  
  // Branding
  platformName: string;
  supportEmail: string;
}

const defaultSettings: PlatformSettings = {
  emailNotifications: true,
  pushNotifications: true,
  activityDigest: false,
  twoFactorRequired: false,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  maintenanceMode: false,
  allowNewRegistrations: true,
  defaultLanguage: 'fr',
  platformName: 'iDETUDE',
  supportEmail: 'support@idetude.app',
};

export default function AdminSettings() {
  const { enabledMethods, toggleMethod, setEnabledMethods, displayMode, setDisplayMode } = useCreationMethodConfig();
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K, 
    value: PlatformSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleToggleMethod = (method: CreationMethod) => {
    toggleMethod(method);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call for other settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
    toast.success("Paramètres sauvegardés avec succès");
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setEnabledMethods(["1-step"]);
    setDisplayMode("modal");
    setHasChanges(false);
    toast.info("Paramètres réinitialisés");
  };

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    setHasChanges(true);
  };

  const creationMethods: CreationMethod[] = ['1-step', '2-step', '3-step'];

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Configuration
            </h1>
            <p className="text-muted-foreground mt-1">
              Paramètres globaux de la plateforme iDETUDE
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Vous avez des modifications non sauvegardées
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez les préférences de notifications globales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des emails pour les événements importants
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer les notifications push navigateur
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Digest d'activité</Label>
                  <p className="text-sm text-muted-foreground">
                    Résumé hebdomadaire des activités
                  </p>
                </div>
                <Switch
                  checked={settings.activityDigest}
                  onCheckedChange={(checked) => updateSetting('activityDigest', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>2FA obligatoire</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger l'authentification à deux facteurs
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(checked) => updateSetting('twoFactorRequired', checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Timeout de session (minutes)</Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  min={5}
                  max={480}
                />
              </div>
              <div className="space-y-2">
                <Label>Tentatives de connexion max</Label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                  min={3}
                  max={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Plateforme
              </CardTitle>
              <CardDescription>
                Paramètres généraux de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Mode maintenance</Label>
                    {settings.maintenanceMode && (
                      <Badge variant="destructive" className="text-xs">Actif</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Désactiver l'accès à la plateforme
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouvelles inscriptions</Label>
                  <p className="text-sm text-muted-foreground">
                    Autoriser les nouvelles inscriptions
                  </p>
                </div>
                <Switch
                  checked={settings.allowNewRegistrations}
                  onCheckedChange={(checked) => updateSetting('allowNewRegistrations', checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Langue par défaut
                </Label>
                <Input
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                  placeholder="fr"
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Personnalisation
              </CardTitle>
              <CardDescription>
                Identité visuelle et informations de contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la plateforme</Label>
                <Input
                  value={settings.platformName}
                  onChange={(e) => updateSetting('platformName', e.target.value)}
                  placeholder="iDETUDE"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email de support
                </Label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  placeholder="support@idetude.app"
                />
              </div>
            </CardContent>
          </Card>

          {/* Establishment Creation Method */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Création d'établissements
              </CardTitle>
              <CardDescription>
                Configurez les méthodes de création et le mode d'affichage des formulaires.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Display Mode Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <PanelTop className="h-4 w-4" />
                  Mode d'affichage
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choisissez comment les formulaires de création s'affichent. L'utilisateur peut basculer entre les deux modes pendant la création.
                </p>
                <RadioGroup 
                  value={displayMode} 
                  onValueChange={(v) => handleDisplayModeChange(v as DisplayMode)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <label
                    htmlFor="mode-modal"
                    className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      displayMode === "modal"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="modal" id="mode-modal" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <PanelTop className="h-4 w-4 text-primary" />
                        <span className="font-medium">Bloc flottant (Modal)</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ouvre un dialogue par-dessus la page actuelle. Pratique pour les créations rapides.
                      </p>
                    </div>
                    {displayMode === "modal" && (
                      <Badge className="absolute top-2 right-2 text-xs">Par défaut</Badge>
                    )}
                  </label>
                  <label
                    htmlFor="mode-fullpage"
                    className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      displayMode === "fullpage"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="fullpage" id="mode-fullpage" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">Pleine page</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Utilise toute la page pour plus d'espace. Idéal pour les configurations détaillées.
                      </p>
                    </div>
                    {displayMode === "fullpage" && (
                      <Badge className="absolute top-2 right-2 text-xs">Par défaut</Badge>
                    )}
                  </label>
                </RadioGroup>
              </div>

              <Separator />

              {/* Creation Methods Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Méthodes de création
                </Label>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les méthodes disponibles. Si plusieurs sont activées, l'utilisateur pourra choisir.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {creationMethods.map((method) => {
                    const isEnabled = enabledMethods.includes(method);
                    return (
                      <label
                        key={method}
                        htmlFor={`method-${method}`}
                        className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isEnabled
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id={`method-${method}`}
                            checked={isEnabled}
                            onCheckedChange={() => handleToggleMethod(method)}
                          />
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            <span className="font-medium">{getMethodLabel(method)}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground pl-7">
                          {getMethodDescription(method)}
                        </p>
                        {isEnabled && (
                          <Badge className="absolute top-2 right-2 text-xs">Actif</Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">
                  Résumé de la configuration :
                </p>
                <ul className="space-y-1 text-muted-foreground mt-2">
                  <li>• <strong>Affichage</strong> : {displayMode === "modal" ? "Bloc flottant" : "Pleine page"} (basculement possible)</li>
                  <li>• <strong>Méthodes</strong> : {enabledMethods.length > 1 
                    ? `${enabledMethods.length} méthodes - L'utilisateur choisira`
                    : "Méthode unique"
                  }</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Environnement</p>
                <Badge variant="secondary">Production</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Base de données</p>
                <Badge variant="outline" className="text-green-500 border-green-500">Connectée</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Dernière mise à jour</p>
                <p className="font-medium">26 Jan 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
