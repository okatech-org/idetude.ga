-- =====================================================
-- EXTENSION SCHEMA POUR COLLEGE-LYCEE IETUDE
-- Instance: idetude-db (projet: idetude)
-- =====================================================

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
-- =====================================================
-- SEED DATA: COLLEGE-LYCEE EXCELLENCE DU GABON
-- Instance: idetude-db (projet: idetude)
-- Année scolaire: 2025-2026
-- =====================================================

-- =====================================================
-- 1. ETABLISSEMENT
-- =====================================================
INSERT INTO establishments (id, name, code, type, address, phone, email, country_code, student_capacity, levels)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Collège-Lycée Excellence du Gabon',
  'CLG-LYC-001',
  'lycee',
  'Boulevard Triomphal, Quartier Louis, Libreville',
  '+241 01 72 00 00',
  'contact@excellence.idetude.ga',
  'GA',
  200,
  '6eme,5eme,4eme,3eme,2nde,1ere,tle'
) ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 2. PERSONNEL ADMINISTRATIF (5)
-- =====================================================

-- Directeur
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('11111111-0001-0001-0001-000000000001', 'jp.nzoghe@idetude.ga', '{"first_name": "Jean-Pierre", "last_name": "NZOGHE"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('11111111-0001-0001-0001-000000000001', 'jp.nzoghe@idetude.ga', 'Jean-Pierre', 'NZOGHE', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('11111111-0001-0001-0001-000000000001', 'school_director') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('11111111-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Directeur Adjoint
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('11111111-0001-0001-0001-000000000002', 'm.obame@idetude.ga', '{"first_name": "Marie", "last_name": "OBAME"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('11111111-0001-0001-0001-000000000002', 'm.obame@idetude.ga', 'Marie', 'OBAME', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('11111111-0001-0001-0001-000000000002', 'school_admin') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('11111111-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- CPE
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('11111111-0001-0001-0001-000000000003', 'p.mounguengui@idetude.ga', '{"first_name": "Paul", "last_name": "MOUNGUENGUI"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('11111111-0001-0001-0001-000000000003', 'p.mounguengui@idetude.ga', 'Paul', 'MOUNGUENGUI', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('11111111-0001-0001-0001-000000000003', 'cpe') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('11111111-0001-0001-0001-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Secrétaire Général
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('11111111-0001-0001-0001-000000000004', 'c.ndong@idetude.ga', '{"first_name": "Claire", "last_name": "NDONG"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('11111111-0001-0001-0001-000000000004', 'c.ndong@idetude.ga', 'Claire', 'NDONG', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('11111111-0001-0001-0001-000000000004', 'school_admin') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('11111111-0001-0001-0001-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Intendant
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('11111111-0001-0001-0001-000000000005', 'r.ella@idetude.ga', '{"first_name": "Robert", "last_name": "ELLA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('11111111-0001-0001-0001-000000000005', 'r.ella@idetude.ga', 'Robert', 'ELLA', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('11111111-0001-0001-0001-000000000005', 'school_admin') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('11111111-0001-0001-0001-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. ENSEIGNANTS (15)
-- =====================================================

-- Prof 1: Français
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000001', 's.moussavou@idetude.ga', '{"first_name": "Sylvie", "last_name": "MOUSSAVOU"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000001', 's.moussavou@idetude.ga', 'Sylvie', 'MOUSSAVOU', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000001', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 2: Mathématiques
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000002', 'a.bibang@idetude.ga', '{"first_name": "André", "last_name": "BIBANG"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000002', 'a.bibang@idetude.ga', 'André', 'BIBANG', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000002', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 3: Anglais
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000003', 'g.nguema@idetude.ga', '{"first_name": "Grace", "last_name": "NGUEMA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000003', 'g.nguema@idetude.ga', 'Grace', 'NGUEMA', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000003', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 4: SVT
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000004', 'p.ondo@idetude.ga', '{"first_name": "Pierre", "last_name": "ONDO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000004', 'p.ondo@idetude.ga', 'Pierre', 'ONDO', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000004', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 5: Physique-Chimie
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000005', 'm.essono@idetude.ga', '{"first_name": "Marc", "last_name": "ESSONO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000005', 'm.essono@idetude.ga', 'Marc', 'ESSONO', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000005', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 6: Histoire-Géo
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000006', 'j.mba@idetude.ga', '{"first_name": "Jeanne", "last_name": "MBA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000006', 'j.mba@idetude.ga', 'Jeanne', 'MBA', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000006', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 7: Philosophie
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000007', 'a.ntoutoume@idetude.ga', '{"first_name": "Augustin", "last_name": "NTOUTOUME"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000007', 'a.ntoutoume@idetude.ga', 'Augustin', 'NTOUTOUME', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000007', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 8: Espagnol
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000008', 'c.ovono@idetude.ga', '{"first_name": "Carmen", "last_name": "OVONO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000008', 'c.ovono@idetude.ga', 'Carmen', 'OVONO', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000008', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 9: EPS
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000009', 'd.akure@idetude.ga', '{"first_name": "Dieudonné", "last_name": "AKURE"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000009', 'd.akure@idetude.ga', 'Dieudonné', 'AKURE', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000009', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 10: Arts Plastiques
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000010', 'l.meyo@idetude.ga', '{"first_name": "Lucie", "last_name": "MEYO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000010', 'l.meyo@idetude.ga', 'Lucie', 'MEYO', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000010', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 11: Musique
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000011', 'p.edou@idetude.ga', '{"first_name": "Patrice", "last_name": "EDOU"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000011', 'p.edou@idetude.ga', 'Patrice', 'EDOU', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000011', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 12: Informatique
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000012', 's.bouanga@idetude.ga', '{"first_name": "Stéphane", "last_name": "BOUANGA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000012', 's.bouanga@idetude.ga', 'Stéphane', 'BOUANGA', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000012', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 13: ECM
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000013', 't.minko@idetude.ga', '{"first_name": "Thérèse", "last_name": "MINKO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000013', 't.minko@idetude.ga', 'Thérèse', 'MINKO', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000013', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 14: Latin
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000014', 'g.assoumou@idetude.ga', '{"first_name": "Grégoire", "last_name": "ASSOUMOU"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000014', 'g.assoumou@idetude.ga', 'Grégoire', 'ASSOUMOU', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000014', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Prof 15: Allemand
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('22222222-0001-0001-0001-000000000015', 'h.oyono@idetude.ga', '{"first_name": "Hans", "last_name": "OYONO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('22222222-0001-0001-0001-000000000015', 'h.oyono@idetude.ga', 'Hans', 'OYONO', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('22222222-0001-0001-0001-000000000015', 'teacher') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('22222222-0001-0001-0001-000000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. TUTEURS EXTERNES (3)
-- =====================================================

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('33333333-0001-0001-0001-000000000001', 'mboumba.tuteur@gmail.com', '{"first_name": "Dr. Albert", "last_name": "MBOUMBA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('33333333-0001-0001-0001-000000000001', 'mboumba.tuteur@gmail.com', 'Dr. Albert', 'MBOUMBA', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('33333333-0001-0001-0001-000000000001', 'external_tutor') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('33333333-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('33333333-0001-0001-0001-000000000002', 'eyang.tuteur@gmail.com', '{"first_name": "Me. Françoise", "last_name": "EYANG"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('33333333-0001-0001-0001-000000000002', 'eyang.tuteur@gmail.com', 'Me. Françoise', 'EYANG', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('33333333-0001-0001-0001-000000000002', 'external_tutor') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('33333333-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('33333333-0001-0001-0001-000000000003', 'koumba.tuteur@gmail.com', '{"first_name": "M. Patrick", "last_name": "KOUMBA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('33333333-0001-0001-0001-000000000003', 'koumba.tuteur@gmail.com', 'M. Patrick', 'KOUMBA', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO user_roles (user_id, role) VALUES ('33333333-0001-0001-0001-000000000003', 'external_tutor') ON CONFLICT DO NOTHING;
INSERT INTO user_establishments (user_id, establishment_id, is_primary) VALUES
('33333333-0001-0001-0001-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', true) ON CONFLICT DO NOTHING;

-- Vérification partielle
SELECT 'Seed Part 1 (Staff) completed: ' || COUNT(*) || ' users created' AS status FROM profiles WHERE is_demo = true;
-- =====================================================
-- SEED DATA: MATIERES ET CLASSES
-- College-Lycée Excellence du Gabon
-- =====================================================

-- =====================================================
-- 5. MATIERES (15)
-- =====================================================

INSERT INTO subjects (id, name, code, category, coefficient, levels, establishment_id) VALUES
('44444444-0001-0001-0001-000000000001', 'Français', 'FR', 'litteraire', 4, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000002', 'Mathématiques', 'MATH', 'scientifique', 4, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000003', 'Anglais', 'ANG', 'litteraire', 3, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000004', 'Sciences de la Vie et de la Terre', 'SVT', 'scientifique', 3, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000005', 'Physique-Chimie', 'PC', 'scientifique', 3, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000006', 'Histoire-Géographie', 'HG', 'litteraire', 3, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000007', 'Philosophie', 'PHILO', 'litteraire', 4, ARRAY['1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000008', 'Espagnol', 'ESP', 'litteraire', 2, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000009', 'Education Physique et Sportive', 'EPS', 'sportif', 2, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000010', 'Arts Plastiques', 'ART', 'artistique', 1, ARRAY['6eme','5eme','4eme','3eme'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000011', 'Musique', 'MUS', 'artistique', 1, ARRAY['6eme','5eme','4eme','3eme'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000012', 'Informatique', 'INFO', 'technique', 2, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000013', 'Education Civique et Morale', 'ECM', 'litteraire', 1, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000014', 'Latin', 'LAT', 'litteraire', 2, ARRAY['4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('44444444-0001-0001-0001-000000000015', 'Allemand', 'ALL', 'litteraire', 2, ARRAY['6eme','5eme','4eme','3eme','2nde','1ere','tle'], 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 6. AFFECTATION PROFS -> MATIERES
-- =====================================================

INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
('22222222-0001-0001-0001-000000000001', '44444444-0001-0001-0001-000000000001'), -- Sylvie -> Français
('22222222-0001-0001-0001-000000000002', '44444444-0001-0001-0001-000000000002'), -- André -> Maths
('22222222-0001-0001-0001-000000000003', '44444444-0001-0001-0001-000000000003'), -- Grace -> Anglais
('22222222-0001-0001-0001-000000000004', '44444444-0001-0001-0001-000000000004'), -- Pierre -> SVT
('22222222-0001-0001-0001-000000000005', '44444444-0001-0001-0001-000000000005'), -- Marc -> PC
('22222222-0001-0001-0001-000000000006', '44444444-0001-0001-0001-000000000006'), -- Jeanne -> HG
('22222222-0001-0001-0001-000000000007', '44444444-0001-0001-0001-000000000007'), -- Augustin -> Philo
('22222222-0001-0001-0001-000000000008', '44444444-0001-0001-0001-000000000008'), -- Carmen -> Espagnol
('22222222-0001-0001-0001-000000000009', '44444444-0001-0001-0001-000000000009'), -- Dieudonné -> EPS
('22222222-0001-0001-0001-000000000010', '44444444-0001-0001-0001-000000000010'), -- Lucie -> Arts
('22222222-0001-0001-0001-000000000011', '44444444-0001-0001-0001-000000000011'), -- Patrice -> Musique
('22222222-0001-0001-0001-000000000012', '44444444-0001-0001-0001-000000000012'), -- Stéphane -> Info
('22222222-0001-0001-0001-000000000013', '44444444-0001-0001-0001-000000000013'), -- Thérèse -> ECM
('22222222-0001-0001-0001-000000000014', '44444444-0001-0001-0001-000000000014'), -- Grégoire -> Latin
('22222222-0001-0001-0001-000000000015', '44444444-0001-0001-0001-000000000015')  -- Hans -> Allemand
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. CLASSES (21 = 7 niveaux x 3 classes)
-- =====================================================

-- COLLEGE: 6ème (3 classes)
INSERT INTO classes (id, establishment_id, name, code, level, section, school_year, capacity, room) VALUES
('55555555-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '6ème A', '6A', '6eme', 'A', '2025-2026', 35, 'Salle 101'),
('55555555-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '6ème B', '6B', '6eme', 'B', '2025-2026', 35, 'Salle 102'),
('55555555-0001-0001-0001-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '6ème C', '6C', '6eme', 'C', '2025-2026', 35, 'Salle 103')
ON CONFLICT DO NOTHING;

-- COLLEGE: 5ème (3 classes)
INSERT INTO classes (id, establishment_id, name, code, level, section, school_year, capacity, room) VALUES
('55555555-0001-0001-0001-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5ème A', '5A', '5eme', 'A', '2025-2026', 35, 'Salle 201'),
('55555555-0001-0001-0001-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5ème B', '5B', '5eme', 'B', '2025-2026', 35, 'Salle 202'),
('55555555-0001-0001-0001-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5ème C', '5C', '5eme', 'C', '2025-2026', 35, 'Salle 203')
ON CONFLICT DO NOTHING;

-- COLLEGE: 4ème (3 classes)
INSERT INTO classes (id, establishment_id, name, code, level, section, school_year, capacity, room) VALUES
('55555555-0001-0001-0001-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '4ème A', '4A', '4eme', 'A', '2025-2026', 35, 'Salle 301'),
('55555555-0001-0001-0001-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '4ème B', '4B', '4eme', 'B', '2025-2026', 35, 'Salle 302'),
('55555555-0001-0001-0001-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '4ème C', '4C', '4eme', 'C', '2025-2026', 35, 'Salle 303')
ON CONFLICT DO NOTHING;

-- COLLEGE: 3ème (3 classes)
INSERT INTO classes (id, establishment_id, name, code, level, section, school_year, capacity, room) VALUES
('55555555-0001-0001-0001-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '3ème A', '3A', '3eme', 'A', '2025-2026', 35, 'Salle 401'),
('55555555-0001-0001-0001-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '3ème B', '3B', '3eme', 'B', '2025-2026', 35, 'Salle 402'),
('55555555-0001-0001-0001-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '3ème C', '3C', '3eme', 'C', '2025-2026', 35, 'Salle 403')
ON CONFLICT DO NOTHING;

-- LYCEE: 2nde (3 classes)
INSERT INTO classes (id, establishment_id, name, code, level, section, school_year, capacity, room) VALUES
('55555555-0001-0001-0001-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2nde A', '2A', '2nde', 'A', '2025-2026', 35, 'Salle 501'),
('55555555-0001-0001-0001-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2nde B', '2B', '2nde', 'B', '2025-2026', 35, 'Salle 502'),
('55555555-0001-0001-0001-000000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2nde C', '2C', '2nde', 'C', '2025-2026', 35, 'Salle 503')
ON CONFLICT DO NOTHING;

-- LYCEE: 1ère (3 classes)
INSERT INTO classes (id, establishment_id, name, code, level, section, school_year, capacity, room) VALUES
('55555555-0001-0001-0001-000000000016', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1ère A', '1A', '1ere', 'A', '2025-2026', 35, 'Salle 601'),
('55555555-0001-0001-0001-000000000017', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1ère B', '1B', '1ere', 'B', '2025-2026', 35, 'Salle 602'),
('55555555-0001-0001-0001-000000000018', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1ère C', '1C', '1ere', 'C', '2025-2026', 35, 'Salle 603')
ON CONFLICT DO NOTHING;

-- LYCEE: Terminale (3 classes)
INSERT INTO classes (id, establishment_id, name, code, level, section, school_year, capacity, room) VALUES
('55555555-0001-0001-0001-000000000019', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tle A', 'TA', 'tle', 'A', '2025-2026', 35, 'Salle 701'),
('55555555-0001-0001-0001-000000000020', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tle B', 'TB', 'tle', 'B', '2025-2026', 35, 'Salle 702'),
('55555555-0001-0001-0001-000000000021', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tle C', 'TC', 'tle', 'C', '2025-2026', 35, 'Salle 703')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. PROFESSEURS PRINCIPAUX (1 par classe = 21)
-- On assigne les profs de manière cyclique
-- =====================================================

INSERT INTO class_teachers (teacher_id, class_id, is_main_teacher) VALUES
-- 6ème
('22222222-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000001', true), -- Sylvie PP 6A
('22222222-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000002', true), -- André PP 6B
('22222222-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000003', true), -- Grace PP 6C
-- 5ème
('22222222-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000004', true), -- Pierre PP 5A
('22222222-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000005', true), -- Marc PP 5B
('22222222-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000006', true), -- Jeanne PP 5C
-- 4ème
('22222222-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000007', true), -- Augustin PP 4A
('22222222-0001-0001-0001-000000000008', '55555555-0001-0001-0001-000000000008', true), -- Carmen PP 4B
('22222222-0001-0001-0001-000000000009', '55555555-0001-0001-0001-000000000009', true), -- Dieudonné PP 4C
-- 3ème
('22222222-0001-0001-0001-000000000010', '55555555-0001-0001-0001-000000000010', true), -- Lucie PP 3A
('22222222-0001-0001-0001-000000000011', '55555555-0001-0001-0001-000000000011', true), -- Patrice PP 3B
('22222222-0001-0001-0001-000000000012', '55555555-0001-0001-0001-000000000012', true), -- Stéphane PP 3C
-- 2nde
('22222222-0001-0001-0001-000000000013', '55555555-0001-0001-0001-000000000013', true), -- Thérèse PP 2A
('22222222-0001-0001-0001-000000000014', '55555555-0001-0001-0001-000000000014', true), -- Grégoire PP 2B
('22222222-0001-0001-0001-000000000015', '55555555-0001-0001-0001-000000000015', true), -- Hans PP 2C
-- 1ère
('22222222-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000016', true), -- Sylvie PP 1A
('22222222-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000017', true), -- André PP 1B
('22222222-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000018', true), -- Grace PP 1C
-- Tle
('22222222-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000019', true), -- Augustin PP TleA
('22222222-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000020', true), -- Marc PP TleB
('22222222-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000021', true)  -- Jeanne PP TleC
ON CONFLICT DO NOTHING;

-- Vérification
SELECT 'Subjects: ' || COUNT(*) FROM subjects;
SELECT 'Classes: ' || COUNT(*) FROM classes;
-- =====================================================
-- SEED DATA: ELEVES (147 = 21 classes x 7 élèves)
-- College-Lycée Excellence du Gabon
-- Noms gabonais réalistes
-- =====================================================

-- Noms de famille gabonais courants
-- NZOGHE, OBAME, NGUEMA, ONDO, EYENE, MBOUMBA, ESSONO, MBA, OVONO, 
-- NTOUTOUME, MINKO, MEYO, ELLA, NDONG, ASSOUMOU, BIBANG, MOUSSAVOU, 
-- AKURE, BOUANGA, EDOU, EYANG, KOUMBA, OYONO, NZAMBA, EVOUNA

-- Prénoms masculins gabonais
-- Jean, Pierre, Paul, André, Marc, Patrick, Stéphane, Dieudonné, 
-- Albert, Grégoire, Augustin, Robert, François, Michel, Emmanuel

-- Prénoms féminins gabonais
-- Marie, Claire, Sylvie, Grace, Jeanne, Carmen, Lucie, Thérèse,
-- Françoise, Marthe, Pauline, Rosalie, Béatrice, Angèle, Bernadette

-- =====================================================
-- 6ème A (7 élèves) - IDs: 66660001-xxxx
-- =====================================================
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660001-0001-0001-0001-000000000001', 'jean.nzoghe.6a@idetude.ga', '{"first_name": "Jean", "last_name": "NZOGHE"}'::jsonb),
('66660001-0001-0001-0001-000000000002', 'marie.obame.6a@idetude.ga', '{"first_name": "Marie", "last_name": "OBAME"}'::jsonb),
('66660001-0001-0001-0001-000000000003', 'pierre.nguema.6a@idetude.ga', '{"first_name": "Pierre", "last_name": "NGUEMA"}'::jsonb),
('66660001-0001-0001-0001-000000000004', 'claire.ondo.6a@idetude.ga', '{"first_name": "Claire", "last_name": "ONDO"}'::jsonb),
('66660001-0001-0001-0001-000000000005', 'paul.eyene.6a@idetude.ga', '{"first_name": "Paul", "last_name": "EYENE"}'::jsonb),
('66660001-0001-0001-0001-000000000006', 'sylvie.mboumba.6a@idetude.ga', '{"first_name": "Sylvie", "last_name": "MBOUMBA"}'::jsonb),
('66660001-0001-0001-0001-000000000007', 'andre.essono.6a@idetude.ga', '{"first_name": "André", "last_name": "ESSONO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('66660001-0001-0001-0001-000000000001', 'jean.nzoghe.6a@idetude.ga', 'Jean', 'NZOGHE', true),
('66660001-0001-0001-0001-000000000002', 'marie.obame.6a@idetude.ga', 'Marie', 'OBAME', true),
('66660001-0001-0001-0001-000000000003', 'pierre.nguema.6a@idetude.ga', 'Pierre', 'NGUEMA', true),
('66660001-0001-0001-0001-000000000004', 'claire.ondo.6a@idetude.ga', 'Claire', 'ONDO', true),
('66660001-0001-0001-0001-000000000005', 'paul.eyene.6a@idetude.ga', 'Paul', 'EYENE', true),
('66660001-0001-0001-0001-000000000006', 'sylvie.mboumba.6a@idetude.ga', 'Sylvie', 'MBOUMBA', true),
('66660001-0001-0001-0001-000000000007', 'andre.essono.6a@idetude.ga', 'André', 'ESSONO', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id::text LIKE '66660001%' ON CONFLICT DO NOTHING;

INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660001-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000001', '2025-2026', '6A-001', true),
('66660001-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000001', '2025-2026', '6A-002', false),
('66660001-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000001', '2025-2026', '6A-003', false),
('66660001-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000001', '2025-2026', '6A-004', false),
('66660001-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000001', '2025-2026', '6A-005', false),
('66660001-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000001', '2025-2026', '6A-006', false),
('66660001-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000001', '2025-2026', '6A-007', false)
ON CONFLICT DO NOTHING;

INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id::text LIKE '66660001%' ON CONFLICT DO NOTHING;

-- =====================================================
-- 6ème B (7 élèves) - IDs: 66660002-xxxx
-- =====================================================
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660002-0001-0001-0001-000000000001', 'grace.mba.6b@idetude.ga', '{"first_name": "Grace", "last_name": "MBA"}'::jsonb),
('66660002-0001-0001-0001-000000000002', 'patrick.ovono.6b@idetude.ga', '{"first_name": "Patrick", "last_name": "OVONO"}'::jsonb),
('66660002-0001-0001-0001-000000000003', 'jeanne.ntoutoume.6b@idetude.ga', '{"first_name": "Jeanne", "last_name": "NTOUTOUME"}'::jsonb),
('66660002-0001-0001-0001-000000000004', 'stephane.minko.6b@idetude.ga', '{"first_name": "Stéphane", "last_name": "MINKO"}'::jsonb),
('66660002-0001-0001-0001-000000000005', 'carmen.meyo.6b@idetude.ga', '{"first_name": "Carmen", "last_name": "MEYO"}'::jsonb),
('66660002-0001-0001-0001-000000000006', 'dieudonne.ella.6b@idetude.ga', '{"first_name": "Dieudonné", "last_name": "ELLA"}'::jsonb),
('66660002-0001-0001-0001-000000000007', 'lucie.ndong.6b@idetude.ga', '{"first_name": "Lucie", "last_name": "NDONG"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('66660002-0001-0001-0001-000000000001', 'grace.mba.6b@idetude.ga', 'Grace', 'MBA', true),
('66660002-0001-0001-0001-000000000002', 'patrick.ovono.6b@idetude.ga', 'Patrick', 'OVONO', true),
('66660002-0001-0001-0001-000000000003', 'jeanne.ntoutoume.6b@idetude.ga', 'Jeanne', 'NTOUTOUME', true),
('66660002-0001-0001-0001-000000000004', 'stephane.minko.6b@idetude.ga', 'Stéphane', 'MINKO', true),
('66660002-0001-0001-0001-000000000005', 'carmen.meyo.6b@idetude.ga', 'Carmen', 'MEYO', true),
('66660002-0001-0001-0001-000000000006', 'dieudonne.ella.6b@idetude.ga', 'Dieudonné', 'ELLA', true),
('66660002-0001-0001-0001-000000000007', 'lucie.ndong.6b@idetude.ga', 'Lucie', 'NDONG', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id::text LIKE '66660002%' ON CONFLICT DO NOTHING;

INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660002-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000002', '2025-2026', '6B-001', true),
('66660002-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000002', '2025-2026', '6B-002', false),
('66660002-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000002', '2025-2026', '6B-003', false),
('66660002-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000002', '2025-2026', '6B-004', false),
('66660002-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000002', '2025-2026', '6B-005', false),
('66660002-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000002', '2025-2026', '6B-006', false),
('66660002-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000002', '2025-2026', '6B-007', false)
ON CONFLICT DO NOTHING;

INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id::text LIKE '66660002%' ON CONFLICT DO NOTHING;

-- =====================================================
-- 6ème C (7 élèves) - IDs: 66660003-xxxx
-- =====================================================
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660003-0001-0001-0001-000000000001', 'albert.assoumou.6c@idetude.ga', '{"first_name": "Albert", "last_name": "ASSOUMOU"}'::jsonb),
('66660003-0001-0001-0001-000000000002', 'therese.bibang.6c@idetude.ga', '{"first_name": "Thérèse", "last_name": "BIBANG"}'::jsonb),
('66660003-0001-0001-0001-000000000003', 'gregoire.moussavou.6c@idetude.ga', '{"first_name": "Grégoire", "last_name": "MOUSSAVOU"}'::jsonb),
('66660003-0001-0001-0001-000000000004', 'francoise.akure.6c@idetude.ga', '{"first_name": "Françoise", "last_name": "AKURE"}'::jsonb),
('66660003-0001-0001-0001-000000000005', 'robert.bouanga.6c@idetude.ga', '{"first_name": "Robert", "last_name": "BOUANGA"}'::jsonb),
('66660003-0001-0001-0001-000000000006', 'marthe.edou.6c@idetude.ga', '{"first_name": "Marthe", "last_name": "EDOU"}'::jsonb),
('66660003-0001-0001-0001-000000000007', 'michel.eyang.6c@idetude.ga', '{"first_name": "Michel", "last_name": "EYANG"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('66660003-0001-0001-0001-000000000001', 'albert.assoumou.6c@idetude.ga', 'Albert', 'ASSOUMOU', true),
('66660003-0001-0001-0001-000000000002', 'therese.bibang.6c@idetude.ga', 'Thérèse', 'BIBANG', true),
('66660003-0001-0001-0001-000000000003', 'gregoire.moussavou.6c@idetude.ga', 'Grégoire', 'MOUSSAVOU', true),
('66660003-0001-0001-0001-000000000004', 'francoise.akure.6c@idetude.ga', 'Françoise', 'AKURE', true),
('66660003-0001-0001-0001-000000000005', 'robert.bouanga.6c@idetude.ga', 'Robert', 'BOUANGA', true),
('66660003-0001-0001-0001-000000000006', 'marthe.edou.6c@idetude.ga', 'Marthe', 'EDOU', true),
('66660003-0001-0001-0001-000000000007', 'michel.eyang.6c@idetude.ga', 'Michel', 'EYANG', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id::text LIKE '66660003%' ON CONFLICT DO NOTHING;

INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660003-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000003', '2025-2026', '6C-001', true),
('66660003-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000003', '2025-2026', '6C-002', false),
('66660003-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000003', '2025-2026', '6C-003', false),
('66660003-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000003', '2025-2026', '6C-004', false),
('66660003-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000003', '2025-2026', '6C-005', false),
('66660003-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000003', '2025-2026', '6C-006', false),
('66660003-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000003', '2025-2026', '6C-007', false)
ON CONFLICT DO NOTHING;

INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id::text LIKE '66660003%' ON CONFLICT DO NOTHING;

-- =====================================================
-- 5ème A (7 élèves) - IDs: 66660004-xxxx
-- =====================================================
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660004-0001-0001-0001-000000000001', 'emmanuel.koumba.5a@idetude.ga', '{"first_name": "Emmanuel", "last_name": "KOUMBA"}'::jsonb),
('66660004-0001-0001-0001-000000000002', 'pauline.oyono.5a@idetude.ga', '{"first_name": "Pauline", "last_name": "OYONO"}'::jsonb),
('66660004-0001-0001-0001-000000000003', 'francois.nzamba.5a@idetude.ga', '{"first_name": "François", "last_name": "NZAMBA"}'::jsonb),
('66660004-0001-0001-0001-000000000004', 'rosalie.evouna.5a@idetude.ga', '{"first_name": "Rosalie", "last_name": "EVOUNA"}'::jsonb),
('66660004-0001-0001-0001-000000000005', 'jean.nzoghe.5a@idetude.ga', '{"first_name": "Jean-Marc", "last_name": "NZOGHE"}'::jsonb),
('66660004-0001-0001-0001-000000000006', 'beatrice.obame.5a@idetude.ga', '{"first_name": "Béatrice", "last_name": "OBAME"}'::jsonb),
('66660004-0001-0001-0001-000000000007', 'pierre.nguema.5a@idetude.ga', '{"first_name": "Pierre-Louis", "last_name": "NGUEMA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('66660004-0001-0001-0001-000000000001', 'emmanuel.koumba.5a@idetude.ga', 'Emmanuel', 'KOUMBA', true),
('66660004-0001-0001-0001-000000000002', 'pauline.oyono.5a@idetude.ga', 'Pauline', 'OYONO', true),
('66660004-0001-0001-0001-000000000003', 'francois.nzamba.5a@idetude.ga', 'François', 'NZAMBA', true),
('66660004-0001-0001-0001-000000000004', 'rosalie.evouna.5a@idetude.ga', 'Rosalie', 'EVOUNA', true),
('66660004-0001-0001-0001-000000000005', 'jean.nzoghe.5a@idetude.ga', 'Jean-Marc', 'NZOGHE', true),
('66660004-0001-0001-0001-000000000006', 'beatrice.obame.5a@idetude.ga', 'Béatrice', 'OBAME', true),
('66660004-0001-0001-0001-000000000007', 'pierre.nguema.5a@idetude.ga', 'Pierre-Louis', 'NGUEMA', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id::text LIKE '66660004%' ON CONFLICT DO NOTHING;

INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660004-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000004', '2025-2026', '5A-001', true),
('66660004-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000004', '2025-2026', '5A-002', false),
('66660004-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000004', '2025-2026', '5A-003', false),
('66660004-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000004', '2025-2026', '5A-004', false),
('66660004-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000004', '2025-2026', '5A-005', false),
('66660004-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000004', '2025-2026', '5A-006', false),
('66660004-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000004', '2025-2026', '5A-007', false)
ON CONFLICT DO NOTHING;

INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id::text LIKE '66660004%' ON CONFLICT DO NOTHING;

-- =====================================================
-- 5ème B (7 élèves) - IDs: 66660005-xxxx
-- =====================================================
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660005-0001-0001-0001-000000000001', 'angele.ondo.5b@idetude.ga', '{"first_name": "Angèle", "last_name": "ONDO"}'::jsonb),
('66660005-0001-0001-0001-000000000002', 'paul.eyene.5b@idetude.ga', '{"first_name": "Paul-André", "last_name": "EYENE"}'::jsonb),
('66660005-0001-0001-0001-000000000003', 'bernadette.mboumba.5b@idetude.ga', '{"first_name": "Bernadette", "last_name": "MBOUMBA"}'::jsonb),
('66660005-0001-0001-0001-000000000004', 'andre.essono.5b@idetude.ga', '{"first_name": "André-Marie", "last_name": "ESSONO"}'::jsonb),
('66660005-0001-0001-0001-000000000005', 'marie.mba.5b@idetude.ga', '{"first_name": "Marie-Claire", "last_name": "MBA"}'::jsonb),
('66660005-0001-0001-0001-000000000006', 'patrick.ovono.5b@idetude.ga', '{"first_name": "Patrick-Michel", "last_name": "OVONO"}'::jsonb),
('66660005-0001-0001-0001-000000000007', 'jeanne.ntoutoume.5b@idetude.ga', '{"first_name": "Jeanne-Marie", "last_name": "NTOUTOUME"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('66660005-0001-0001-0001-000000000001', 'angele.ondo.5b@idetude.ga', 'Angèle', 'ONDO', true),
('66660005-0001-0001-0001-000000000002', 'paul.eyene.5b@idetude.ga', 'Paul-André', 'EYENE', true),
('66660005-0001-0001-0001-000000000003', 'bernadette.mboumba.5b@idetude.ga', 'Bernadette', 'MBOUMBA', true),
('66660005-0001-0001-0001-000000000004', 'andre.essono.5b@idetude.ga', 'André-Marie', 'ESSONO', true),
('66660005-0001-0001-0001-000000000005', 'marie.mba.5b@idetude.ga', 'Marie-Claire', 'MBA', true),
('66660005-0001-0001-0001-000000000006', 'patrick.ovono.5b@idetude.ga', 'Patrick-Michel', 'OVONO', true),
('66660005-0001-0001-0001-000000000007', 'jeanne.ntoutoume.5b@idetude.ga', 'Jeanne-Marie', 'NTOUTOUME', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id::text LIKE '66660005%' ON CONFLICT DO NOTHING;

INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660005-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000005', '2025-2026', '5B-001', true),
('66660005-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000005', '2025-2026', '5B-002', false),
('66660005-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000005', '2025-2026', '5B-003', false),
('66660005-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000005', '2025-2026', '5B-004', false),
('66660005-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000005', '2025-2026', '5B-005', false),
('66660005-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000005', '2025-2026', '5B-006', false),
('66660005-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000005', '2025-2026', '5B-007', false)
ON CONFLICT DO NOTHING;

INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id::text LIKE '66660005%' ON CONFLICT DO NOTHING;

-- =====================================================
-- Suite des classes (5C -> Tle C)
-- Pattern similaire pour les 16 classes restantes
-- =====================================================

-- 5ème C (7 élèves) - IDs: 66660006-xxxx
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660006-0001-0001-0001-000000000001', 'stephane.minko.5c@idetude.ga', '{"first_name": "Stéphane", "last_name": "MINKO"}'::jsonb),
('66660006-0001-0001-0001-000000000002', 'carmen.meyo.5c@idetude.ga', '{"first_name": "Carmen-Lucie", "last_name": "MEYO"}'::jsonb),
('66660006-0001-0001-0001-000000000003', 'dieudonne.ella.5c@idetude.ga', '{"first_name": "Dieudonné-Marc", "last_name": "ELLA"}'::jsonb),
('66660006-0001-0001-0001-000000000004', 'lucie.ndong.5c@idetude.ga', '{"first_name": "Lucie-Marie", "last_name": "NDONG"}'::jsonb),
('66660006-0001-0001-0001-000000000005', 'albert.assoumou.5c@idetude.ga', '{"first_name": "Albert-Paul", "last_name": "ASSOUMOU"}'::jsonb),
('66660006-0001-0001-0001-000000000006', 'therese.bibang.5c@idetude.ga', '{"first_name": "Thérèse-Claire", "last_name": "BIBANG"}'::jsonb),
('66660006-0001-0001-0001-000000000007', 'gregoire.moussavou.5c@idetude.ga', '{"first_name": "Grégoire-Pierre", "last_name": "MOUSSAVOU"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, first_name, last_name, is_demo) VALUES
('66660006-0001-0001-0001-000000000001', 'stephane.minko.5c@idetude.ga', 'Stéphane', 'MINKO', true),
('66660006-0001-0001-0001-000000000002', 'carmen.meyo.5c@idetude.ga', 'Carmen-Lucie', 'MEYO', true),
('66660006-0001-0001-0001-000000000003', 'dieudonne.ella.5c@idetude.ga', 'Dieudonné-Marc', 'ELLA', true),
('66660006-0001-0001-0001-000000000004', 'lucie.ndong.5c@idetude.ga', 'Lucie-Marie', 'NDONG', true),
('66660006-0001-0001-0001-000000000005', 'albert.assoumou.5c@idetude.ga', 'Albert-Paul', 'ASSOUMOU', true),
('66660006-0001-0001-0001-000000000006', 'therese.bibang.5c@idetude.ga', 'Thérèse-Claire', 'BIBANG', true),
('66660006-0001-0001-0001-000000000007', 'gregoire.moussavou.5c@idetude.ga', 'Grégoire-Pierre', 'MOUSSAVOU', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id::text LIKE '66660006%' ON CONFLICT DO NOTHING;

INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660006-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000006', '2025-2026', '5C-001', true),
('66660006-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000006', '2025-2026', '5C-002', false),
('66660006-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000006', '2025-2026', '5C-003', false),
('66660006-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000006', '2025-2026', '5C-004', false),
('66660006-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000006', '2025-2026', '5C-005', false),
('66660006-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000006', '2025-2026', '5C-006', false),
('66660006-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000006', '2025-2026', '5C-007', false)
ON CONFLICT DO NOTHING;

INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id::text LIKE '66660006%' ON CONFLICT DO NOTHING;

-- Vérification partielle (les classes suivantes seront générées dans la partie 2)
SELECT 'Students Part 1 completed: ' || COUNT(*) || ' students (6 classes)' AS status FROM class_students;
-- =====================================================
-- SEED DATA: ELEVES (Suite 4ème -> Terminale)
-- Génération compacte avec pattern
-- =====================================================

-- 4ème A-C (21 élèves)
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660007-0001-0001-0001-000000000001', 'eleve001.4a@idetude.ga', '{"first_name": "Marc", "last_name": "AKURE"}'::jsonb),
('66660007-0001-0001-0001-000000000002', 'eleve002.4a@idetude.ga', '{"first_name": "Sylvie", "last_name": "BOUANGA"}'::jsonb),
('66660007-0001-0001-0001-000000000003', 'eleve003.4a@idetude.ga', '{"first_name": "Jean", "last_name": "EDOU"}'::jsonb),
('66660007-0001-0001-0001-000000000004', 'eleve004.4a@idetude.ga', '{"first_name": "Claire", "last_name": "EYANG"}'::jsonb),
('66660007-0001-0001-0001-000000000005', 'eleve005.4a@idetude.ga', '{"first_name": "Paul", "last_name": "KOUMBA"}'::jsonb),
('66660007-0001-0001-0001-000000000006', 'eleve006.4a@idetude.ga', '{"first_name": "Marie", "last_name": "OYONO"}'::jsonb),
('66660007-0001-0001-0001-000000000007', 'eleve007.4a@idetude.ga', '{"first_name": "André", "last_name": "NZAMBA"}'::jsonb),
('66660008-0001-0001-0001-000000000001', 'eleve001.4b@idetude.ga', '{"first_name": "Grace", "last_name": "EVOUNA"}'::jsonb),
('66660008-0001-0001-0001-000000000002', 'eleve002.4b@idetude.ga', '{"first_name": "Patrick", "last_name": "NZOGHE"}'::jsonb),
('66660008-0001-0001-0001-000000000003', 'eleve003.4b@idetude.ga', '{"first_name": "Jeanne", "last_name": "OBAME"}'::jsonb),
('66660008-0001-0001-0001-000000000004', 'eleve004.4b@idetude.ga', '{"first_name": "Stéphane", "last_name": "NGUEMA"}'::jsonb),
('66660008-0001-0001-0001-000000000005', 'eleve005.4b@idetude.ga', '{"first_name": "Carmen", "last_name": "ONDO"}'::jsonb),
('66660008-0001-0001-0001-000000000006', 'eleve006.4b@idetude.ga', '{"first_name": "Dieudonné", "last_name": "EYENE"}'::jsonb),
('66660008-0001-0001-0001-000000000007', 'eleve007.4b@idetude.ga', '{"first_name": "Lucie", "last_name": "MBOUMBA"}'::jsonb),
('66660009-0001-0001-0001-000000000001', 'eleve001.4c@idetude.ga', '{"first_name": "Albert", "last_name": "ESSONO"}'::jsonb),
('66660009-0001-0001-0001-000000000002', 'eleve002.4c@idetude.ga', '{"first_name": "Thérèse", "last_name": "MBA"}'::jsonb),
('66660009-0001-0001-0001-000000000003', 'eleve003.4c@idetude.ga', '{"first_name": "Grégoire", "last_name": "OVONO"}'::jsonb),
('66660009-0001-0001-0001-000000000004', 'eleve004.4c@idetude.ga', '{"first_name": "Françoise", "last_name": "NTOUTOUME"}'::jsonb),
('66660009-0001-0001-0001-000000000005', 'eleve005.4c@idetude.ga', '{"first_name": "Robert", "last_name": "MINKO"}'::jsonb),
('66660009-0001-0001-0001-000000000006', 'eleve006.4c@idetude.ga', '{"first_name": "Marthe", "last_name": "MEYO"}'::jsonb),
('66660009-0001-0001-0001-000000000007', 'eleve007.4c@idetude.ga', '{"first_name": "Michel", "last_name": "ELLA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Profiles 4ème
INSERT INTO profiles (id, email, first_name, last_name, is_demo)
SELECT id, email, raw_user_meta_data->>'first_name', raw_user_meta_data->>'last_name', true
FROM auth.users WHERE id::text LIKE '6666000%' AND id NOT IN (SELECT id FROM profiles) ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id::text LIKE '6666000%' ON CONFLICT DO NOTHING;

-- Class assignments 4ème
INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660007-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000007', '2025-2026', '4A-001', true),
('66660007-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000007', '2025-2026', '4A-002', false),
('66660007-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000007', '2025-2026', '4A-003', false),
('66660007-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000007', '2025-2026', '4A-004', false),
('66660007-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000007', '2025-2026', '4A-005', false),
('66660007-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000007', '2025-2026', '4A-006', false),
('66660007-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000007', '2025-2026', '4A-007', false),
('66660008-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000008', '2025-2026', '4B-001', true),
('66660008-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000008', '2025-2026', '4B-002', false),
('66660008-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000008', '2025-2026', '4B-003', false),
('66660008-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000008', '2025-2026', '4B-004', false),
('66660008-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000008', '2025-2026', '4B-005', false),
('66660008-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000008', '2025-2026', '4B-006', false),
('66660008-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000008', '2025-2026', '4B-007', false),
('66660009-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000009', '2025-2026', '4C-001', true),
('66660009-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000009', '2025-2026', '4C-002', false),
('66660009-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000009', '2025-2026', '4C-003', false),
('66660009-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000009', '2025-2026', '4C-004', false),
('66660009-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000009', '2025-2026', '4C-005', false),
('66660009-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000009', '2025-2026', '4C-006', false),
('66660009-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000009', '2025-2026', '4C-007', false)
ON CONFLICT DO NOTHING;

-- Establishment links
INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id::text LIKE '6666000%' ON CONFLICT DO NOTHING;

-- 3ème A-C (21 élèves) IDs: 66660010-12
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660010-0001-0001-0001-000000000001', 'eleve001.3a@idetude.ga', '{"first_name": "Emmanuel", "last_name": "NDONG"}'::jsonb),
('66660010-0001-0001-0001-000000000002', 'eleve002.3a@idetude.ga', '{"first_name": "Pauline", "last_name": "ASSOUMOU"}'::jsonb),
('66660010-0001-0001-0001-000000000003', 'eleve003.3a@idetude.ga', '{"first_name": "François", "last_name": "BIBANG"}'::jsonb),
('66660010-0001-0001-0001-000000000004', 'eleve004.3a@idetude.ga', '{"first_name": "Rosalie", "last_name": "MOUSSAVOU"}'::jsonb),
('66660010-0001-0001-0001-000000000005', 'eleve005.3a@idetude.ga', '{"first_name": "Jean-Marc", "last_name": "AKURE"}'::jsonb),
('66660010-0001-0001-0001-000000000006', 'eleve006.3a@idetude.ga', '{"first_name": "Béatrice", "last_name": "BOUANGA"}'::jsonb),
('66660010-0001-0001-0001-000000000007', 'eleve007.3a@idetude.ga', '{"first_name": "Pierre-Louis", "last_name": "EDOU"}'::jsonb),
('66660011-0001-0001-0001-000000000001', 'eleve001.3b@idetude.ga', '{"first_name": "Angèle", "last_name": "EYANG"}'::jsonb),
('66660011-0001-0001-0001-000000000002', 'eleve002.3b@idetude.ga', '{"first_name": "Paul-André", "last_name": "KOUMBA"}'::jsonb),
('66660011-0001-0001-0001-000000000003', 'eleve003.3b@idetude.ga', '{"first_name": "Bernadette", "last_name": "OYONO"}'::jsonb),
('66660011-0001-0001-0001-000000000004', 'eleve004.3b@idetude.ga', '{"first_name": "André-Marie", "last_name": "NZAMBA"}'::jsonb),
('66660011-0001-0001-0001-000000000005', 'eleve005.3b@idetude.ga', '{"first_name": "Marie-Claire", "last_name": "EVOUNA"}'::jsonb),
('66660011-0001-0001-0001-000000000006', 'eleve006.3b@idetude.ga', '{"first_name": "Patrick-Michel", "last_name": "NZOGHE"}'::jsonb),
('66660011-0001-0001-0001-000000000007', 'eleve007.3b@idetude.ga', '{"first_name": "Jeanne-Marie", "last_name": "OBAME"}'::jsonb),
('66660012-0001-0001-0001-000000000001', 'eleve001.3c@idetude.ga', '{"first_name": "Stéphane-Marc", "last_name": "NGUEMA"}'::jsonb),
('66660012-0001-0001-0001-000000000002', 'eleve002.3c@idetude.ga', '{"first_name": "Carmen-Lucie", "last_name": "ONDO"}'::jsonb),
('66660012-0001-0001-0001-000000000003', 'eleve003.3c@idetude.ga', '{"first_name": "Dieudonné-Marc", "last_name": "EYENE"}'::jsonb),
('66660012-0001-0001-0001-000000000004', 'eleve004.3c@idetude.ga', '{"first_name": "Lucie-Marie", "last_name": "MBOUMBA"}'::jsonb),
('66660012-0001-0001-0001-000000000005', 'eleve005.3c@idetude.ga', '{"first_name": "Albert-Paul", "last_name": "ESSONO"}'::jsonb),
('66660012-0001-0001-0001-000000000006', 'eleve006.3c@idetude.ga', '{"first_name": "Thérèse-Claire", "last_name": "MBA"}'::jsonb),
('66660012-0001-0001-0001-000000000007', 'eleve007.3c@idetude.ga', '{"first_name": "Grégoire-Pierre", "last_name": "OVONO"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Class assignments 3ème
INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660010-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000010', '2025-2026', '3A-001', true),
('66660010-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000010', '2025-2026', '3A-002', false),
('66660010-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000010', '2025-2026', '3A-003', false),
('66660010-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000010', '2025-2026', '3A-004', false),
('66660010-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000010', '2025-2026', '3A-005', false),
('66660010-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000010', '2025-2026', '3A-006', false),
('66660010-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000010', '2025-2026', '3A-007', false),
('66660011-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000011', '2025-2026', '3B-001', true),
('66660011-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000011', '2025-2026', '3B-002', false),
('66660011-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000011', '2025-2026', '3B-003', false),
('66660011-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000011', '2025-2026', '3B-004', false),
('66660011-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000011', '2025-2026', '3B-005', false),
('66660011-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000011', '2025-2026', '3B-006', false),
('66660011-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000011', '2025-2026', '3B-007', false),
('66660012-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000012', '2025-2026', '3C-001', true),
('66660012-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000012', '2025-2026', '3C-002', false),
('66660012-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000012', '2025-2026', '3C-003', false),
('66660012-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000012', '2025-2026', '3C-004', false),
('66660012-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000012', '2025-2026', '3C-005', false),
('66660012-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000012', '2025-2026', '3C-006', false),
('66660012-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000012', '2025-2026', '3C-007', false)
ON CONFLICT DO NOTHING;

SELECT 'Students 4eme+3eme completed' AS status;
-- =====================================================
-- SEED DATA: ELEVES LYCEE (2nde, 1ère, Terminale)
-- 63 élèves (9 classes x 7 élèves)
-- =====================================================

-- 2nde A-C (21 élèves) IDs: 66660013-15
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660013-0001-0001-0001-000000000001', 'eleve001.2a@idetude.ga', '{"first_name": "Jean", "last_name": "NTOUTOUME"}'::jsonb),
('66660013-0001-0001-0001-000000000002', 'eleve002.2a@idetude.ga', '{"first_name": "Marie", "last_name": "MINKO"}'::jsonb),
('66660013-0001-0001-0001-000000000003', 'eleve003.2a@idetude.ga', '{"first_name": "Pierre", "last_name": "MEYO"}'::jsonb),
('66660013-0001-0001-0001-000000000004', 'eleve004.2a@idetude.ga', '{"first_name": "Claire", "last_name": "ELLA"}'::jsonb),
('66660013-0001-0001-0001-000000000005', 'eleve005.2a@idetude.ga', '{"first_name": "Paul", "last_name": "NDONG"}'::jsonb),
('66660013-0001-0001-0001-000000000006', 'eleve006.2a@idetude.ga', '{"first_name": "Sylvie", "last_name": "ASSOUMOU"}'::jsonb),
('66660013-0001-0001-0001-000000000007', 'eleve007.2a@idetude.ga', '{"first_name": "André", "last_name": "BIBANG"}'::jsonb),
('66660014-0001-0001-0001-000000000001', 'eleve001.2b@idetude.ga', '{"first_name": "Grace", "last_name": "MOUSSAVOU"}'::jsonb),
('66660014-0001-0001-0001-000000000002', 'eleve002.2b@idetude.ga', '{"first_name": "Patrick", "last_name": "AKURE"}'::jsonb),
('66660014-0001-0001-0001-000000000003', 'eleve003.2b@idetude.ga', '{"first_name": "Jeanne", "last_name": "BOUANGA"}'::jsonb),
('66660014-0001-0001-0001-000000000004', 'eleve004.2b@idetude.ga', '{"first_name": "Stéphane", "last_name": "EDOU"}'::jsonb),
('66660014-0001-0001-0001-000000000005', 'eleve005.2b@idetude.ga', '{"first_name": "Carmen", "last_name": "EYANG"}'::jsonb),
('66660014-0001-0001-0001-000000000006', 'eleve006.2b@idetude.ga', '{"first_name": "Dieudonné", "last_name": "KOUMBA"}'::jsonb),
('66660014-0001-0001-0001-000000000007', 'eleve007.2b@idetude.ga', '{"first_name": "Lucie", "last_name": "OYONO"}'::jsonb),
('66660015-0001-0001-0001-000000000001', 'eleve001.2c@idetude.ga', '{"first_name": "Albert", "last_name": "NZAMBA"}'::jsonb),
('66660015-0001-0001-0001-000000000002', 'eleve002.2c@idetude.ga', '{"first_name": "Thérèse", "last_name": "EVOUNA"}'::jsonb),
('66660015-0001-0001-0001-000000000003', 'eleve003.2c@idetude.ga', '{"first_name": "Grégoire", "last_name": "NZOGHE"}'::jsonb),
('66660015-0001-0001-0001-000000000004', 'eleve004.2c@idetude.ga', '{"first_name": "Françoise", "last_name": "OBAME"}'::jsonb),
('66660015-0001-0001-0001-000000000005', 'eleve005.2c@idetude.ga', '{"first_name": "Robert", "last_name": "NGUEMA"}'::jsonb),
('66660015-0001-0001-0001-000000000006', 'eleve006.2c@idetude.ga', '{"first_name": "Marthe", "last_name": "ONDO"}'::jsonb),
('66660015-0001-0001-0001-000000000007', 'eleve007.2c@idetude.ga', '{"first_name": "Michel", "last_name": "EYENE"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 1ère A-C (21 élèves) IDs: 66660016-18
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660016-0001-0001-0001-000000000001', 'eleve001.1a@idetude.ga', '{"first_name": "Emmanuel", "last_name": "MBOUMBA"}'::jsonb),
('66660016-0001-0001-0001-000000000002', 'eleve002.1a@idetude.ga', '{"first_name": "Pauline", "last_name": "ESSONO"}'::jsonb),
('66660016-0001-0001-0001-000000000003', 'eleve003.1a@idetude.ga', '{"first_name": "François", "last_name": "MBA"}'::jsonb),
('66660016-0001-0001-0001-000000000004', 'eleve004.1a@idetude.ga', '{"first_name": "Rosalie", "last_name": "OVONO"}'::jsonb),
('66660016-0001-0001-0001-000000000005', 'eleve005.1a@idetude.ga', '{"first_name": "Jean-Marc", "last_name": "NTOUTOUME"}'::jsonb),
('66660016-0001-0001-0001-000000000006', 'eleve006.1a@idetude.ga', '{"first_name": "Béatrice", "last_name": "MINKO"}'::jsonb),
('66660016-0001-0001-0001-000000000007', 'eleve007.1a@idetude.ga', '{"first_name": "Pierre-Louis", "last_name": "MEYO"}'::jsonb),
('66660017-0001-0001-0001-000000000001', 'eleve001.1b@idetude.ga', '{"first_name": "Angèle", "last_name": "ELLA"}'::jsonb),
('66660017-0001-0001-0001-000000000002', 'eleve002.1b@idetude.ga', '{"first_name": "Paul-André", "last_name": "NDONG"}'::jsonb),
('66660017-0001-0001-0001-000000000003', 'eleve003.1b@idetude.ga', '{"first_name": "Bernadette", "last_name": "ASSOUMOU"}'::jsonb),
('66660017-0001-0001-0001-000000000004', 'eleve004.1b@idetude.ga', '{"first_name": "André-Marie", "last_name": "BIBANG"}'::jsonb),
('66660017-0001-0001-0001-000000000005', 'eleve005.1b@idetude.ga', '{"first_name": "Marie-Claire", "last_name": "MOUSSAVOU"}'::jsonb),
('66660017-0001-0001-0001-000000000006', 'eleve006.1b@idetude.ga', '{"first_name": "Patrick-Michel", "last_name": "AKURE"}'::jsonb),
('66660017-0001-0001-0001-000000000007', 'eleve007.1b@idetude.ga', '{"first_name": "Jeanne-Marie", "last_name": "BOUANGA"}'::jsonb),
('66660018-0001-0001-0001-000000000001', 'eleve001.1c@idetude.ga', '{"first_name": "Stéphane-Marc", "last_name": "EDOU"}'::jsonb),
('66660018-0001-0001-0001-000000000002', 'eleve002.1c@idetude.ga', '{"first_name": "Carmen-Lucie", "last_name": "EYANG"}'::jsonb),
('66660018-0001-0001-0001-000000000003', 'eleve003.1c@idetude.ga', '{"first_name": "Dieudonné-Marc", "last_name": "KOUMBA"}'::jsonb),
('66660018-0001-0001-0001-000000000004', 'eleve004.1c@idetude.ga', '{"first_name": "Lucie-Marie", "last_name": "OYONO"}'::jsonb),
('66660018-0001-0001-0001-000000000005', 'eleve005.1c@idetude.ga', '{"first_name": "Albert-Paul", "last_name": "NZAMBA"}'::jsonb),
('66660018-0001-0001-0001-000000000006', 'eleve006.1c@idetude.ga', '{"first_name": "Thérèse-Claire", "last_name": "EVOUNA"}'::jsonb),
('66660018-0001-0001-0001-000000000007', 'eleve007.1c@idetude.ga', '{"first_name": "Grégoire-Pierre", "last_name": "NZOGHE"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Terminale A-C (21 élèves) IDs: 66660019-21
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('66660019-0001-0001-0001-000000000001', 'eleve001.ta@idetude.ga', '{"first_name": "Jean-Baptiste", "last_name": "OBAME"}'::jsonb),
('66660019-0001-0001-0001-000000000002', 'eleve002.ta@idetude.ga', '{"first_name": "Marie-Josée", "last_name": "NGUEMA"}'::jsonb),
('66660019-0001-0001-0001-000000000003', 'eleve003.ta@idetude.ga', '{"first_name": "Pierre-Antoine", "last_name": "ONDO"}'::jsonb),
('66660019-0001-0001-0001-000000000004', 'eleve004.ta@idetude.ga', '{"first_name": "Claire-Marie", "last_name": "EYENE"}'::jsonb),
('66660019-0001-0001-0001-000000000005', 'eleve005.ta@idetude.ga', '{"first_name": "Paul-Henri", "last_name": "MBOUMBA"}'::jsonb),
('66660019-0001-0001-0001-000000000006', 'eleve006.ta@idetude.ga', '{"first_name": "Sylvie-Anne", "last_name": "ESSONO"}'::jsonb),
('66660019-0001-0001-0001-000000000007', 'eleve007.ta@idetude.ga', '{"first_name": "André-Marc", "last_name": "MBA"}'::jsonb),
('66660020-0001-0001-0001-000000000001', 'eleve001.tb@idetude.ga', '{"first_name": "Grace-Divine", "last_name": "OVONO"}'::jsonb),
('66660020-0001-0001-0001-000000000002', 'eleve002.tb@idetude.ga', '{"first_name": "Patrick-Jean", "last_name": "NTOUTOUME"}'::jsonb),
('66660020-0001-0001-0001-000000000003', 'eleve003.tb@idetude.ga', '{"first_name": "Jeanne-Lucie", "last_name": "MINKO"}'::jsonb),
('66660020-0001-0001-0001-000000000004', 'eleve004.tb@idetude.ga', '{"first_name": "Stéphane-Paul", "last_name": "MEYO"}'::jsonb),
('66660020-0001-0001-0001-000000000005', 'eleve005.tb@idetude.ga', '{"first_name": "Carmen-Rose", "last_name": "ELLA"}'::jsonb),
('66660020-0001-0001-0001-000000000006', 'eleve006.tb@idetude.ga', '{"first_name": "Dieudonné-Marie", "last_name": "NDONG"}'::jsonb),
('66660020-0001-0001-0001-000000000007', 'eleve007.tb@idetude.ga', '{"first_name": "Lucie-Claire", "last_name": "ASSOUMOU"}'::jsonb),
('66660021-0001-0001-0001-000000000001', 'eleve001.tc@idetude.ga', '{"first_name": "Albert-Jean", "last_name": "BIBANG"}'::jsonb),
('66660021-0001-0001-0001-000000000002', 'eleve002.tc@idetude.ga', '{"first_name": "Thérèse-Marie", "last_name": "MOUSSAVOU"}'::jsonb),
('66660021-0001-0001-0001-000000000003', 'eleve003.tc@idetude.ga', '{"first_name": "Grégoire-Paul", "last_name": "AKURE"}'::jsonb),
('66660021-0001-0001-0001-000000000004', 'eleve004.tc@idetude.ga', '{"first_name": "Françoise-Anne", "last_name": "BOUANGA"}'::jsonb),
('66660021-0001-0001-0001-000000000005', 'eleve005.tc@idetude.ga', '{"first_name": "Robert-Michel", "last_name": "EDOU"}'::jsonb),
('66660021-0001-0001-0001-000000000006', 'eleve006.tc@idetude.ga', '{"first_name": "Marthe-Claire", "last_name": "EYANG"}'::jsonb),
('66660021-0001-0001-0001-000000000007', 'eleve007.tc@idetude.ga', '{"first_name": "Michel-André", "last_name": "KOUMBA"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Profiles for all lycée students
INSERT INTO profiles (id, email, first_name, last_name, is_demo)
SELECT id, email, raw_user_meta_data->>'first_name', raw_user_meta_data->>'last_name', true
FROM auth.users WHERE id::text LIKE '666600%' AND id NOT IN (SELECT id FROM profiles) ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id::text LIKE '666600%' ON CONFLICT DO NOTHING;

-- Class assignments 2nde
INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660013-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000013', '2025-2026', '2A-001', true),
('66660013-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000013', '2025-2026', '2A-002', false),
('66660013-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000013', '2025-2026', '2A-003', false),
('66660013-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000013', '2025-2026', '2A-004', false),
('66660013-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000013', '2025-2026', '2A-005', false),
('66660013-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000013', '2025-2026', '2A-006', false),
('66660013-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000013', '2025-2026', '2A-007', false),
('66660014-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000014', '2025-2026', '2B-001', true),
('66660014-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000014', '2025-2026', '2B-002', false),
('66660014-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000014', '2025-2026', '2B-003', false),
('66660014-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000014', '2025-2026', '2B-004', false),
('66660014-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000014', '2025-2026', '2B-005', false),
('66660014-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000014', '2025-2026', '2B-006', false),
('66660014-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000014', '2025-2026', '2B-007', false),
('66660015-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000015', '2025-2026', '2C-001', true),
('66660015-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000015', '2025-2026', '2C-002', false),
('66660015-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000015', '2025-2026', '2C-003', false),
('66660015-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000015', '2025-2026', '2C-004', false),
('66660015-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000015', '2025-2026', '2C-005', false),
('66660015-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000015', '2025-2026', '2C-006', false),
('66660015-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000015', '2025-2026', '2C-007', false)
ON CONFLICT DO NOTHING;

-- Class assignments 1ère
INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660016-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000016', '2025-2026', '1A-001', true),
('66660016-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000016', '2025-2026', '1A-002', false),
('66660016-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000016', '2025-2026', '1A-003', false),
('66660016-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000016', '2025-2026', '1A-004', false),
('66660016-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000016', '2025-2026', '1A-005', false),
('66660016-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000016', '2025-2026', '1A-006', false),
('66660016-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000016', '2025-2026', '1A-007', false),
('66660017-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000017', '2025-2026', '1B-001', true),
('66660017-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000017', '2025-2026', '1B-002', false),
('66660017-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000017', '2025-2026', '1B-003', false),
('66660017-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000017', '2025-2026', '1B-004', false),
('66660017-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000017', '2025-2026', '1B-005', false),
('66660017-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000017', '2025-2026', '1B-006', false),
('66660017-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000017', '2025-2026', '1B-007', false),
('66660018-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000018', '2025-2026', '1C-001', true),
('66660018-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000018', '2025-2026', '1C-002', false),
('66660018-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000018', '2025-2026', '1C-003', false),
('66660018-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000018', '2025-2026', '1C-004', false),
('66660018-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000018', '2025-2026', '1C-005', false),
('66660018-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000018', '2025-2026', '1C-006', false),
('66660018-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000018', '2025-2026', '1C-007', false)
ON CONFLICT DO NOTHING;

-- Class assignments Terminale
INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate) VALUES
('66660019-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000019', '2025-2026', 'TA-001', true),
('66660019-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000019', '2025-2026', 'TA-002', false),
('66660019-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000019', '2025-2026', 'TA-003', false),
('66660019-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000019', '2025-2026', 'TA-004', false),
('66660019-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000019', '2025-2026', 'TA-005', false),
('66660019-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000019', '2025-2026', 'TA-006', false),
('66660019-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000019', '2025-2026', 'TA-007', false),
('66660020-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000020', '2025-2026', 'TB-001', true),
('66660020-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000020', '2025-2026', 'TB-002', false),
('66660020-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000020', '2025-2026', 'TB-003', false),
('66660020-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000020', '2025-2026', 'TB-004', false),
('66660020-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000020', '2025-2026', 'TB-005', false),
('66660020-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000020', '2025-2026', 'TB-006', false),
('66660020-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000020', '2025-2026', 'TB-007', false),
('66660021-0001-0001-0001-000000000001', '55555555-0001-0001-0001-000000000021', '2025-2026', 'TC-001', true),
('66660021-0001-0001-0001-000000000002', '55555555-0001-0001-0001-000000000021', '2025-2026', 'TC-002', false),
('66660021-0001-0001-0001-000000000003', '55555555-0001-0001-0001-000000000021', '2025-2026', 'TC-003', false),
('66660021-0001-0001-0001-000000000004', '55555555-0001-0001-0001-000000000021', '2025-2026', 'TC-004', false),
('66660021-0001-0001-0001-000000000005', '55555555-0001-0001-0001-000000000021', '2025-2026', 'TC-005', false),
('66660021-0001-0001-0001-000000000006', '55555555-0001-0001-0001-000000000021', '2025-2026', 'TC-006', false),
('66660021-0001-0001-0001-000000000007', '55555555-0001-0001-0001-000000000021', '2025-2026', 'TC-007', false)
ON CONFLICT DO NOTHING;

-- Establishment links for all lycée students
INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id::text LIKE '666600%' ON CONFLICT DO NOTHING;

-- Final verification
SELECT 'SEED COMPLETE! Total students: ' || COUNT(*) FROM class_students;
SELECT 'Total profiles: ' || COUNT(*) FROM profiles WHERE is_demo = true;
SELECT 'Total classes: ' || COUNT(*) FROM classes;
SELECT 'Total subjects: ' || COUNT(*) FROM subjects;
