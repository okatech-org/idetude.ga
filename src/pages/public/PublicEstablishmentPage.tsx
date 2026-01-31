/**
 * Public Establishment Page V2 - Multi-Page Renderer
 * Renders public-facing websites with multi-page navigation
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";

// Import section components
import { HeroSection } from "@/components/public-builder/sections/HeroSection";
import { AboutSection } from "@/components/public-builder/sections/AboutSection";
import { StatsSection } from "@/components/public-builder/sections/StatsSection";
import { ContactSection } from "@/components/public-builder/sections/ContactSection";
import { TeamSection } from "@/components/public-builder/sections/TeamSection";
import { GallerySection } from "@/components/public-builder/sections/GallerySection";
import { TestimonialsSection } from "@/components/public-builder/sections/TestimonialsSection";
import { PartnersSection } from "@/components/public-builder/sections/PartnersSection";
import { NewsSection } from "@/components/public-builder/sections/NewsSection";
import { EventsSection } from "@/components/public-builder/sections/EventsSection";

import type { ColorPalette } from "@/components/public-builder/types";

interface Section {
    id: string;
    type: string;
    content: any;
    order: number;
    visible: boolean;
}

interface Page {
    id: string;
    slug: string;
    title: string;
    is_home: boolean;
    show_in_menu: boolean;
    menu_label?: string;
    sections: Section[];
    palette_override?: ColorPalette['colors'];
}

interface PageConfig {
    id: string;
    establishment_name: string;
    logo_url?: string;
    template_id: string;
    palette: ColorPalette['colors'];
    is_published: boolean;
    slug: string;
    pages: Page[];
    currentPage: Page | null;
}

export const PublicEstablishmentPage = () => {
    const { slug, pageSlug } = useParams<{ slug: string; pageSlug?: string }>();
    const navigate = useNavigate();
    const [config, setConfig] = useState<PageConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchPage(slug, pageSlug);
        }
    }, [slug, pageSlug]);

    const fetchPage = async (siteSlug: string, page?: string) => {
        try {
            let url = `/api/db/public-pages/${siteSlug}`;
            if (page) {
                url += `/${page}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setConfig(data);
            } else if (response.status === 404) {
                setError('Page non trouvée');
            } else {
                setError('Erreur lors du chargement');
            }
        } catch (err) {
            console.error('Failed to fetch page:', err);
            setError('Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    // Render section based on type
    const renderSection = (section: Section, palette: ColorPalette['colors']) => {
        const props = {
            content: section.content,
            palette,
            isEditing: false,
        };

        switch (section.type) {
            case 'hero':
                return <HeroSection key={section.id} {...props} />;
            case 'about':
                return <AboutSection key={section.id} {...props} />;
            case 'stats':
                return <StatsSection key={section.id} {...props} />;
            case 'contact':
                return <ContactSection key={section.id} {...props} />;
            case 'team':
                return <TeamSection key={section.id} {...props} />;
            case 'gallery':
                return <GallerySection key={section.id} {...props} />;
            case 'testimonials':
                return <TestimonialsSection key={section.id} {...props} />;
            case 'partners':
                return <PartnersSection key={section.id} {...props} />;
            case 'news':
                return <NewsSection key={section.id} {...props} />;
            case 'events':
                return <EventsSection key={section.id} {...props} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        {error || 'Page non trouvée'}
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    const currentPage = config.currentPage;
    const palette = currentPage?.palette_override || config.palette;
    const sections = currentPage?.sections
        ?.filter(s => s.visible)
        .sort((a, b) => a.order - b.order) || [];

    // Menu pages (visible in nav)
    const menuPages = config.pages?.filter(p => p.show_in_menu) || [];

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: palette.background,
                color: palette.text,
            }}
        >
            {/* Header with Navigation */}
            <header
                className="sticky top-0 z-50 backdrop-blur-md border-b"
                style={{
                    backgroundColor: `${palette.background}ee`,
                    borderColor: `${palette.muted}30`,
                }}
            >
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo + Name */}
                    <Link
                        to={`/etablissement/${config.slug}`}
                        className="flex items-center gap-3"
                    >
                        {config.logo_url && (
                            <img
                                src={config.logo_url}
                                alt={config.establishment_name}
                                className="h-10 w-auto"
                            />
                        )}
                        <span
                            className="font-semibold text-lg"
                            style={{ color: palette.text }}
                        >
                            {config.establishment_name}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {menuPages.map((page) => (
                            <Link
                                key={page.id}
                                to={page.is_home
                                    ? `/etablissement/${config.slug}`
                                    : `/etablissement/${config.slug}/${page.slug}`
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage?.id === page.id
                                    ? 'text-primary'
                                    : 'hover:bg-muted/50'
                                    }`}
                                style={{
                                    color: currentPage?.id === page.id ? palette.primary : palette.text,
                                }}
                            >
                                {page.menu_label || page.title}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-muted/50"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav
                        className="md:hidden border-t py-4 px-4 space-y-1"
                        style={{ borderColor: `${palette.muted}30` }}
                    >
                        {menuPages.map((page) => (
                            <Link
                                key={page.id}
                                to={page.is_home
                                    ? `/etablissement/${config.slug}`
                                    : `/etablissement/${config.slug}/${page.slug}`
                                }
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage?.id === page.id
                                    ? ''
                                    : 'hover:bg-muted/50'
                                    }`}
                                style={{
                                    color: currentPage?.id === page.id ? palette.primary : palette.text,
                                    backgroundColor: currentPage?.id === page.id ? `${palette.primary}15` : undefined,
                                }}
                            >
                                {page.menu_label || page.title}
                            </Link>
                        ))}
                    </nav>
                )}
            </header>

            {/* Page Content */}
            <main>
                {sections.length > 0 ? (
                    sections.map(section => renderSection(section, palette))
                ) : (
                    <div className="container mx-auto px-4 py-24 text-center">
                        <p className="text-muted-foreground">
                            Cette page est en cours de construction.
                        </p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer
                className="py-8 border-t"
                style={{
                    backgroundColor: `${palette.primary}08`,
                    borderColor: `${palette.muted}30`,
                }}
            >
                <div className="container mx-auto px-4">
                    {/* Footer Navigation */}
                    {menuPages.length > 1 && (
                        <nav className="flex flex-wrap justify-center gap-4 mb-6">
                            {menuPages.map((page) => (
                                <Link
                                    key={page.id}
                                    to={page.is_home
                                        ? `/etablissement/${config.slug}`
                                        : `/etablissement/${config.slug}/${page.slug}`
                                    }
                                    className="text-sm hover:underline"
                                    style={{ color: palette.muted }}
                                >
                                    {page.menu_label || page.title}
                                </Link>
                            ))}
                        </nav>
                    )}

                    <div className="text-center">
                        <p
                            className="text-sm"
                            style={{ color: palette.muted }}
                        >
                            © {new Date().getFullYear()} {config.establishment_name}. Tous droits réservés.
                        </p>
                        <p
                            className="text-xs mt-2"
                            style={{ color: palette.muted }}
                        >
                            Propulsé par{' '}
                            <a
                                href="/"
                                className="hover:underline"
                                style={{ color: palette.primary }}
                            >
                                iDETUDE
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicEstablishmentPage;
