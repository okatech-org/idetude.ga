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
FROM auth.users WHERE id LIKE '6666000%' AND id NOT IN (SELECT id FROM profiles) ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id LIKE '6666000%' ON CONFLICT DO NOTHING;

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
INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id LIKE '6666000%' ON CONFLICT DO NOTHING;

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
