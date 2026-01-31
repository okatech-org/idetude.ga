-- Supprimer la politique problématique qui utilise encore une sous-requête sur la même table
DROP POLICY IF EXISTS "School directors can manage establishment users" ON public.user_establishments;

-- Recréer avec la fonction sécurisée
CREATE POLICY "School directors can manage establishment users" 
ON public.user_establishments
FOR ALL
USING (
  has_role(auth.uid(), 'school_director'::app_role) 
  AND user_belongs_to_establishment(auth.uid(), establishment_id)
);