-- =====================================================
-- EXTENSION SCHEMA POUR COLLEGE-LYCEE IETUDE
-- Instance: idetude-db (projet: idetude)
-- =====================================================

-- Add enabled_modules column if not exists
ALTER TABLE establishments ADD COLUMN IF NOT EXISTS enabled_modules TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Table des matières
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('litteraire', 'scientifique', 'artistique', 'sportif', 'technique')),
  coefficient INTEGER DEFAULT 1,
  levels TEXT[],
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enseignant-Matières (quelles matières enseigne chaque prof)
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, subject_id)
);

-- Élève-Classe (inscription des élèves dans les classes)
CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  school_year TEXT NOT NULL DEFAULT '2025-2026',
  registration_number TEXT,
  is_delegate BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, class_id, school_year)
);

-- Enseignant-Classe (affectation PP ou enseignant régulier)
CREATE TABLE IF NOT EXISTS class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  is_main_teacher BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, class_id, subject_id)
);

-- Parent-Élève (lien familial)
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('pere', 'mere', 'tuteur', 'autre')),
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_subjects_establishment ON subjects(establishment_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_class ON class_teachers(class_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON parent_students(student_id);

-- Vérification
SELECT 'Schema extension completed successfully' AS status;
