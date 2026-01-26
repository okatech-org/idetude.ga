-- Bibliothèque de ressources pédagogiques
CREATE TABLE public.pedagogical_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL DEFAULT 'document',
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  file_url TEXT,
  external_url TEXT,
  tags TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  downloads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suivi des compétences
CREATE TABLE public.competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  max_level INTEGER NOT NULL DEFAULT 4,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.student_competencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 0,
  evaluated_by UUID NOT NULL REFERENCES public.profiles(id),
  evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, competency_id)
);

-- Historique des évaluations de compétences
CREATE TABLE public.competency_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_competency_id UUID NOT NULL REFERENCES public.student_competencies(id) ON DELETE CASCADE,
  previous_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  evaluated_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pedagogical_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_history ENABLE ROW LEVEL SECURITY;

-- Policies for pedagogical_resources
CREATE POLICY "Teachers can view all resources" ON public.pedagogical_resources
  FOR SELECT USING (is_public = true OR auth.uid() = uploaded_by);

CREATE POLICY "Teachers can upload resources" ON public.pedagogical_resources
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Teachers can update their resources" ON public.pedagogical_resources
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Teachers can delete their resources" ON public.pedagogical_resources
  FOR DELETE USING (auth.uid() = uploaded_by);

CREATE POLICY "Super admins can manage all resources" ON public.pedagogical_resources
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Policies for competencies
CREATE POLICY "Everyone can view competencies" ON public.competencies
  FOR SELECT USING (true);

CREATE POLICY "Teachers can create competencies" ON public.competencies
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update their competencies" ON public.competencies
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Super admins can manage all competencies" ON public.competencies
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Policies for student_competencies
CREATE POLICY "Students can view their competencies" ON public.student_competencies
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all student competencies" ON public.student_competencies
  FOR SELECT USING (auth.uid() = evaluated_by);

CREATE POLICY "Teachers can evaluate competencies" ON public.student_competencies
  FOR INSERT WITH CHECK (auth.uid() = evaluated_by);

CREATE POLICY "Teachers can update evaluations" ON public.student_competencies
  FOR UPDATE USING (auth.uid() = evaluated_by);

CREATE POLICY "Super admins can manage all evaluations" ON public.student_competencies
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Policies for competency_history
CREATE POLICY "Students can view their history" ON public.competency_history
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.student_competencies sc
    WHERE sc.id = student_competency_id AND sc.student_id = auth.uid()
  ));

CREATE POLICY "Teachers can view history they created" ON public.competency_history
  FOR SELECT USING (auth.uid() = evaluated_by);

CREATE POLICY "Teachers can create history" ON public.competency_history
  FOR INSERT WITH CHECK (auth.uid() = evaluated_by);

CREATE POLICY "Super admins can manage all history" ON public.competency_history
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Triggers for updated_at
CREATE TRIGGER update_pedagogical_resources_updated_at
  BEFORE UPDATE ON public.pedagogical_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competencies_updated_at
  BEFORE UPDATE ON public.competencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_competencies_updated_at
  BEFORE UPDATE ON public.student_competencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for pedagogical resources
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view resources files" ON storage.objects
  FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Authenticated users can upload resources" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their resources files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their resources files" ON storage.objects
  FOR DELETE USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);