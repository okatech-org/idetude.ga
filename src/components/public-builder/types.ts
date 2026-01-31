/**
 * Public Page Section Types and Interfaces
 */

export interface ColorPalette {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        muted: string;
    };
}

export interface Template {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    defaultSections: SectionType[];
}

export type SectionType =
    | 'hero'
    | 'about'
    | 'stats'
    | 'team'
    | 'news'
    | 'gallery'
    | 'testimonials'
    | 'contact'
    | 'partners'
    | 'events';

export interface SectionBase {
    id: string;
    type: SectionType;
    order: number;
    visible: boolean;
    style?: Record<string, unknown>;
}

export interface HeroContent {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaLink?: string;
    overlay?: boolean;
}

export interface AboutContent {
    title: string;
    description: string;
    image?: string;
    mission?: string;
    vision?: string;
    values?: string[];
}

export interface StatsContent {
    title?: string;
    items: Array<{
        value: string;
        label: string;
        icon?: string;
    }>;
}

export interface TeamContent {
    title?: string;
    subtitle?: string;
    members: Array<{
        name: string;
        role: string;
        image?: string;
        bio?: string;
    }>;
}

export interface NewsContent {
    title?: string;
    maxItems?: number;
    showMore?: boolean;
}

export interface GalleryContent {
    title?: string;
    images: Array<{
        url: string;
        caption?: string;
    }>;
    layout?: 'grid' | 'masonry' | 'carousel';
}

export interface TestimonialsContent {
    title?: string;
    items: Array<{
        quote: string;
        author: string;
        role?: string;
        avatar?: string;
    }>;
}

export interface ContactContent {
    title?: string;
    subtitle?: string;
    email?: string;
    phone?: string;
    address?: string;
    showMap?: boolean;
    mapCoordinates?: { lat: number; lng: number };
    showForm?: boolean;
}

export interface PartnersContent {
    title?: string;
    logos: Array<{
        name: string;
        image: string;
        url?: string;
    }>;
}

export interface EventsContent {
    title?: string;
    maxItems?: number;
    showPast?: boolean;
}

export type SectionContent =
    | HeroContent
    | AboutContent
    | StatsContent
    | TeamContent
    | NewsContent
    | GalleryContent
    | TestimonialsContent
    | ContactContent
    | PartnersContent
    | EventsContent;

export interface Section extends SectionBase {
    content: SectionContent;
}

export interface PublicPageConfig {
    id: string;
    establishment_id: string;
    establishment_name: string;
    logo_url?: string;
    template_id: string;
    palette: ColorPalette['colors'];
    sections_order: string[];
    meta: {
        title?: string;
        description?: string;
        keywords?: string[];
        favicon?: string;
        og_image?: string;
    };
    is_published: boolean;
    published_at?: string;
    slug?: string;
    sections: Section[];
    created_at: string;
    updated_at: string;
}

// Default content for new sections
export const DEFAULT_SECTION_CONTENT: Record<SectionType, SectionContent> = {
    hero: {
        title: 'Bienvenue à notre établissement',
        subtitle: 'Excellence académique et épanouissement personnel',
        ctaText: 'Découvrir',
        ctaLink: '#about',
        overlay: true,
    },
    about: {
        title: 'À propos',
        description: 'Notre établissement s\'engage à fournir une éducation de qualité.',
        mission: 'Former les leaders de demain',
        vision: 'Un monde où chaque élève réalise son potentiel',
        values: ['Excellence', 'Intégrité', 'Innovation', 'Respect'],
    },
    stats: {
        title: 'En chiffres',
        items: [
            { value: '500+', label: 'Élèves' },
            { value: '50', label: 'Enseignants' },
            { value: '98%', label: 'Réussite' },
            { value: '25', label: 'Années d\'expérience' },
        ],
    },
    team: {
        title: 'Notre équipe',
        subtitle: 'Des professionnels dévoués',
        members: [],
    },
    news: {
        title: 'Actualités',
        maxItems: 3,
        showMore: true,
    },
    gallery: {
        title: 'Galerie',
        images: [],
        layout: 'grid',
    },
    testimonials: {
        title: 'Témoignages',
        items: [],
    },
    contact: {
        title: 'Contact',
        subtitle: 'Contactez-nous',
        showForm: true,
        showMap: false,
    },
    partners: {
        title: 'Nos partenaires',
        logos: [],
    },
    events: {
        title: 'Événements',
        maxItems: 5,
        showPast: false,
    },
};

// Section metadata for the editor
export const SECTION_METADATA: Record<SectionType, { label: string; icon: string; description: string }> = {
    hero: { label: 'Bannière Hero', icon: '🎨', description: 'Section d\'en-tête avec image de fond' },
    about: { label: 'À propos', icon: '📖', description: 'Présentation de l\'établissement' },
    stats: { label: 'Statistiques', icon: '📊', description: 'Chiffres clés animés' },
    team: { label: 'Équipe', icon: '👥', description: 'Membres de la direction' },
    news: { label: 'Actualités', icon: '📰', description: 'Dernières nouvelles' },
    gallery: { label: 'Galerie', icon: '🖼️', description: 'Photos de l\'établissement' },
    testimonials: { label: 'Témoignages', icon: '💬', description: 'Avis des parents/élèves' },
    contact: { label: 'Contact', icon: '📧', description: 'Formulaire et coordonnées' },
    partners: { label: 'Partenaires', icon: '🤝', description: 'Logos des partenaires' },
    events: { label: 'Événements', icon: '📅', description: 'Calendrier d\'événements' },
};
