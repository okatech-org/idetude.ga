-- =====================================================
-- ORGANIGRAMME SCHEMA ET DONNÉES POUR IÉTUDE
-- Instance: idetude-db (projet: idetude)
-- =====================================================

-- ===================== SCHEMA =====================

-- Departments (Structure organisationnelle)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT NOT NULL CHECK (type IN ('direction', 'department', 'service', 'bureau')),
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Positions (Postes au sein des départements)
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  is_head BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Positions (Affectation des utilisateurs aux postes)
CREATE TABLE IF NOT EXISTS user_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, position_id, start_date)
);

-- Linguistic Sections (Sections linguistiques)
CREATE TABLE IF NOT EXISTS linguistic_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  teaching_language TEXT NOT NULL DEFAULT 'fr',
  is_default BOOLEAN DEFAULT false,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Class Sections (Association classes-sections)
CREATE TABLE IF NOT EXISTS class_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  section_id UUID REFERENCES linguistic_sections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, section_id)
);

-- Establishment Staff (Personnel général)
CREATE TABLE IF NOT EXISTS establishment_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_type TEXT NOT NULL CHECK (staff_type IN ('direction', 'admin', 'teacher', 'cpe', 'surveillant', 'maintenance', 'other')),
  category TEXT,
  position TEXT,
  department TEXT,
  contract_type TEXT CHECK (contract_type IN ('permanent', 'contract', 'intern', 'volunteer')),
  is_active BOOLEAN DEFAULT true,
  is_class_principal BOOLEAN DEFAULT false,
  start_date DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_departments_establishment ON departments(establishment_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_positions_department ON positions(department_id);
CREATE INDEX IF NOT EXISTS idx_user_positions_user ON user_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_positions_position ON user_positions(position_id);
CREATE INDEX IF NOT EXISTS idx_linguistic_sections_establishment ON linguistic_sections(establishment_id);
CREATE INDEX IF NOT EXISTS idx_establishment_staff_establishment ON establishment_staff(establishment_id);

-- ===================== DONNÉES DE L'ORGANIGRAMME =====================

-- Variables pour IDs
DO $$
DECLARE
  v_establishment_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  
  -- Department IDs
  v_dept_direction UUID := '77770001-0001-0001-0001-000000000001';
  v_dept_vie_scolaire UUID := '77770001-0001-0001-0001-000000000002';
  v_dept_enseignement UUID := '77770001-0001-0001-0001-000000000003';
  v_dept_administration UUID := '77770001-0001-0001-0001-000000000004';
  v_dept_service_general UUID := '77770001-0001-0001-0001-000000000005';
  
  -- Position IDs
  v_pos_proviseur UUID := '88880001-0001-0001-0001-000000000001';
  v_pos_proviseur_adj UUID := '88880001-0001-0001-0001-000000000002';
  v_pos_censeur UUID := '88880001-0001-0001-0001-000000000003';
  v_pos_cpe UUID := '88880001-0001-0001-0001-000000000004';
  v_pos_surveillant UUID := '88880001-0001-0001-0001-000000000005';
  v_pos_chef_dept UUID := '88880001-0001-0001-0001-000000000006';
  v_pos_secretaire UUID := '88880001-0001-0001-0001-000000000007';
  v_pos_comptable UUID := '88880001-0001-0001-0001-000000000008';
  v_pos_intendant UUID := '88880001-0001-0001-0001-000000000009';
  v_pos_documentaliste UUID := '88880001-0001-0001-0001-000000000010';
  v_pos_infirmier UUID := '88880001-0001-0001-0001-000000000011';
  
  -- Staff User IDs (from seed data)
  v_user_nzoghe UUID := '22222222-0001-0001-0001-000000000001'; -- Jean-Pierre NZOGHE (Proviseur)
  v_user_obame UUID := '22222222-0001-0001-0001-000000000002';  -- Marie OBAME (Proviseur Adjoint)
  v_user_mounguengui UUID := '22222222-0001-0001-0001-000000000003'; -- Paul MOUNGUENGUI (Censeur)
  v_user_ndong UUID := '22222222-0001-0001-0001-000000000004';  -- Claire NDONG (CPE)
  v_user_ella UUID := '22222222-0001-0001-0001-000000000005';   -- Robert ELLA (Secrétaire)
  
BEGIN
  -- =============== DEPARTMENTS ===============
  
  -- Direction Générale
  INSERT INTO departments (id, establishment_id, parent_id, name, code, type, description, order_index)
  VALUES (v_dept_direction, v_establishment_id, NULL, 'Direction Générale', 'DIR', 'direction', 
          'Direction de l''établissement', 1)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  -- Vie Scolaire
  INSERT INTO departments (id, establishment_id, parent_id, name, code, type, description, order_index)
  VALUES (v_dept_vie_scolaire, v_establishment_id, v_dept_direction, 'Vie Scolaire', 'VS', 'department',
          'Gestion de la vie scolaire et discipline', 2)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  -- Enseignement
  INSERT INTO departments (id, establishment_id, parent_id, name, code, type, description, order_index)
  VALUES (v_dept_enseignement, v_establishment_id, v_dept_direction, 'Corps Enseignant', 'ENS', 'department',
          'Équipe pédagogique et enseignants', 3)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  -- Administration
  INSERT INTO departments (id, establishment_id, parent_id, name, code, type, description, order_index)
  VALUES (v_dept_administration, v_establishment_id, v_dept_direction, 'Administration', 'ADM', 'service',
          'Secrétariat et gestion administrative', 4)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  -- Services Généraux
  INSERT INTO departments (id, establishment_id, parent_id, name, code, type, description, order_index)
  VALUES (v_dept_service_general, v_establishment_id, v_dept_direction, 'Services Généraux', 'SG', 'service',
          'Intendance, infirmerie, documentation', 5)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- =============== POSITIONS ===============
  
  -- Direction
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_proviseur, v_dept_direction, 'Proviseur', 'PROV', 'Chef d''établissement', true, 1)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_proviseur_adj, v_dept_direction, 'Proviseur Adjoint', 'PROVADJ', 'Adjoint au chef d''établissement', false, 2)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_censeur, v_dept_direction, 'Censeur', 'CENS', 'Responsable pédagogique', false, 3)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  -- Vie Scolaire
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_cpe, v_dept_vie_scolaire, 'Conseiller Principal d''Éducation', 'CPE', 'Responsable de la vie scolaire', true, 1)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_surveillant, v_dept_vie_scolaire, 'Surveillant Général', 'SURV', 'Surveillance et discipline', false, 2)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  -- Enseignement
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_chef_dept, v_dept_enseignement, 'Chef de Département', 'CHEFDPT', 'Coordinateur pédagogique', true, 1)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  -- Administration
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_secretaire, v_dept_administration, 'Secrétaire de Direction', 'SECDIR', 'Secrétariat général', true, 1)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_comptable, v_dept_administration, 'Comptable', 'COMPT', 'Gestion financière', false, 2)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  -- Services Généraux  
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_intendant, v_dept_service_general, 'Intendant', 'INT', 'Gestion des ressources matérielles', true, 1)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_documentaliste, v_dept_service_general, 'Documentaliste', 'DOC', 'Centre de documentation', false, 2)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  
  INSERT INTO positions (id, department_id, name, code, description, is_head, order_index)
  VALUES (v_pos_infirmier, v_dept_service_general, 'Infirmier', 'INF', 'Service de santé scolaire', false, 3)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- =============== USER POSITIONS (Affectations) ===============
  
  -- Jean-Pierre NZOGHE -> Proviseur
  INSERT INTO user_positions (user_id, position_id, start_date, is_active, notes)
  VALUES (v_user_nzoghe, v_pos_proviseur, '2024-09-01', true, 'Nommé proviseur à la rentrée 2024')
  ON CONFLICT DO NOTHING;
  
  -- Marie OBAME -> Proviseur Adjoint
  INSERT INTO user_positions (user_id, position_id, start_date, is_active, notes)
  VALUES (v_user_obame, v_pos_proviseur_adj, '2024-09-01', true, 'Adjointe au proviseur')
  ON CONFLICT DO NOTHING;
  
  -- Paul MOUNGUENGUI -> Censeur
  INSERT INTO user_positions (user_id, position_id, start_date, is_active, notes)
  VALUES (v_user_mounguengui, v_pos_censeur, '2024-09-01', true, 'Responsable des programmes')
  ON CONFLICT DO NOTHING;
  
  -- Claire NDONG -> CPE
  INSERT INTO user_positions (user_id, position_id, start_date, is_active, notes)
  VALUES (v_user_ndong, v_pos_cpe, '2024-09-01', true, 'Conseillère principale d''éducation')
  ON CONFLICT DO NOTHING;
  
  -- Robert ELLA -> Secrétaire
  INSERT INTO user_positions (user_id, position_id, start_date, is_active, notes)
  VALUES (v_user_ella, v_pos_secretaire, '2024-09-01', true, 'Secrétaire de direction')
  ON CONFLICT DO NOTHING;

  -- =============== ESTABLISHMENT STAFF ===============
  
  -- Direction
  INSERT INTO establishment_staff (establishment_id, user_id, staff_type, category, position, department, contract_type, is_active, start_date)
  VALUES 
    (v_establishment_id, v_user_nzoghe, 'direction', 'cadre_superieur', 'Proviseur', 'Direction Générale', 'permanent', true, '2024-09-01'),
    (v_establishment_id, v_user_obame, 'direction', 'cadre_superieur', 'Proviseur Adjoint', 'Direction Générale', 'permanent', true, '2024-09-01'),
    (v_establishment_id, v_user_mounguengui, 'direction', 'cadre', 'Censeur', 'Direction Générale', 'permanent', true, '2024-09-01'),
    (v_establishment_id, v_user_ndong, 'cpe', 'cadre', 'CPE', 'Vie Scolaire', 'permanent', true, '2024-09-01'),
    (v_establishment_id, v_user_ella, 'admin', 'employe', 'Secrétaire', 'Administration', 'permanent', true, '2024-09-01')
  ON CONFLICT DO NOTHING;

  -- =============== LINGUISTIC SECTIONS ===============
  
  INSERT INTO linguistic_sections (id, establishment_id, name, code, teaching_language, is_default, color, order_index)
  VALUES 
    ('99990001-0001-0001-0001-000000000001', v_establishment_id, 'Section Francophone', 'FR', 'fr', true, '#3B82F6', 1),
    ('99990001-0001-0001-0001-000000000002', v_establishment_id, 'Section Anglophone', 'EN', 'en', false, '#10B981', 2),
    ('99990001-0001-0001-0001-000000000003', v_establishment_id, 'Section Bilingue', 'FR-EN', 'fr-en', false, '#8B5CF6', 3)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  RAISE NOTICE 'Organigramme créé avec succès!';
END $$;

-- Vérification
SELECT 'Departments: ' || COUNT(*) FROM departments;
SELECT 'Positions: ' || COUNT(*) FROM positions;
SELECT 'User Positions: ' || COUNT(*) FROM user_positions;
SELECT 'Establishment Staff: ' || COUNT(*) FROM establishment_staff;
SELECT 'Linguistic Sections: ' || COUNT(*) FROM linguistic_sections;
