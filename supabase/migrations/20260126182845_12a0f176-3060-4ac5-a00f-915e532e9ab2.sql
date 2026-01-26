-- Table des matières par établissement
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- general, language, technical, artistic, sport
  is_language BOOLEAN NOT NULL DEFAULT false,
  language_code TEXT, -- fr, en, ar, etc. si is_language = true
  language_level TEXT, -- LV1, LV2, LV3, option
  coefficient NUMERIC DEFAULT 1.0,
  hours_per_week NUMERIC,
  is_mandatory BOOLEAN DEFAULT true,
  color TEXT,
  icon TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de liaison matières-niveaux (quelles matières pour quels niveaux)
CREATE TABLE public.subject_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  level_code TEXT NOT NULL, -- cp, ce1, 6eme, etc.
  coefficient_override NUMERIC, -- Coefficient spécifique à ce niveau
  hours_override NUMERIC, -- Heures spécifiques à ce niveau
  is_mandatory_override BOOLEAN, -- Obligatoire spécifique à ce niveau
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des sections linguistiques
CREATE TABLE public.linguistic_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Ex: "Section Francophone", "Section Anglophone"
  code TEXT, -- Ex: "FR", "EN", "BILINGUE"
  teaching_language TEXT NOT NULL, -- fr, en, ar, etc.
  is_default BOOLEAN DEFAULT false,
  description TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Liaison classes-sections linguistiques
CREATE TABLE public.class_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.linguistic_sections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, section_id)
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linguistic_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;

-- Policies pour subjects
CREATE POLICY "Establishment users can view subjects"
ON public.subjects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_establishments ue
    WHERE ue.establishment_id = subjects.establishment_id
    AND ue.user_id = auth.uid()
  )
);

CREATE POLICY "School admins can manage subjects"
ON public.subjects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_establishments ue
    WHERE ue.establishment_id = subjects.establishment_id
    AND ue.user_id = auth.uid()
  )
  AND (
    has_role(auth.uid(), 'school_director'::app_role)
    OR has_role(auth.uid(), 'school_admin'::app_role)
  )
);

CREATE POLICY "Super admins can manage all subjects"
ON public.subjects FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Policies pour subject_levels
CREATE POLICY "Establishment users can view subject_levels"
ON public.subject_levels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM subjects s
    JOIN user_establishments ue ON ue.establishment_id = s.establishment_id
    WHERE s.id = subject_levels.subject_id
    AND ue.user_id = auth.uid()
  )
);

CREATE POLICY "School admins can manage subject_levels"
ON public.subject_levels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM subjects s
    JOIN user_establishments ue ON ue.establishment_id = s.establishment_id
    WHERE s.id = subject_levels.subject_id
    AND ue.user_id = auth.uid()
  )
  AND (
    has_role(auth.uid(), 'school_director'::app_role)
    OR has_role(auth.uid(), 'school_admin'::app_role)
  )
);

CREATE POLICY "Super admins can manage all subject_levels"
ON public.subject_levels FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Policies pour linguistic_sections
CREATE POLICY "Establishment users can view linguistic_sections"
ON public.linguistic_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_establishments ue
    WHERE ue.establishment_id = linguistic_sections.establishment_id
    AND ue.user_id = auth.uid()
  )
);

CREATE POLICY "School admins can manage linguistic_sections"
ON public.linguistic_sections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_establishments ue
    WHERE ue.establishment_id = linguistic_sections.establishment_id
    AND ue.user_id = auth.uid()
  )
  AND (
    has_role(auth.uid(), 'school_director'::app_role)
    OR has_role(auth.uid(), 'school_admin'::app_role)
  )
);

CREATE POLICY "Super admins can manage all linguistic_sections"
ON public.linguistic_sections FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Policies pour class_sections
CREATE POLICY "Establishment users can view class_sections"
ON public.class_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM classes c
    JOIN user_establishments ue ON ue.establishment_id = c.establishment_id
    WHERE c.id = class_sections.class_id
    AND ue.user_id = auth.uid()
  )
);

CREATE POLICY "School admins can manage class_sections"
ON public.class_sections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM classes c
    JOIN user_establishments ue ON ue.establishment_id = c.establishment_id
    WHERE c.id = class_sections.class_id
    AND ue.user_id = auth.uid()
  )
  AND (
    has_role(auth.uid(), 'school_director'::app_role)
    OR has_role(auth.uid(), 'school_admin'::app_role)
  )
);

CREATE POLICY "Super admins can manage all class_sections"
ON public.class_sections FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Triggers pour updated_at
CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linguistic_sections_updated_at
BEFORE UPDATE ON public.linguistic_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour performance
CREATE INDEX idx_subjects_establishment ON public.subjects(establishment_id);
CREATE INDEX idx_subjects_category ON public.subjects(category);
CREATE INDEX idx_subject_levels_subject ON public.subject_levels(subject_id);
CREATE INDEX idx_linguistic_sections_establishment ON public.linguistic_sections(establishment_id);
CREATE INDEX idx_class_sections_class ON public.class_sections(class_id);
CREATE INDEX idx_class_sections_section ON public.class_sections(section_id);