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
