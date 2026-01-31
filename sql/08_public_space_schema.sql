-- =====================================================
-- ESTABLISHMENT PUBLIC SPACE - SCHEMA
-- =====================================================
-- Tables pour la personnalisation des pages publiques
-- des établissements

-- Configuration principale de la page publique
CREATE TABLE IF NOT EXISTS establishment_public_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    
    -- Template et style
    template_id VARCHAR(50) DEFAULT 'classique',
    palette JSONB DEFAULT '{
        "primary": "#3b82f6",
        "secondary": "#64748b",
        "accent": "#f59e0b",
        "background": "#ffffff",
        "text": "#1e293b",
        "muted": "#94a3b8"
    }'::jsonb,
    
    -- Configuration des sections (ordre et visibilité)
    sections_order JSONB DEFAULT '["hero", "about", "stats", "news", "team", "contact"]'::jsonb,
    
    -- Métadonnées SEO
    meta JSONB DEFAULT '{
        "title": null,
        "description": null,
        "keywords": [],
        "favicon": null,
        "og_image": null
    }'::jsonb,
    
    -- État de publication
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Slug personnalisé pour l'URL
    slug VARCHAR(100) UNIQUE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(establishment_id)
);

-- Sections individuelles de la page
CREATE TABLE IF NOT EXISTS public_page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES establishment_public_config(id) ON DELETE CASCADE,
    
    -- Type de section
    section_type VARCHAR(50) NOT NULL,
    -- Types: hero, about, stats, news, team, gallery, testimonials, contact, partners, events
    
    -- Contenu de la section (structure dépend du type)
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Position et visibilité
    order_index INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    
    -- Style personnalisé (optionnel)
    custom_style JSONB,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Médias uploadés pour les pages publiques
CREATE TABLE IF NOT EXISTS establishment_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    
    -- Informations du fichier
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size INTEGER,
    
    -- URL du fichier (Cloud Storage ou local)
    url TEXT NOT NULL,
    
    -- Catégorisation
    category VARCHAR(50) DEFAULT 'general',
    -- Categories: hero, gallery, team, logo, favicon, og_image
    
    -- Métadonnées
    alt_text VARCHAR(255),
    caption TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_public_config_establishment 
    ON establishment_public_config(establishment_id);
CREATE INDEX IF NOT EXISTS idx_public_config_slug 
    ON establishment_public_config(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_sections_config 
    ON public_page_sections(config_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_order 
    ON public_page_sections(config_id, order_index);
CREATE INDEX IF NOT EXISTS idx_establishment_media_establishment 
    ON establishment_media(establishment_id);
CREATE INDEX IF NOT EXISTS idx_establishment_media_category 
    ON establishment_media(establishment_id, category);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_public_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_public_config_timestamp 
    ON establishment_public_config;
CREATE TRIGGER trigger_update_public_config_timestamp
    BEFORE UPDATE ON establishment_public_config
    FOR EACH ROW
    EXECUTE FUNCTION update_public_config_timestamp();

DROP TRIGGER IF EXISTS trigger_update_page_sections_timestamp 
    ON public_page_sections;
CREATE TRIGGER trigger_update_page_sections_timestamp
    BEFORE UPDATE ON public_page_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_public_config_timestamp();

-- Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_establishment_slug(est_name TEXT, est_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Nettoyer le nom pour créer le slug
    base_slug := lower(regexp_replace(est_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Vérifier l'unicité et ajouter un suffixe si nécessaire
    WHILE EXISTS (
        SELECT 1 FROM establishment_public_config 
        WHERE slug = final_slug AND establishment_id != est_id
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Vue pour faciliter la récupération complète d'une config
CREATE OR REPLACE VIEW v_establishment_public_page AS
SELECT 
    c.*,
    e.name as establishment_name,
    e.logo_url,
    COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'type', s.section_type,
                'content', s.content,
                'order', s.order_index,
                'visible', s.is_visible,
                'style', s.custom_style
            ) ORDER BY s.order_index
        )
        FROM public_page_sections s 
        WHERE s.config_id = c.id),
        '[]'::jsonb
    ) as sections
FROM establishment_public_config c
JOIN establishments e ON e.id = c.establishment_id;

-- Commentaires
COMMENT ON TABLE establishment_public_config IS 'Configuration des pages publiques personnalisables des établissements';
COMMENT ON TABLE public_page_sections IS 'Sections individuelles des pages publiques';
COMMENT ON TABLE establishment_media IS 'Médias uploadés pour les pages publiques';
