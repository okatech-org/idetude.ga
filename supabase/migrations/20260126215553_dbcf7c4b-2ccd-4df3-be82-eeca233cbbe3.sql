-- Ajouter les nouveaux types de personnel : private_teacher
-- Mettre à jour la contrainte CHECK pour inclure private_teacher
ALTER TABLE public.establishment_staff DROP CONSTRAINT IF EXISTS establishment_staff_staff_type_check;

ALTER TABLE public.establishment_staff 
ADD CONSTRAINT establishment_staff_staff_type_check 
CHECK (staff_type IN ('direction', 'admin', 'teacher', 'student', 'tutor', 'technical', 'private_teacher'));

-- Ajouter une colonne pour lier tuteur/prof particulier à un élève
ALTER TABLE public.establishment_staff 
ADD COLUMN IF NOT EXISTS linked_student_id uuid REFERENCES public.establishment_staff(id) ON DELETE SET NULL;

-- Ajouter une colonne pour distinguer le professeur principal
ALTER TABLE public.establishment_staff 
ADD COLUMN IF NOT EXISTS is_class_principal boolean DEFAULT false;

-- Ajouter une colonne pour la catégorie (administratif vs éducatif)
ALTER TABLE public.establishment_staff 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'administrative' 
CHECK (category IN ('administrative', 'educational'));

-- Index pour les requêtes de liaison
CREATE INDEX IF NOT EXISTS idx_establishment_staff_linked_student 
ON public.establishment_staff(linked_student_id) 
WHERE linked_student_id IS NOT NULL;

-- Index pour filtrer par catégorie
CREATE INDEX IF NOT EXISTS idx_establishment_staff_category 
ON public.establishment_staff(establishment_id, category);