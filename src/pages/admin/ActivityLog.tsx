import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Search, 
  Filter,
  UserPlus,
  Building2,
  Settings,
  Shield,
  FileText,
  MessageSquare,
  Clock,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types d'activités
type ActivityType = 'user_created' | 'establishment_created' | 'settings_changed' | 'role_assigned' | 'document_uploaded' | 'message_sent';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: {
    name: string;
    role: string;
  };
  target?: string;
  timestamp: Date;
  metadata?: Record<string, string>;
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  user_created: UserPlus,
  establishment_created: Building2,
  settings_changed: Settings,
  role_assigned: Shield,
  document_uploaded: FileText,
  message_sent: MessageSquare,
};

const activityColors: Record<ActivityType, string> = {
  user_created: 'bg-green-500/10 text-green-500',
  establishment_created: 'bg-blue-500/10 text-blue-500',
  settings_changed: 'bg-amber-500/10 text-amber-500',
  role_assigned: 'bg-purple-500/10 text-purple-500',
  document_uploaded: 'bg-cyan-500/10 text-cyan-500',
  message_sent: 'bg-rose-500/10 text-rose-500',
};

// Mock data - À remplacer par des données réelles
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'establishment_created',
    title: 'Nouvel établissement créé',
    description: 'Lycée International de Libreville a été ajouté au système',
    actor: { name: 'Jean Moussavou', role: 'Super Admin' },
    target: 'Lycée International de Libreville',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    metadata: { country: 'Gabon', type: 'lycee' }
  },
  {
    id: '2',
    type: 'user_created',
    title: 'Nouvel utilisateur inscrit',
    description: 'Un nouveau directeur a été ajouté',
    actor: { name: 'Marie Nzoghe', role: 'Admin Régional' },
    target: 'Paul Ondo',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    metadata: { role: 'school_director' }
  },
  {
    id: '3',
    type: 'role_assigned',
    title: 'Rôle attribué',
    description: 'Rôle CPE attribué à un utilisateur',
    actor: { name: 'System', role: 'Automatique' },
    target: 'Sylvie Mba',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    type: 'settings_changed',
    title: 'Configuration modifiée',
    description: 'Les modules activés ont été mis à jour',
    actor: { name: 'Jean Moussavou', role: 'Super Admin' },
    target: 'Collège Saint-Exupéry',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '5',
    type: 'document_uploaded',
    title: 'Document importé',
    description: 'Liste des élèves importée par CSV',
    actor: { name: 'Anne Obiang', role: 'Admin École' },
    target: 'École Primaire Montfort',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    metadata: { file_type: 'CSV', count: '245' }
  },
  {
    id: '6',
    type: 'establishment_created',
    title: 'Nouvel établissement créé',
    description: 'École Maternelle Arc-en-Ciel ajoutée',
    actor: { name: 'Jean Moussavou', role: 'Super Admin' },
    target: 'École Maternelle Arc-en-Ciel',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    metadata: { country: 'Gabon', type: 'maternelle' }
  },
  {
    id: '7',
    type: 'user_created',
    title: 'Inscription en masse',
    description: '45 enseignants importés',
    actor: { name: 'Paul Ondo', role: 'Directeur' },
    target: 'Lycée International de Libreville',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    metadata: { count: '45' }
  },
];

export default function ActivityLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.actor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || activity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return format(date, 'dd MMM yyyy', { locale: fr });
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              Journal d'Activité
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivi en temps réel des actions sur la plateforme
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une activité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type d'activité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="user_created">Utilisateurs</SelectItem>
                  <SelectItem value="establishment_created">Établissements</SelectItem>
                  <SelectItem value="settings_changed">Configuration</SelectItem>
                  <SelectItem value="role_assigned">Rôles</SelectItem>
                  <SelectItem value="document_uploaded">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activités Récentes</CardTitle>
            <CardDescription>
              {filteredActivities.length} activité{filteredActivities.length > 1 ? 's' : ''} trouvée{filteredActivities.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune activité trouvée
                </div>
              ) : (
                filteredActivities.map((activity) => {
                  const Icon = activityIcons[activity.type];
                  const colorClass = activityColors[activity.type];
                  
                  return (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{activity.title}</h4>
                          {activity.target && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.target}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{activity.actor.name}</span>
                            <span>•</span>
                            <span>{activity.actor.role}</span>
                          </span>
                          {activity.metadata && Object.entries(activity.metadata).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
