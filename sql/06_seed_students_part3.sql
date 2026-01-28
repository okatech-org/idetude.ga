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
FROM auth.users WHERE id LIKE '666600%' AND id NOT IN (SELECT id FROM profiles) ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO user_roles (user_id, role) SELECT id, 'student' FROM auth.users WHERE id LIKE '666600%' ON CONFLICT DO NOTHING;

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
INSERT INTO user_establishments (user_id, establishment_id) SELECT id, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' FROM auth.users WHERE id LIKE '666600%' ON CONFLICT DO NOTHING;

-- Final verification
SELECT 'SEED COMPLETE! Total students: ' || COUNT(*) FROM class_students;
SELECT 'Total profiles: ' || COUNT(*) FROM profiles WHERE is_demo = true;
SELECT 'Total classes: ' || COUNT(*) FROM classes;
SELECT 'Total subjects: ' || COUNT(*) FROM subjects;
