-- ============================================
-- Migration: Admin Audit Logs, System Alerts, 2FA
-- Date: 2026-01-27
-- ============================================

-- ============================================
-- 1. ADMIN AUDIT LOGS
-- ============================================

-- Table pour logger toutes les actions administratives
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CONFIG', 'EXPORT', 'IMPORT')),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  resource_name TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.admin_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.admin_audit_logs(created_at DESC);

-- RLS pour admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR auth.uid() = actor_id);

-- Fonction pour logger les actions admin
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_resource_name TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_audit_logs (
    actor_id,
    action_type,
    resource_type,
    resource_id,
    resource_name,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_resource_name,
    p_old_values,
    p_new_values,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Trigger générique pour audit automatique
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Seulement logger si l'utilisateur est super_admin
  IF has_role(auth.uid(), 'super_admin'::app_role) THEN
    INSERT INTO admin_audit_logs (
      actor_id,
      action_type,
      resource_type,
      resource_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers sur tables critiques
DROP TRIGGER IF EXISTS audit_countries ON public.countries;
CREATE TRIGGER audit_countries
  AFTER INSERT OR UPDATE OR DELETE ON public.countries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_establishments ON public.establishments;
CREATE TRIGGER audit_establishments
  AFTER INSERT OR UPDATE OR DELETE ON public.establishments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================
-- 2. SYSTEM ALERTS
-- ============================================

-- Table pour les alertes système
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('info', 'warning', 'error', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT,
  resource_id UUID,
  link TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Index pour alertes
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON public.system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON public.system_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created ON public.system_alerts(created_at DESC);

-- RLS pour system_alerts
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage system alerts"
  ON public.system_alerts
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Table pour les règles d'alertes
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  condition_type TEXT NOT NULL, -- 'threshold', 'absence', 'count'
  resource_type TEXT NOT NULL,
  condition_config JSONB NOT NULL DEFAULT '{}',
  alert_type TEXT NOT NULL DEFAULT 'warning',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour alert_rules
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage alert rules"
  ON public.alert_rules
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Insérer quelques règles par défaut
INSERT INTO public.alert_rules (name, description, condition_type, resource_type, condition_config, alert_type)
VALUES 
  ('Établissements sans directeur', 'Alerte quand un établissement n''a pas de directeur assigné', 'absence', 'establishment', '{"role": "school_director"}', 'warning'),
  ('Utilisateurs en attente', 'Alerte quand des utilisateurs attendent validation depuis plus de 48h', 'threshold', 'user', '{"hours": 48}', 'info'),
  ('Commentaires signalés', 'Alerte quand des commentaires sont signalés', 'count', 'comment', '{"min_count": 1}', 'warning')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. 2FA / TOTP SECRETS
-- ============================================

-- Table pour stocker les secrets TOTP
CREATE TABLE IF NOT EXISTS public.totp_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[], -- Codes de secours hashés
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_totp_user ON public.totp_secrets(user_id);

-- RLS très strict pour TOTP
ALTER TABLE public.totp_secrets ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur ne peut voir que son propre secret
CREATE POLICY "Users can view own totp"
  ON public.totp_secrets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own totp"
  ON public.totp_secrets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own totp"
  ON public.totp_secrets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own totp"
  ON public.totp_secrets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour vérifier si 2FA est requis
CREATE OR REPLACE FUNCTION public.is_2fa_required(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'super_admin'::app_role
  );
$$;

-- Fonction pour vérifier si 2FA est activé pour un utilisateur
CREATE OR REPLACE FUNCTION public.is_2fa_enabled(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_enabled FROM totp_secrets WHERE user_id = p_user_id),
    false
  );
$$;

-- ============================================
-- 4. FONCTION UTILITAIRE POUR STATISTIQUES
-- ============================================

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'countries_count', (SELECT COUNT(*) FROM countries WHERE is_active = true),
    'regions_count', (SELECT COUNT(*) FROM regions WHERE is_active = true),
    'groups_count', (SELECT COUNT(*) FROM establishment_groups),
    'establishments_count', (SELECT COUNT(*) FROM establishments),
    'users_count', (SELECT COUNT(*) FROM profiles),
    'students_count', (SELECT COUNT(*) FROM user_roles WHERE role = 'student'::app_role),
    'teachers_count', (SELECT COUNT(*) FROM user_roles WHERE role IN ('teacher'::app_role, 'main_teacher'::app_role)),
    'pending_alerts', (SELECT COUNT(*) FROM system_alerts WHERE is_resolved = false),
    'recent_audit_count', (SELECT COUNT(*) FROM admin_audit_logs WHERE created_at > now() - interval '24 hours')
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fonction pour récupérer les activités récentes
CREATE OR REPLACE FUNCTION public.get_recent_audit_logs(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  action_type TEXT,
  resource_type TEXT,
  resource_name TEXT,
  actor_name TEXT,
  actor_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    al.id,
    al.action_type,
    al.resource_type,
    al.resource_name,
    COALESCE(p.first_name || ' ' || p.last_name, 'Système') as actor_name,
    COALESCE((SELECT role::text FROM user_roles WHERE user_id = al.actor_id LIMIT 1), 'system') as actor_role,
    al.created_at
  FROM admin_audit_logs al
  LEFT JOIN profiles p ON p.id = al.actor_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
$$;
