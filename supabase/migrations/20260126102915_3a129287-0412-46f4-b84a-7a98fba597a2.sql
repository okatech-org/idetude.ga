-- Table pour les commentaires sur les ressources
CREATE TABLE public.resource_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.pedagogical_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les évaluations (étoiles) sur les ressources
CREATE TABLE public.resource_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.pedagogical_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resource_id, user_id)
);

-- Table pour les matières enseignées par chaque enseignant
CREATE TABLE public.teacher_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, subject)
);

-- Enable RLS
ALTER TABLE public.resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

-- Policies pour resource_comments
CREATE POLICY "Users can view all comments"
  ON public.resource_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.resource_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.resource_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.resource_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all comments"
  ON public.resource_comments FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Policies pour resource_ratings
CREATE POLICY "Users can view all ratings"
  ON public.resource_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON public.resource_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.resource_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.resource_ratings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all ratings"
  ON public.resource_ratings FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Policies pour teacher_subjects
CREATE POLICY "Users can view all teacher subjects"
  ON public.teacher_subjects FOR SELECT
  USING (true);

CREATE POLICY "Teachers can manage their subjects"
  ON public.teacher_subjects FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY "Super admins can manage all teacher subjects"
  ON public.teacher_subjects FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Trigger pour updated_at sur resource_comments
CREATE TRIGGER update_resource_comments_updated_at
  BEFORE UPDATE ON public.resource_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour notifier les enseignants lors d'une nouvelle ressource
CREATE OR REPLACE FUNCTION public.notify_teachers_new_resource()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  teacher_record RECORD;
BEGIN
  -- Trouver tous les enseignants qui enseignent cette matière
  FOR teacher_record IN
    SELECT DISTINCT ts.teacher_id
    FROM public.teacher_subjects ts
    WHERE ts.subject = NEW.subject
    AND ts.teacher_id != NEW.uploaded_by
  LOOP
    -- Créer une notification pour chaque enseignant
    INSERT INTO public.notifications (user_id, type, title, content, link)
    VALUES (
      teacher_record.teacher_id,
      'assignment',
      'Nouvelle ressource : ' || NEW.title,
      'Une nouvelle ressource a été ajoutée dans la matière ' || NEW.subject,
      '/ressources'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger pour notifier les enseignants
CREATE TRIGGER trigger_notify_teachers_new_resource
  AFTER INSERT ON public.pedagogical_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_teachers_new_resource();