-- =====================================================
-- ESTABLISHMENT PUBLIC SPACE V2 - MULTI-PAGE SCHEMA
-- =====================================================
-- Adds multi-page support and image configuration

-- Pages table for multi-page architecture
CREATE TABLE IF NOT EXISTS public_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES establishment_public_config(id) ON DELETE CASCADE,
    
    -- Page identification
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    
    -- Page properties
    is_home BOOLEAN DEFAULT false,
    show_in_menu BOOLEAN DEFAULT true,
    menu_label VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    
    -- Page-specific styling (overrides global)
    palette_override JSONB,
    custom_css TEXT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(config_id, slug)
);

-- Add page_id to sections
ALTER TABLE public_page_sections 
ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public_pages(id) ON DELETE CASCADE;

-- Add image configuration to sections
ALTER TABLE public_page_sections 
ADD COLUMN IF NOT EXISTS image_config JSONB DEFAULT '{}'::jsonb;

-- Create index for sections by page
CREATE INDEX IF NOT EXISTS idx_page_sections_page 
    ON public_page_sections(page_id);

-- Update the view to include pages
DROP VIEW IF EXISTS v_establishment_public_page;

CREATE OR REPLACE VIEW v_establishment_public_page AS
SELECT 
    c.*,
    e.name as establishment_name,
    e.logo_url,
    COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'slug', p.slug,
                'title', p.title,
                'is_home', p.is_home,
                'show_in_menu', p.show_in_menu,
                'menu_label', p.menu_label,
                'order', p.order_index,
                'palette_override', p.palette_override,
                'meta_title', p.meta_title,
                'meta_description', p.meta_description,
                'sections', (
                    SELECT COALESCE(jsonb_agg(
                        jsonb_build_object(
                            'id', s.id,
                            'type', s.section_type,
                            'content', s.content,
                            'order', s.order_index,
                            'visible', s.is_visible,
                            'style', s.custom_style,
                            'image_config', s.image_config
                        ) ORDER BY s.order_index
                    ), '[]'::jsonb)
                    FROM public_page_sections s 
                    WHERE s.page_id = p.id
                )
            ) ORDER BY p.order_index
        )
        FROM public_pages p 
        WHERE p.config_id = c.id),
        '[]'::jsonb
    ) as pages,
    -- Keep legacy sections for backward compatibility
    COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'type', s.section_type,
                'content', s.content,
                'order', s.order_index,
                'visible', s.is_visible,
                'style', s.custom_style,
                'image_config', s.image_config
            ) ORDER BY s.order_index
        )
        FROM public_page_sections s 
        WHERE s.config_id = c.id AND s.page_id IS NULL),
        '[]'::jsonb
    ) as sections
FROM establishment_public_config c
JOIN establishments e ON e.id = c.establishment_id;

-- Trigger for pages updated_at
DROP TRIGGER IF EXISTS trigger_update_public_pages_timestamp ON public_pages;
CREATE TRIGGER trigger_update_public_pages_timestamp
    BEFORE UPDATE ON public_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_public_config_timestamp();

COMMENT ON TABLE public_pages IS 'Pages individuelles pour le site public de l''établissement';
COMMENT ON COLUMN public_page_sections.page_id IS 'Page à laquelle appartient cette section';
COMMENT ON COLUMN public_page_sections.image_config IS 'Configuration des images (taille, position, overlay)';
