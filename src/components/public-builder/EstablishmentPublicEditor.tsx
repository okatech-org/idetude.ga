/**
 * EstablishmentPublicEditor V2 - Multi-Page Visual Editor
 * Enhanced with multi-page support, image configuration, and advanced templates
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Eye,
    Settings,
    Palette,
    Layout,
    Save,
    Globe,
    EyeOff,
    GripVertical,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    ExternalLink,
    Smartphone,
    Monitor,
    FileText,
    Image as ImageIcon,
    Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import section components
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { StatsSection } from "./sections/StatsSection";
import { ContactSection } from "./sections/ContactSection";
import { TeamSection } from "./sections/TeamSection";
import { GallerySection } from "./sections/GallerySection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { PartnersSection } from "./sections/PartnersSection";
import { NewsSection } from "./sections/NewsSection";
import { EventsSection } from "./sections/EventsSection";

// Import new components
import { ImageUploader } from "./ImageUploader";
import { MediaLibrary } from "./MediaLibrary";

// Import types
import type {
    Section,
    SectionType,
    ColorPalette,
    SectionContent,
} from "./types";
import { DEFAULT_SECTION_CONTENT, SECTION_METADATA } from "./types";

// Enhanced types for multi-page
interface Page {
    id: string;
    slug: string;
    title: string;
    is_home: boolean;
    show_in_menu: boolean;
    menu_label?: string;
    order_index: number;
    palette_override?: ColorPalette['colors'];
    sections: Section[];
}

interface Template {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    pages: { slug: string; title: string; is_home: boolean; sections: SectionType[] }[];
    defaultPalette: string | null;
    isCustom?: boolean;
}

interface PublicPageConfig {
    id: string;
    establishment_id: string;
    establishment_name: string;
    logo_url?: string;
    template_id: string;
    palette: ColorPalette['colors'];
    is_published: boolean;
    published_at?: string;
    slug?: string;
    pages: Page[];
}

interface EditorProps {
    establishmentId: string;
    establishmentName: string;
}

export const EstablishmentPublicEditor = ({ establishmentId, establishmentName }: EditorProps) => {
    // State
    const [config, setConfig] = useState<PublicPageConfig | null>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isEditing, setIsEditing] = useState(true);

    // Modals
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showPaletteModal, setShowPaletteModal] = useState(false);
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [showAddPageModal, setShowAddPageModal] = useState(false);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [showPageSettings, setShowPageSettings] = useState(false);

    // Templates & Palettes - Initialize with defaults
    const [templates, setTemplates] = useState<Template[]>([
        {
            id: 'classique',
            name: 'Classique',
            description: 'Design formel et académique',
            thumbnail: '',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'about', 'stats'] as SectionType[] },
                { slug: 'a-propos', title: 'À propos', is_home: false, sections: ['about'] as SectionType[] },
                { slug: 'contact', title: 'Contact', is_home: false, sections: ['contact'] as SectionType[] },
            ],
            defaultPalette: 'academique',
        },
        {
            id: 'moderne',
            name: 'Moderne',
            description: 'Design épuré et contemporain',
            thumbnail: '',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'stats'] as SectionType[] },
                { slug: 'decouvrir', title: 'Découvrir', is_home: false, sections: ['about', 'gallery'] as SectionType[] },
                { slug: 'temoignages', title: 'Témoignages', is_home: false, sections: ['testimonials'] as SectionType[] },
                { slug: 'contact', title: 'Contact', is_home: false, sections: ['contact'] as SectionType[] },
            ],
            defaultPalette: 'ocean',
        },
        {
            id: 'premium',
            name: 'Premium',
            description: 'Design luxueux noir et or',
            thumbnail: '',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'about'] as SectionType[] },
                { slug: 'equipe', title: 'Notre Équipe', is_home: false, sections: ['team'] as SectionType[] },
                { slug: 'statistiques', title: 'En Chiffres', is_home: false, sections: ['stats'] as SectionType[] },
                { slug: 'contact', title: 'Contact', is_home: false, sections: ['contact'] as SectionType[] },
            ],
            defaultPalette: 'monochrome',
        },
        {
            id: 'complet',
            name: 'Complet',
            description: 'Toutes les pages et sections',
            thumbnail: '',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'about', 'stats'] as SectionType[] },
                { slug: 'equipe', title: 'Équipe', is_home: false, sections: ['team'] as SectionType[] },
                { slug: 'galerie', title: 'Galerie', is_home: false, sections: ['gallery'] as SectionType[] },
                { slug: 'actualites', title: 'Actualités', is_home: false, sections: ['news', 'events'] as SectionType[] },
                { slug: 'temoignages', title: 'Témoignages', is_home: false, sections: ['testimonials'] as SectionType[] },
                { slug: 'partenaires', title: 'Partenaires', is_home: false, sections: ['partners'] as SectionType[] },
                { slug: 'contact', title: 'Contact', is_home: false, sections: ['contact'] as SectionType[] },
            ],
            defaultPalette: 'academique',
        },
        {
            id: 'personnalise',
            name: 'Personnalisé',
            description: 'Créez de zéro - Totalement libre',
            thumbnail: '',
            pages: [],
            defaultPalette: null,
            isCustom: true,
        },
    ]);
    const [palettes, setPalettes] = useState<ColorPalette[]>([
        {
            id: 'ocean',
            name: '🌊 Océan',
            colors: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#f59e0b', background: '#f0f9ff', text: '#0c4a6e', muted: '#7dd3fc' },
        },
        {
            id: 'foret',
            name: '🌳 Forêt',
            colors: { primary: '#16a34a', secondary: '#84cc16', accent: '#eab308', background: '#f0fdf4', text: '#14532d', muted: '#86efac' },
        },
        {
            id: 'couchant',
            name: '🌅 Coucher de soleil',
            colors: { primary: '#f97316', secondary: '#ec4899', accent: '#a855f7', background: '#fff7ed', text: '#7c2d12', muted: '#fdba74' },
        },
        {
            id: 'academique',
            name: '🎓 Académique',
            colors: { primary: '#1e40af', secondary: '#3730a3', accent: '#dc2626', background: '#f8fafc', text: '#1e293b', muted: '#94a3b8' },
        },
        {
            id: 'monochrome',
            name: '⚫ Monochrome',
            colors: { primary: '#18181b', secondary: '#3f3f46', accent: '#fbbf24', background: '#fafafa', text: '#09090b', muted: '#a1a1aa' },
        },
        {
            id: 'lavande',
            name: '💜 Lavande',
            colors: { primary: '#7c3aed', secondary: '#a855f7', accent: '#f472b6', background: '#faf5ff', text: '#3b0764', muted: '#c4b5fd' },
        },
    ]);

    // New page form
    const [newPageForm, setNewPageForm] = useState({ slug: '', title: '' });

    // Default palette
    const defaultPalette = {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1e293b',
        muted: '#94a3b8',
    };

    // Current page
    const currentPage = pages.find(p => p.id === currentPageId);
    const currentSections = currentPage?.sections || [];

    // Fetch data on mount
    useEffect(() => {
        fetchConfig();
        fetchTemplates();
        fetchPalettes();
    }, [establishmentId]);

    const fetchConfig = async () => {
        try {
            const response = await fetch(`/api/db/establishments/${establishmentId}/public-config`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setConfig(data);
                    if (data.pages && data.pages.length > 0) {
                        setPages(data.pages);
                        // Select home page by default
                        const homePage = data.pages.find((p: Page) => p.is_home);
                        setCurrentPageId(homePage?.id || data.pages[0].id);
                    }
                } else {
                    // Show template selector for new configs
                    setShowTemplateModal(true);
                }
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
            toast.error('Erreur lors du chargement');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/db/public-page-templates');
            if (response.ok) {
                setTemplates(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const fetchPalettes = async () => {
        try {
            const response = await fetch('/api/db/color-palettes');
            if (response.ok) {
                setPalettes(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch palettes:', error);
        }
    };

    const handleApplyTemplate = async (template: Template) => {
        // Create config if needed
        let configId = config?.id;

        if (!configId) {
            try {
                const slug = establishmentName.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');

                const response = await fetch(`/api/db/establishments/${establishmentId}/public-config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template_id: template.id,
                        palette: template.defaultPalette
                            ? palettes.find(p => p.id === template.defaultPalette)?.colors
                            : defaultPalette,
                        slug,
                    }),
                });

                if (!response.ok) throw new Error('Failed to create config');
                const newConfig = await response.json();
                configId = newConfig.id;
                setConfig(newConfig);
            } catch (error) {
                toast.error('Erreur lors de la création');
                return;
            }
        }

        // Create pages from template
        if (template.isCustom) {
            // Custom template - create empty home page
            const newPages: Page[] = [{
                id: `page-${Date.now()}`,
                slug: 'accueil',
                title: 'Accueil',
                is_home: true,
                show_in_menu: true,
                order_index: 0,
                sections: [],
            }];
            setPages(newPages);
            setCurrentPageId(newPages[0].id);
        } else {
            // Create pages with sections
            const newPages: Page[] = template.pages.map((p, idx) => ({
                id: `page-${Date.now()}-${idx}`,
                slug: p.slug,
                title: p.title,
                is_home: p.is_home,
                show_in_menu: true,
                order_index: idx,
                sections: p.sections.map((type, sIdx) => ({
                    id: `section-${Date.now()}-${idx}-${sIdx}`,
                    type,
                    order: sIdx,
                    visible: true,
                    content: DEFAULT_SECTION_CONTENT[type],
                })),
            }));

            setPages(newPages);
            const homePage = newPages.find(p => p.is_home);
            setCurrentPageId(homePage?.id || newPages[0]?.id);
        }

        // Apply palette
        if (template.defaultPalette) {
            const palette = palettes.find(p => p.id === template.defaultPalette);
            if (palette && config) {
                setConfig({ ...config, palette: palette.colors, template_id: template.id });
            }
        }

        setHasChanges(true);
        setShowTemplateModal(false);
        toast.success(`Template "${template.name}" appliqué`);
    };

    const handleSave = async () => {
        if (!config) return;

        setIsSaving(true);
        try {
            // Save config
            const configResponse = await fetch(`/api/db/establishments/${establishmentId}/public-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: config.template_id,
                    palette: config.palette,
                    is_published: config.is_published,
                    slug: config.slug || establishmentName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                }),
            });

            if (!configResponse.ok) throw new Error('Failed to save config');
            const savedConfig = await configResponse.json();

            // Save pages and sections
            for (const page of pages) {
                // Create or update page
                let pageId = page.id;
                if (page.id.startsWith('page-')) {
                    // New page
                    const pageResponse = await fetch(`/api/db/public-config/${savedConfig.id}/pages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            slug: page.slug,
                            title: page.title,
                            is_home: page.is_home,
                            show_in_menu: page.show_in_menu,
                            menu_label: page.menu_label,
                            order_index: page.order_index,
                            palette_override: page.palette_override,
                        }),
                    });
                    if (pageResponse.ok) {
                        const savedPage = await pageResponse.json();
                        pageId = savedPage.id;
                    }
                } else {
                    // Update existing page
                    await fetch(`/api/db/pages/${page.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            slug: page.slug,
                            title: page.title,
                            is_home: page.is_home,
                            show_in_menu: page.show_in_menu,
                            menu_label: page.menu_label,
                            order_index: page.order_index,
                            palette_override: page.palette_override,
                        }),
                    });
                }

                // Save sections for this page
                for (const section of page.sections) {
                    if (section.id.startsWith('section-')) {
                        // New section
                        await fetch(`/api/db/pages/${pageId}/sections`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                section_type: section.type,
                                content: section.content,
                                order_index: section.order,
                                is_visible: section.visible,
                            }),
                        });
                    } else {
                        // Update existing section
                        await fetch(`/api/db/sections/${section.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: section.content,
                                order_index: section.order,
                                is_visible: section.visible,
                            }),
                        });
                    }
                }
            }

            toast.success('Configuration sauvegardée !');
            setHasChanges(false);
            fetchConfig(); // Refresh
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!config) return;

        await handleSave();

        try {
            await fetch(`/api/db/establishments/${establishmentId}/public-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_published: true }),
            });

            toast.success('Page publiée avec succès !');
            setConfig({ ...config, is_published: true });
        } catch (error) {
            toast.error('Erreur lors de la publication');
        }
    };

    const handleAddPage = () => {
        if (!newPageForm.slug || !newPageForm.title) {
            toast.error('Remplissez tous les champs');
            return;
        }

        const slug = newPageForm.slug.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-');

        const newPage: Page = {
            id: `page-${Date.now()}`,
            slug,
            title: newPageForm.title,
            is_home: pages.length === 0,
            show_in_menu: true,
            order_index: pages.length,
            sections: [],
        };

        setPages([...pages, newPage]);
        setCurrentPageId(newPage.id);
        setNewPageForm({ slug: '', title: '' });
        setShowAddPageModal(false);
        setHasChanges(true);
        toast.success('Page ajoutée');
    };

    const handleDeletePage = (pageId: string) => {
        if (pages.length <= 1) {
            toast.error('Impossible de supprimer la dernière page');
            return;
        }

        const updated = pages.filter(p => p.id !== pageId);
        // Ensure there's still a home page
        if (!updated.some(p => p.is_home)) {
            updated[0].is_home = true;
        }
        setPages(updated);

        if (currentPageId === pageId) {
            setCurrentPageId(updated[0].id);
        }
        setHasChanges(true);
    };

    const handleSectionContentChange = (sectionId: string, content: SectionContent) => {
        setPages(prev => prev.map(page =>
            page.id === currentPageId
                ? {
                    ...page,
                    sections: page.sections.map(s =>
                        s.id === sectionId ? { ...s, content } : s
                    ),
                }
                : page
        ));
        setHasChanges(true);
    };

    const handleAddSection = (type: SectionType) => {
        // If no pages exist, create a default home page first
        if (pages.length === 0 || !currentPageId) {
            const defaultPage: Page = {
                id: `page-${Date.now()}`,
                slug: 'accueil',
                title: 'Accueil',
                is_home: true,
                show_in_menu: true,
                order_index: 0,
                sections: [{
                    id: `section-${Date.now()}`,
                    type,
                    order: 0,
                    visible: true,
                    content: DEFAULT_SECTION_CONTENT[type],
                }],
            };
            setPages([defaultPage]);
            setCurrentPageId(defaultPage.id);
            setHasChanges(true);
            setShowAddSectionModal(false);
            return;
        }

        const newSection: Section = {
            id: `section-${Date.now()}`,
            type,
            order: currentSections.length,
            visible: true,
            content: DEFAULT_SECTION_CONTENT[type],
        };

        setPages(prev => prev.map(page =>
            page.id === currentPageId
                ? { ...page, sections: [...page.sections, newSection] }
                : page
        ));
        setHasChanges(true);
        setShowAddSectionModal(false);
    };

    const handleRemoveSection = (sectionId: string) => {
        setPages(prev => prev.map(page =>
            page.id === currentPageId
                ? { ...page, sections: page.sections.filter(s => s.id !== sectionId) }
                : page
        ));
        setHasChanges(true);
    };

    const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
        const sections = [...currentSections];
        const index = sections.findIndex(s => s.id === sectionId);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === sections.length - 1)
        ) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
        sections.forEach((s, i) => s.order = i);

        setPages(prev => prev.map(page =>
            page.id === currentPageId
                ? { ...page, sections }
                : page
        ));
        setHasChanges(true);
    };

    const handleApplyPalette = (palette: ColorPalette) => {
        if (config) {
            setConfig({ ...config, palette: palette.colors });
            setHasChanges(true);
        }
        setShowPaletteModal(false);
        toast.success(`Palette "${palette.name}" appliquée`);
    };

    const currentPalette = currentPage?.palette_override || config?.palette || defaultPalette;

    // Render section
    const renderSection = (section: Section) => {
        const props = {
            content: section.content as any,
            palette: currentPalette,
            isEditing,
            onContentChange: (content: SectionContent) => handleSectionContentChange(section.id, content),
        };

        switch (section.type) {
            case 'hero':
                return <HeroSection {...props} />;
            case 'about':
                return <AboutSection {...props} />;
            case 'stats':
                return <StatsSection {...props} />;
            case 'contact':
                return <ContactSection {...props} />;
            case 'team':
                return <TeamSection {...props} />;
            case 'gallery':
                return <GallerySection {...props} />;
            case 'testimonials':
                return <TestimonialsSection {...props} />;
            case 'partners':
                return <PartnersSection {...props} />;
            case 'news':
                return <NewsSection {...props} />;
            case 'events':
                return <EventsSection {...props} />;
            default:
                return (
                    <div className="p-8 text-center text-muted-foreground">
                        Section "{section.type}" (type inconnu)
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Éditeur Multi-Pages</h2>
                    {hasChanges && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600">
                            Non sauvegardé
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Preview mode */}
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
                        <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-background shadow' : ''}`}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-background shadow' : ''}`}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <GlassButton
                        variant={isEditing ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <Eye className="w-4 h-4 mr-1" /> : <Settings className="w-4 h-4 mr-1" />}
                        {isEditing ? 'Aperçu' : 'Éditer'}
                    </GlassButton>

                    <GlassButton variant="outline" size="sm" onClick={() => setShowTemplateModal(true)}>
                        <Layout className="w-4 h-4 mr-1" />
                        Template
                    </GlassButton>

                    <GlassButton variant="outline" size="sm" onClick={() => setShowPaletteModal(true)}>
                        <Palette className="w-4 h-4 mr-1" />
                        Couleurs
                    </GlassButton>

                    <GlassButton variant="outline" size="sm" onClick={() => setShowMediaLibrary(true)}>
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Médias
                    </GlassButton>

                    <GlassButton
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                    >
                        <Save className="w-4 h-4 mr-1" />
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </GlassButton>

                    {config?.is_published ? (
                        <GlassButton variant="outline" size="sm">
                            <EyeOff className="w-4 h-4 mr-1" />
                            Dépublier
                        </GlassButton>
                    ) : (
                        <GlassButton variant="primary" size="sm" onClick={handlePublish}>
                            <Globe className="w-4 h-4 mr-1" />
                            Publier
                        </GlassButton>
                    )}

                    {config?.is_published && config?.slug && (
                        <a href={`/etablissement/${config.slug}`} target="_blank" rel="noopener noreferrer">
                            <GlassButton variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4" />
                            </GlassButton>
                        </a>
                    )}
                </div>
            </div>

            {/* Page Tabs */}
            <div className="flex items-center gap-2 p-2 bg-muted/50 border-b overflow-x-auto">
                {pages.map((page) => (
                    <button
                        key={page.id}
                        onClick={() => setCurrentPageId(page.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${currentPageId === page.id
                            ? 'bg-background shadow text-primary'
                            : 'hover:bg-background/50'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        {page.title}
                        {page.is_home && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">Accueil</span>
                        )}
                    </button>
                ))}
                <button
                    onClick={() => setShowAddPageModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm hover:bg-background/50 text-muted-foreground"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter
                </button>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sections Panel */}
                <div className="w-56 border-r bg-muted/30 overflow-y-auto p-3 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">Sections</h3>
                        <button
                            onClick={() => setShowAddSectionModal(true)}
                            className="p-1 rounded hover:bg-muted"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {currentSections.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune section</p>
                            <p className="text-xs mt-1">Cliquez sur + pour ajouter</p>
                        </div>
                    ) : (
                        currentSections.map((section, index) => (
                            <div
                                key={section.id}
                                className={`p-2 rounded-lg border cursor-pointer transition-all text-sm ${selectedSection === section.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-transparent bg-background hover:border-muted-foreground/20'
                                    } ${!section.visible ? 'opacity-50' : ''}`}
                                onClick={() => setSelectedSection(section.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                                    <span>{SECTION_METADATA[section.type]?.icon || '📄'}</span>
                                    <span className="flex-1 truncate">
                                        {SECTION_METADATA[section.type]?.label || section.type}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 mt-1.5 ml-5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMoveSection(section.id, 'up'); }}
                                        disabled={index === 0}
                                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMoveSection(section.id, 'down'); }}
                                        disabled={index === currentSections.length - 1}
                                        className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveSection(section.id); }}
                                        className="p-0.5 rounded hover:bg-destructive/10 text-destructive ml-auto"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Page Settings */}
                    <div className="pt-4 mt-4 border-t">
                        <GlassButton
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setShowPageSettings(true)}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Paramètres page
                        </GlassButton>

                        {!currentPage?.is_home && (
                            <GlassButton
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 text-destructive hover:bg-destructive/10"
                                onClick={() => currentPageId && handleDeletePage(currentPageId)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer page
                            </GlassButton>
                        )}
                    </div>
                </div>

                {/* Preview Canvas */}
                <div
                    className="flex-1 overflow-y-auto"
                    style={{ backgroundColor: currentPalette.background }}
                >
                    <div
                        className={`mx-auto transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-none'
                            }`}
                    >
                        {currentSections
                            .filter(s => s.visible)
                            .sort((a, b) => a.order - b.order)
                            .map(section => (
                                <div
                                    key={section.id}
                                    className={`relative ${selectedSection === section.id && isEditing
                                        ? 'ring-2 ring-primary ring-offset-2'
                                        : ''
                                        }`}
                                    onClick={() => setSelectedSection(section.id)}
                                >
                                    {renderSection(section)}
                                </div>
                            ))
                        }

                        {currentSections.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                                <Layout className="w-16 h-16 mb-4 opacity-30" />
                                <p className="text-lg font-medium">Page vide</p>
                                <p className="text-sm mt-1">Ajoutez des sections pour construire votre page</p>
                                <GlassButton
                                    variant="primary"
                                    className="mt-4"
                                    onClick={() => setShowAddSectionModal(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter une section
                                </GlassButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Template Modal */}
            <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Choisir un template</DialogTitle>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
                        {templates.map(template => (
                            <GlassCard
                                key={template.id}
                                className={`p-3 cursor-pointer hover:border-primary transition-colors ${config?.template_id === template.id ? 'border-primary' : ''
                                    } ${template.isCustom ? 'border-dashed' : ''}`}
                                onClick={() => handleApplyTemplate(template)}
                            >
                                <div className="aspect-video bg-muted rounded-lg mb-2 flex items-center justify-center">
                                    {template.isCustom ? (
                                        <Sparkles className="w-8 h-8 text-primary" />
                                    ) : (
                                        <Layout className="w-8 h-8 text-muted-foreground" />
                                    )}
                                </div>
                                <h4 className="font-semibold text-sm">{template.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                                <p className="text-xs text-primary mt-2">{template.pages.length} pages</p>
                            </GlassCard>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Palette Modal */}
            <Dialog open={showPaletteModal} onOpenChange={setShowPaletteModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Choisir une palette</DialogTitle>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-3 py-4">
                        {palettes.map(palette => (
                            <GlassCard
                                key={palette.id}
                                className="p-3 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => handleApplyPalette(palette)}
                            >
                                <h4 className="font-semibold text-sm mb-2">{palette.name}</h4>
                                <div className="flex gap-1.5">
                                    {Object.values(palette.colors).map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-full border"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Section Modal */}
            <Dialog open={showAddSectionModal} onOpenChange={setShowAddSectionModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ajouter une section</DialogTitle>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-2 py-4">
                        {(Object.keys(SECTION_METADATA) as SectionType[]).map(type => (
                            <GlassCard
                                key={type}
                                className="p-3 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => handleAddSection(type)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{SECTION_METADATA[type].icon}</span>
                                    <div>
                                        <h4 className="font-semibold text-sm">{SECTION_METADATA[type].label}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {SECTION_METADATA[type].description}
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Page Modal */}
            <Dialog open={showAddPageModal} onOpenChange={setShowAddPageModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle page</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Titre de la page</Label>
                            <Input
                                value={newPageForm.title}
                                onChange={(e) => setNewPageForm({ ...newPageForm, title: e.target.value })}
                                placeholder="Ex: À propos"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug (URL)</Label>
                            <Input
                                value={newPageForm.slug}
                                onChange={(e) => setNewPageForm({ ...newPageForm, slug: e.target.value })}
                                placeholder="Ex: a-propos"
                            />
                            <p className="text-xs text-muted-foreground">
                                URL: /etablissement/{config?.slug || 'votre-etablissement'}/{newPageForm.slug || 'slug'}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <GlassButton variant="outline" onClick={() => setShowAddPageModal(false)}>
                            Annuler
                        </GlassButton>
                        <GlassButton variant="primary" onClick={handleAddPage}>
                            Créer la page
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Media Library */}
            <MediaLibrary
                isOpen={showMediaLibrary}
                onClose={() => setShowMediaLibrary(false)}
                onSelect={(url) => {
                    // Copy URL to clipboard for now
                    navigator.clipboard.writeText(url);
                    toast.success('URL copiée');
                }}
                establishmentId={establishmentId}
            />
        </div>
    );
};

export default EstablishmentPublicEditor;
