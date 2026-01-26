import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileSpreadsheet,
  FileJson,
  Building2,
  Users,
  Globe,
  MapPin,
  Layers,
  GraduationCap,
  Calendar,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExportConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  tables: string[];
  estimatedSize?: string;
}

const exportConfigs: ExportConfig[] = [
  {
    id: 'countries',
    name: 'Pays',
    description: 'Liste des pays configurés avec leurs paramètres',
    icon: Globe,
    tables: ['countries'],
  },
  {
    id: 'regions',
    name: 'Régions',
    description: 'Toutes les régions par pays',
    icon: MapPin,
    tables: ['regions'],
  },
  {
    id: 'groups',
    name: 'Groupes Scolaires',
    description: 'Groupements d\'établissements',
    icon: Layers,
    tables: ['establishment_groups'],
  },
  {
    id: 'establishments',
    name: 'Établissements',
    description: 'Tous les établissements avec leurs configurations',
    icon: Building2,
    tables: ['establishments'],
  },
  {
    id: 'users',
    name: 'Utilisateurs',
    description: 'Profils utilisateurs et rôles',
    icon: Users,
    tables: ['profiles', 'user_roles'],
  },
  {
    id: 'classes',
    name: 'Classes',
    description: 'Structure des classes par établissement',
    icon: GraduationCap,
    tables: ['classes', 'class_students', 'class_teachers'],
  },
  {
    id: 'calendar',
    name: 'Événements',
    description: 'Calendrier scolaire global',
    icon: Calendar,
    tables: ['school_events'],
  },
];

export default function GlobalExport() {
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch countries for filter
  const { data: countries } = useQuery({
    queryKey: ['export-countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('code, name, flag_emoji')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const toggleExport = (id: string) => {
    setSelectedExports(prev => 
      prev.includes(id) 
        ? prev.filter(e => e !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedExports.length === exportConfigs.length) {
      setSelectedExports([]);
    } else {
      setSelectedExports(exportConfigs.map(c => c.id));
    }
  };

  const handleExport = async () => {
    if (selectedExports.length === 0) {
      toast.error("Veuillez sélectionner au moins une catégorie à exporter");
      return;
    }

    setIsExporting(true);

    try {
      const exportData: Record<string, unknown[]> = {};

      for (const exportId of selectedExports) {
        const config = exportConfigs.find(c => c.id === exportId);
        if (!config) continue;

        for (const table of config.tables) {
          try {
            const { data, error } = await supabase
              .from(table as 'countries' | 'regions' | 'establishment_groups' | 'establishments' | 'profiles' | 'user_roles' | 'classes' | 'class_students' | 'class_teachers' | 'school_events')
              .select('*');
            
            if (error) {
              console.error(`Error fetching ${table}:`, error);
              continue;
            }
            exportData[table] = data || [];
          } catch (err) {
            console.error(`Error fetching ${table}:`, err);
          }
        }
      }

      // Generate file
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `idetude_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // Convert to CSV (simplified - one file per table)
        const csvParts: string[] = [];
        
        for (const [table, rows] of Object.entries(exportData)) {
          if (rows.length === 0) continue;
          
          csvParts.push(`\n=== ${table.toUpperCase()} ===\n`);
          
          const headers = Object.keys(rows[0] as object);
          csvParts.push(headers.join(','));
          
          for (const row of rows) {
            const values = headers.map(h => {
              const value = (row as Record<string, unknown>)[h];
              if (value === null || value === undefined) return '';
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return String(value);
            });
            csvParts.push(values.join(','));
          }
        }
        
        content = csvParts.join('\n');
        filename = `idetude_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Export ${exportFormat.toUpperCase()} généré avec succès`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Download className="h-8 w-8 text-primary" />
            Export de Données
          </h1>
          <p className="text-muted-foreground mt-1">
            Exportez les données de l'écosystème au format CSV ou JSON
          </p>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Data Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Données à exporter</CardTitle>
                    <CardDescription>
                      Sélectionnez les catégories de données
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    {selectedExports.length === exportConfigs.length ? 'Désélectionner tout' : 'Tout sélectionner'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exportConfigs.map((config) => {
                    const isSelected = selectedExports.includes(config.id);
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={config.id}
                        onClick={() => toggleExport(config.id)}
                        className={`
                          flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors
                          ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}
                        `}
                      >
                        <Checkbox 
                          checked={isSelected}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-medium">{config.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {config.description}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {config.tables.map(table => (
                              <Badge key={table} variant="outline" className="text-xs">
                                {table}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paramètres</CardTitle>
                <CardDescription>
                  Configuration de l'export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={exportFormat === 'csv' ? 'default' : 'outline'}
                      onClick={() => setExportFormat('csv')}
                      className="w-full"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      variant={exportFormat === 'json' ? 'default' : 'outline'}
                      onClick={() => setExportFormat('json')}
                      className="w-full"
                    >
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filtrer par pays</label>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les pays</SelectItem>
                      {countries?.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag_emoji} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Catégories sélectionnées</span>
                    <Badge variant="secondary">{selectedExports.length}</Badge>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleExport}
                    disabled={selectedExports.length === 0 || isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Export en cours...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Exporter ({exportFormat.toUpperCase()})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
