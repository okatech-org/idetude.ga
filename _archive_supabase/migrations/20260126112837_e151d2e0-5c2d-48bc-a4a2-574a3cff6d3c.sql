-- Créer une table pour les bannissements temporaires
CREATE TABLE public.user_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES public.profiles(id),
  ban_reason TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  banned_until TIMESTAMP WITH TIME ZONE NOT NULL,
  lifted_at TIMESTAMP WITH TIME ZONE,
  lifted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Policies pour user_bans
CREATE POLICY "Super admins can manage all bans"
ON public.user_bans
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can view and create bans"
ON public.user_bans
FOR SELECT
USING (has_role(auth.uid(), 'school_admin'));

CREATE POLICY "School admins can create bans"
ON public.user_bans
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'school_admin'));

-- Index pour améliorer les performances
CREATE INDEX idx_user_bans_user_id ON public.user_bans(user_id);
CREATE INDEX idx_user_bans_banned_until ON public.user_bans(banned_until);

-- Fonction pour vérifier si un utilisateur est banni
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_bans
    WHERE user_id = _user_id
      AND banned_until > now()
      AND lifted_at IS NULL
  )
$$;