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
