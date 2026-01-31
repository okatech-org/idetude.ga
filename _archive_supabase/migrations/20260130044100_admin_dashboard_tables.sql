-- Migration: Admin Dashboard Tables
-- Description: Création des tables system_alerts et admin_audit_logs pour le tableau de bord Super Admin

-- ============================================
-- Table: system_alerts
-- Stocke les alertes système pour le dashboard
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('info', 'warning', 'error', 'success')),
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved 
    ON public.system_alerts(is_resolved, created_at DESC) 
    WHERE is_resolved = false;

-- Commentaires
COMMENT ON TABLE public.system_alerts IS 'Alertes système affichées sur le tableau de bord Super Admin';
COMMENT ON COLUMN public.system_alerts.alert_type IS 'Type d''alerte: info, warning, error, success';
COMMENT ON COLUMN public.system_alerts.link IS 'Lien vers la page concernée par l''alerte';

-- ============================================
-- Table: admin_audit_logs
-- Journal d'audit des actions administratives
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'INSERT', 'VIEW', 'EXPORT')),
    resource_type TEXT NOT NULL,
    resource_id UUID,
    resource_name TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor 
    ON public.admin_audit_logs(actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource 
    ON public.admin_audit_logs(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_recent 
    ON public.admin_audit_logs(created_at DESC);

-- Commentaires
COMMENT ON TABLE public.admin_audit_logs IS 'Journal d''audit des actions administratives';
COMMENT ON COLUMN public.admin_audit_logs.action_type IS 'Type d''action: CREATE, UPDATE, DELETE, INSERT, VIEW, EXPORT';
COMMENT ON COLUMN public.admin_audit_logs.resource_type IS 'Type de ressource modifiée (establishments, users, etc.)';
COMMENT ON COLUMN public.admin_audit_logs.old_values IS 'Valeurs avant modification (pour UPDATE/DELETE)';
COMMENT ON COLUMN public.admin_audit_logs.new_values IS 'Valeurs après modification (pour CREATE/UPDATE)';

-- ============================================
-- RLS Policies
-- ============================================

-- Activer RLS
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Les super admins peuvent tout voir et modifier
CREATE POLICY "Super admins can manage system_alerts"
    ON public.system_alerts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can view audit_logs"
    ON public.admin_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'super_admin'
        )
    );

CREATE POLICY "System can insert audit_logs"
    ON public.admin_audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- Fonction: log_admin_action
-- Helper pour logger les actions admin
-- ============================================
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action_type TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_resource_name TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.admin_audit_logs (
        actor_id,
        action_type,
        resource_type,
        resource_id,
        resource_name,
        old_values,
        new_values
    ) VALUES (
        auth.uid(),
        p_action_type,
        p_resource_type,
        p_resource_id,
        p_resource_name,
        p_old_values,
        p_new_values
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION public.log_admin_action IS 'Helper pour enregistrer une action administrative dans le journal d''audit';

-- ============================================
-- Données initiales: Alertes de démonstration
-- ============================================
INSERT INTO public.system_alerts (alert_type, title, description, link) VALUES
    ('warning', '3 établissements sans directeur', 'Certains établissements n''ont pas de directeur assigné', '/admin/establishments'),
    ('info', '12 utilisateurs en attente de validation', 'Nouveaux comptes en attente de vérification', '/admin/users')
ON CONFLICT DO NOTHING;
