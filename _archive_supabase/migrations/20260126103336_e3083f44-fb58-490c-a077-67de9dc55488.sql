-- Ajouter le support des threads (réponses aux commentaires)
ALTER TABLE public.resource_comments 
ADD COLUMN parent_id UUID REFERENCES public.resource_comments(id) ON DELETE CASCADE;

-- Ajouter les champs de modération
ALTER TABLE public.resource_comments 
ADD COLUMN is_flagged BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN flag_reason TEXT,
ADD COLUMN flagged_by UUID REFERENCES public.profiles(id),
ADD COLUMN flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN hidden_by UUID REFERENCES public.profiles(id),
ADD COLUMN hidden_at TIMESTAMP WITH TIME ZONE;

-- Table pour les statistiques de ressources (vues uniques par utilisateur)
CREATE TABLE public.resource_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.pedagogical_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resource_id, user_id)
);

-- Enable RLS
ALTER TABLE public.resource_views ENABLE ROW LEVEL SECURITY;

-- Policies pour resource_views
CREATE POLICY "Users can view their own views"
  ON public.resource_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create views"
  ON public.resource_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Resource owners can view all views"
  ON public.resource_views FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pedagogical_resources pr
    WHERE pr.id = resource_views.resource_id
    AND pr.uploaded_by = auth.uid()
  ));

CREATE POLICY "Super admins can manage all views"
  ON public.resource_views FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Policy pour permettre aux admins de modérer les commentaires
CREATE POLICY "Admins can update any comment for moderation"
  ON public.resource_comments FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'school_admin'));