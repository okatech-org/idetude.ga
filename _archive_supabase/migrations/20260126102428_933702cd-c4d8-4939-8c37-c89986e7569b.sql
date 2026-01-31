-- Table des favoris pour les ressources pédagogiques
CREATE TABLE public.resource_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.pedagogical_resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.resource_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for favorites
CREATE POLICY "Users can view their favorites" ON public.resource_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.resource_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" ON public.resource_favorites
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all favorites" ON public.resource_favorites
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));