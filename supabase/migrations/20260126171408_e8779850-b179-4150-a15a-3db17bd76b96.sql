-- Supprimer les politiques problématiques qui causent une récursion infinie
DROP POLICY IF EXISTS "Establishment users can view affiliations" ON public.user_establishments;
DROP POLICY IF EXISTS "School directors can manage their establishment users" ON public.user_establishments;

-- Recréer les politiques sans récursion
-- Les utilisateurs peuvent voir leurs propres affiliations (déjà existant via "Users can view their own establishment affiliations")

-- Les super admins peuvent tout gérer (déjà existant)

-- Les directeurs d'école peuvent gérer les affiliations de leur établissement
-- On utilise une approche différente : vérifier si l'utilisateur est directeur et a accès à l'établissement
CREATE POLICY "School directors can manage establishment users" 
ON public.user_establishments
FOR ALL
USING (
  has_role(auth.uid(), 'school_director'::app_role) 
  AND auth.uid() IN (
    SELECT ue.user_id 
    FROM public.user_establishments ue 
    WHERE ue.establishment_id = user_establishments.establishment_id 
    AND ue.user_id = auth.uid()
  )
);

-- Permettre à tous les utilisateurs authentifiés de voir les affiliations de leur établissement
-- en utilisant une fonction sécurisée pour éviter la récursion
CREATE OR REPLACE FUNCTION public.user_belongs_to_establishment(_user_id uuid, _establishment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_establishments
    WHERE user_id = _user_id
      AND establishment_id = _establishment_id
  )
$$;

-- Recréer la politique pour permettre de voir les affiliations du même établissement
CREATE POLICY "Users can view same establishment affiliations" 
ON public.user_establishments
FOR SELECT
USING (
  user_belongs_to_establishment(auth.uid(), establishment_id)
);