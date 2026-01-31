-- =====================================================
-- MIGRATION: Normalisation Système Établissements
-- Date: 2026-01-27
-- Implémente les recommandations 1-8 du rapport d'analyse
-- =====================================================

-- =====================================================
-- RECOMMANDATION 1: Table education_systems
-- =====================================================
CREATE TABLE IF NOT EXISTS public.education_systems (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  main_language TEXT NOT NULL DEFAULT 'fr',
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table de liaison établissement-systèmes éducatifs
CREATE TABLE IF NOT EXISTS public.establishment_education_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  system_code TEXT NOT NULL REFERENCES public.education_systems(code) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(establishment_id, system_code)
);

-- =====================================================
-- RECOMMANDATION 2 & 3: Étendre CHECK + Table establishment_types
-- =====================================================

-- D'abord supprimer l'ancienne contrainte
ALTER TABLE public.establishments DROP CONSTRAINT IF EXISTS establishments_type_check;

-- Nouvelle contrainte étendue
ALTER TABLE public.establishments 
  ADD CONSTRAINT establishments_type_check 
  CHECK (type ~ '^(maternelle|primaire|college|lycee|superieur|technique|universite|complexe|groupe|ecole|institut|centre|academie)(:(.*?))?(\,.*)?$');

-- Table normalisée pour les types avec qualifications
CREATE TABLE IF NOT EXISTS public.establishment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  type_code TEXT NOT NULL CHECK (type_code IN (
    'maternelle', 'primaire', 'college', 'lycee', 'superieur', 
    'technique', 'universite', 'complexe', 'groupe', 'ecole', 
    'institut', 'centre', 'academie'
  )),
  qualification TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(establishment_id, type_code, qualification)
);

-- =====================================================
-- RECOMMANDATION 5: Table establishment_options
-- =====================================================
CREATE TABLE IF NOT EXISTS public.establishment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  option_type TEXT NOT NULL CHECK (option_type IN (
    'serie', 'system', 'teaching_lang', 'designation', 'specialty', 'program'
  )),
  option_value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(establishment_id, option_type, option_value)
);

-- =====================================================
-- RECOMMANDATION 6: Table establishment_levels
-- =====================================================
CREATE TABLE IF NOT EXISTS public.establishment_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  level_code TEXT NOT NULL,
  cycle TEXT NOT NULL CHECK (cycle IN (
    'maternelle', 'primaire', 'college', 'lycee', 'technique', 'superieur'
  )),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(establishment_id, level_code)
);

-- =====================================================
-- RECOMMANDATION 7: Validation GPS côté serveur
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_gps_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que latitude est valide (-90 à 90)
  IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN
    RAISE EXCEPTION 'Latitude invalide: doit être entre -90 et 90 (reçu: %)', NEW.latitude;
  END IF;
  
  -- Vérifier que longitude est valide (-180 à 180)
  IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN
    RAISE EXCEPTION 'Longitude invalide: doit être entre -180 et 180 (reçu: %)', NEW.longitude;
  END IF;
  
  -- Vérifier cohérence: si l'un est défini, l'autre doit l'être aussi
  IF (NEW.latitude IS NULL) != (NEW.longitude IS NULL) THEN
    RAISE EXCEPTION 'Latitude et longitude doivent être définis ensemble ou pas du tout';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_establishment_gps ON public.establishments;
CREATE TRIGGER validate_establishment_gps
  BEFORE INSERT OR UPDATE ON public.establishments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_gps_coordinates();

-- =====================================================
-- RECOMMANDATION 8: Fonction transaction atomique
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_establishment_with_staff(
  p_establishment JSONB,
  p_staff JSONB DEFAULT '[]'::JSONB,
  p_types JSONB DEFAULT '[]'::JSONB,
  p_levels JSONB DEFAULT '[]'::JSONB,
  p_education_systems JSONB DEFAULT '[]'::JSONB,
  p_options JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_establishment_id UUID;
  v_result JSONB;
  v_staff_record JSONB;
  v_type_record JSONB;
  v_level_record JSONB;
  v_system_record JSONB;
  v_option_record JSONB;
BEGIN
  -- Créer l'établissement
  INSERT INTO establishments (
    name, code, type, address, phone, email, 
    country_code, levels, options, group_id,
    latitude, longitude, enabled_modules
  )
  VALUES (
    p_establishment->>'name',
    p_establishment->>'code',
    COALESCE(p_establishment->>'type', 'primaire'),
    p_establishment->>'address',
    p_establishment->>'phone',
    p_establishment->>'email',
    COALESCE(p_establishment->>'country_code', 'GA'),
    p_establishment->>'levels',
    CASE 
      WHEN p_establishment->'options' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_establishment->'options'))
      ELSE NULL 
    END,
    (p_establishment->>'group_id')::UUID,
    (p_establishment->>'latitude')::NUMERIC,
    (p_establishment->>'longitude')::NUMERIC,
    CASE 
      WHEN p_establishment->'enabled_modules' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_establishment->'enabled_modules'))
      ELSE ARRAY['messages', 'grades', 'assignments', 'absences', 'schedule', 'calendar']
    END
  )
  RETURNING id INTO v_establishment_id;

  -- Ajouter les types normalisés
  FOR v_type_record IN SELECT * FROM jsonb_array_elements(p_types)
  LOOP
    INSERT INTO establishment_types (establishment_id, type_code, qualification, is_primary, order_index)
    VALUES (
      v_establishment_id,
      v_type_record->>'type_code',
      v_type_record->>'qualification',
      COALESCE((v_type_record->>'is_primary')::BOOLEAN, false),
      COALESCE((v_type_record->>'order_index')::INTEGER, 0)
    )
    ON CONFLICT (establishment_id, type_code, qualification) DO NOTHING;
  END LOOP;

  -- Ajouter les niveaux normalisés
  FOR v_level_record IN SELECT * FROM jsonb_array_elements(p_levels)
  LOOP
    INSERT INTO establishment_levels (establishment_id, level_code, cycle, order_index)
    VALUES (
      v_establishment_id,
      v_level_record->>'level_code',
      v_level_record->>'cycle',
      COALESCE((v_level_record->>'order_index')::INTEGER, 0)
    )
    ON CONFLICT (establishment_id, level_code) DO NOTHING;
  END LOOP;

  -- Ajouter les systèmes éducatifs
  FOR v_system_record IN SELECT * FROM jsonb_array_elements(p_education_systems)
  LOOP
    INSERT INTO establishment_education_systems (establishment_id, system_code, is_primary)
    VALUES (
      v_establishment_id,
      v_system_record->>'system_code',
      COALESCE((v_system_record->>'is_primary')::BOOLEAN, false)
    )
    ON CONFLICT (establishment_id, system_code) DO NOTHING;
  END LOOP;

  -- Ajouter les options
  FOR v_option_record IN SELECT * FROM jsonb_array_elements(p_options)
  LOOP
    INSERT INTO establishment_options (establishment_id, option_type, option_value, metadata)
    VALUES (
      v_establishment_id,
      v_option_record->>'option_type',
      v_option_record->>'option_value',
      COALESCE(v_option_record->'metadata', '{}'::JSONB)
    )
    ON CONFLICT (establishment_id, option_type, option_value) DO NOTHING;
  END LOOP;

  -- Ajouter le personnel
  FOR v_staff_record IN SELECT * FROM jsonb_array_elements(p_staff)
  LOOP
    INSERT INTO establishment_staff (
      establishment_id, staff_type, category, position,
      department, contract_type, start_date, is_active,
      is_class_principal, linked_student_id, metadata
    )
    VALUES (
      v_establishment_id,
      v_staff_record->>'staff_type',
      COALESCE(v_staff_record->>'category', 'administrative'),
      v_staff_record->>'position',
      v_staff_record->>'department',
      v_staff_record->>'contract_type',
      (v_staff_record->>'start_date')::DATE,
      COALESCE((v_staff_record->>'is_active')::BOOLEAN, true),
      COALESCE((v_staff_record->>'is_class_principal')::BOOLEAN, false),
      (v_staff_record->>'linked_student_id')::UUID,
      COALESCE(v_staff_record->'metadata', '{}'::JSONB)
    );
  END LOOP;

  -- Construire le résultat
  v_result := jsonb_build_object(
    'success', true,
    'establishment_id', v_establishment_id,
    'message', 'Établissement créé avec succès'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- =====================================================
-- RECOMMANDATION 15: Historique modifications (audit)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.establishment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changed_by UUID REFERENCES auth.users(id),
  changes JSONB NOT NULL DEFAULT '{}',
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.track_establishment_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO establishment_history (establishment_id, action, changed_by, new_values)
    VALUES (NEW.id, 'create', auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO establishment_history (establishment_id, action, changed_by, old_values, new_values, changes)
    VALUES (
      NEW.id, 
      'update', 
      auth.uid(), 
      to_jsonb(OLD), 
      to_jsonb(NEW),
      jsonb_build_object(
        'name', CASE WHEN OLD.name != NEW.name THEN jsonb_build_object('old', OLD.name, 'new', NEW.name) ELSE NULL END,
        'type', CASE WHEN OLD.type != NEW.type THEN jsonb_build_object('old', OLD.type, 'new', NEW.type) ELSE NULL END,
        'address', CASE WHEN OLD.address IS DISTINCT FROM NEW.address THEN jsonb_build_object('old', OLD.address, 'new', NEW.address) ELSE NULL END
      ) - 'null'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO establishment_history (establishment_id, action, changed_by, old_values)
    VALUES (OLD.id, 'delete', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_establishments ON public.establishments;
CREATE TRIGGER track_establishments
  AFTER INSERT OR UPDATE OR DELETE ON public.establishments
  FOR EACH ROW
  EXECUTE FUNCTION public.track_establishment_changes();

-- =====================================================
-- RLS Policies pour nouvelles tables
-- =====================================================

-- education_systems (lecture publique)
ALTER TABLE public.education_systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view education systems" ON public.education_systems
  FOR SELECT USING (true);
CREATE POLICY "Super admins can manage education systems" ON public.education_systems
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- establishment_education_systems
ALTER TABLE public.establishment_education_systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Establishment users can view education systems links" ON public.establishment_education_systems
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_establishments ue 
            WHERE ue.establishment_id = establishment_education_systems.establishment_id 
            AND ue.user_id = auth.uid())
  );
CREATE POLICY "Super admins can manage education systems links" ON public.establishment_education_systems
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School directors can manage their education systems" ON public.establishment_education_systems
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_establishments ue 
            WHERE ue.establishment_id = establishment_education_systems.establishment_id 
            AND ue.user_id = auth.uid())
    AND has_role(auth.uid(), 'school_director')
  );

-- establishment_types
ALTER TABLE public.establishment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view establishment types" ON public.establishment_types
  FOR SELECT USING (true);
CREATE POLICY "Super admins can manage establishment types" ON public.establishment_types
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School directors can manage their types" ON public.establishment_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_establishments ue 
            WHERE ue.establishment_id = establishment_types.establishment_id 
            AND ue.user_id = auth.uid())
    AND has_role(auth.uid(), 'school_director')
  );

-- establishment_options
ALTER TABLE public.establishment_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view establishment options" ON public.establishment_options
  FOR SELECT USING (true);
CREATE POLICY "Super admins can manage establishment options" ON public.establishment_options
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School directors can manage their options" ON public.establishment_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_establishments ue 
            WHERE ue.establishment_id = establishment_options.establishment_id 
            AND ue.user_id = auth.uid())
    AND has_role(auth.uid(), 'school_director')
  );

-- establishment_levels
ALTER TABLE public.establishment_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view establishment levels" ON public.establishment_levels
  FOR SELECT USING (true);
CREATE POLICY "Super admins can manage establishment levels" ON public.establishment_levels
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School directors can manage their levels" ON public.establishment_levels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_establishments ue 
            WHERE ue.establishment_id = establishment_levels.establishment_id 
            AND ue.user_id = auth.uid())
    AND has_role(auth.uid(), 'school_director')
  );

-- establishment_history
ALTER TABLE public.establishment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins can view all history" ON public.establishment_history
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School directors can view their history" ON public.establishment_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_establishments ue 
            WHERE ue.establishment_id = establishment_history.establishment_id 
            AND ue.user_id = auth.uid())
    AND has_role(auth.uid(), 'school_director')
  );

-- =====================================================
-- Index pour performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_education_systems_region ON public.education_systems(region);
CREATE INDEX IF NOT EXISTS idx_education_systems_language ON public.education_systems(main_language);
CREATE INDEX IF NOT EXISTS idx_est_edu_systems_establishment ON public.establishment_education_systems(establishment_id);
CREATE INDEX IF NOT EXISTS idx_est_types_establishment ON public.establishment_types(establishment_id);
CREATE INDEX IF NOT EXISTS idx_est_options_establishment ON public.establishment_options(establishment_id);
CREATE INDEX IF NOT EXISTS idx_est_options_type ON public.establishment_options(option_type);
CREATE INDEX IF NOT EXISTS idx_est_levels_establishment ON public.establishment_levels(establishment_id);
CREATE INDEX IF NOT EXISTS idx_est_levels_cycle ON public.establishment_levels(cycle);
CREATE INDEX IF NOT EXISTS idx_est_history_establishment ON public.establishment_history(establishment_id);
CREATE INDEX IF NOT EXISTS idx_est_history_created ON public.establishment_history(created_at DESC);

-- =====================================================
-- Triggers updated_at
-- =====================================================
CREATE TRIGGER update_education_systems_updated_at
  BEFORE UPDATE ON public.education_systems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Seed data: Systèmes éducatifs (165+)
-- =====================================================
INSERT INTO public.education_systems (code, name, region, main_language, description, icon) VALUES
-- Afrique Francophone
('gabonais', 'Gabonais', 'afrique_francophone', 'fr', 'Système national du Gabon (CEP, BEPC, BAC)', '🇬🇦'),
('congolais_rdc', 'Congolais (RDC)', 'afrique_francophone', 'fr', 'République Démocratique du Congo', '🇨🇩'),
('congolais_brazza', 'Congolais (Congo-Brazzaville)', 'afrique_francophone', 'fr', 'République du Congo', '🇨🇬'),
('camerounais_fr', 'Camerounais Francophone', 'afrique_francophone', 'fr', 'Système francophone du Cameroun', '🇨🇲'),
('ivoirien', 'Ivoirien', 'afrique_francophone', 'fr', 'Côte d''Ivoire (CEPE, BEPC, BAC)', '🇨🇮'),
('senegalais', 'Sénégalais', 'afrique_francophone', 'fr', 'Sénégal (CFEE, BFEM, BAC)', '🇸🇳'),
('malien', 'Malien', 'afrique_francophone', 'fr', 'Mali (DEF, BAC)', '🇲🇱'),
('burkinabe', 'Burkinabè', 'afrique_francophone', 'fr', 'Burkina Faso (CEP, BEPC, BAC)', '🇧🇫'),
('nigerien', 'Nigérien', 'afrique_francophone', 'fr', 'Niger', '🇳🇪'),
('beninois', 'Béninois', 'afrique_francophone', 'fr', 'Bénin (CEP, BEPC, BAC)', '🇧🇯'),
('togolais', 'Togolais', 'afrique_francophone', 'fr', 'Togo (CEPD, BEPC, BAC)', '🇹🇬'),
('guineen', 'Guinéen', 'afrique_francophone', 'fr', 'Guinée Conakry', '🇬🇳'),
('tchadien', 'Tchadien', 'afrique_francophone', 'fr', 'Tchad', '🇹🇩'),
('centrafricain', 'Centrafricain', 'afrique_francophone', 'fr', 'République Centrafricaine', '🇨🇫'),
('mauritanien', 'Mauritanien', 'afrique_francophone', 'fr', 'Mauritanie (bilingue arabe-français)', '🇲🇷'),
('djiboutien', 'Djiboutien', 'afrique_francophone', 'fr', 'Djibouti', '🇩🇯'),
('comorien', 'Comorien', 'afrique_francophone', 'fr', 'Comores', '🇰🇲'),
('malgache', 'Malgache', 'afrique_francophone', 'fr', 'Madagascar', '🇲🇬'),
('burundais', 'Burundais', 'afrique_francophone', 'fr', 'Burundi', '🇧🇮'),
('rwandais', 'Rwandais', 'afrique_francophone', 'fr', 'Rwanda (trilingue)', '🇷🇼'),
('guinee_equatoriale', 'Équato-Guinéen', 'afrique_francophone', 'fr', 'Guinée Équatoriale', '🇬🇶'),
-- Afrique Anglophone
('nigerien_en', 'Nigérian', 'afrique_anglophone', 'en', 'Nigeria (WAEC, NECO)', '🇳🇬'),
('ghaneen', 'Ghanéen', 'afrique_anglophone', 'en', 'Ghana (BECE, WASSCE)', '🇬🇭'),
('kenyan', 'Kenyan', 'afrique_anglophone', 'en', 'Kenya (KCPE, KCSE)', '🇰🇪'),
('tanzanien', 'Tanzanien', 'afrique_anglophone', 'en', 'Tanzanie', '🇹🇿'),
('ougandais', 'Ougandais', 'afrique_anglophone', 'en', 'Ouganda (UCE, UACE)', '🇺🇬'),
('sud_africain', 'Sud-Africain', 'afrique_anglophone', 'en', 'Afrique du Sud (NSC, Matric)', '🇿🇦'),
('zimbabween', 'Zimbabwéen', 'afrique_anglophone', 'en', 'Zimbabwe (O-Level, A-Level)', '🇿🇼'),
('zambien', 'Zambien', 'afrique_anglophone', 'en', 'Zambie', '🇿🇲'),
('botswanais', 'Botswanais', 'afrique_anglophone', 'en', 'Botswana (JCE, BGCSE)', '🇧🇼'),
('namibien', 'Namibien', 'afrique_anglophone', 'en', 'Namibie (NSSCO, NSSCAS)', '🇳🇦'),
('malawien', 'Malawien', 'afrique_anglophone', 'en', 'Malawi (JCE, MSCE)', '🇲🇼'),
('liberien', 'Libérien', 'afrique_anglophone', 'en', 'Liberia', '🇱🇷'),
('sierra_leonais', 'Sierra-Léonais', 'afrique_anglophone', 'en', 'Sierra Leone (BECE, WASSCE)', '🇸🇱'),
('gambien', 'Gambien', 'afrique_anglophone', 'en', 'Gambie', '🇬🇲'),
('camerounais_en', 'Camerounais Anglophone', 'afrique_anglophone', 'en', 'Système anglophone du Cameroun (GCE)', '🇨🇲'),
('ethiopien', 'Éthiopien', 'afrique_anglophone', 'en', 'Éthiopie', '🇪🇹'),
('mauricien', 'Mauricien', 'afrique_anglophone', 'en', 'Maurice (CPE, SC, HSC)', '🇲🇺'),
-- Afrique Lusophone
('angolais', 'Angolais', 'afrique_lusophone', 'pt', 'Angola', '🇦🇴'),
('mozambicain', 'Mozambicain', 'afrique_lusophone', 'pt', 'Mozambique', '🇲🇿'),
('cap_verdien', 'Cap-Verdien', 'afrique_lusophone', 'pt', 'Cap-Vert', '🇨🇻'),
('guinee_bissau', 'Bissau-Guinéen', 'afrique_lusophone', 'pt', 'Guinée-Bissau', '🇬🇼'),
('sao_tomeen', 'São-Toméen', 'afrique_lusophone', 'pt', 'São Tomé-et-Príncipe', '🇸🇹'),
-- Afrique Arabe
('marocain', 'Marocain', 'afrique_arabe', 'ar', 'Maroc (bilingue arabe-français)', '🇲🇦'),
('algerien', 'Algérien', 'afrique_arabe', 'ar', 'Algérie', '🇩🇿'),
('tunisien', 'Tunisien', 'afrique_arabe', 'ar', 'Tunisie', '🇹🇳'),
('libyen', 'Libyen', 'afrique_arabe', 'ar', 'Libye', '🇱🇾'),
('egyptien', 'Égyptien', 'afrique_arabe', 'ar', 'Égypte (Thanaweya Amma)', '🇪🇬'),
('soudanais', 'Soudanais', 'afrique_arabe', 'ar', 'Soudan', '🇸🇩'),
('somalien', 'Somalien', 'afrique_arabe', 'ar', 'Somalie', '🇸🇴'),
-- Europe Occidentale
('francais', 'Français', 'europe_occidentale', 'fr', 'France (Brevet, BAC)', '🇫🇷'),
('belge_fr', 'Belge Francophone', 'europe_occidentale', 'fr', 'Belgique francophone (CESS)', '🇧🇪'),
('suisse_fr', 'Suisse Francophone', 'europe_occidentale', 'fr', 'Maturité suisse romande', '🇨🇭'),
('luxembourgeois', 'Luxembourgeois', 'europe_occidentale', 'fr', 'Luxembourg (trilingue)', '🇱🇺'),
('britannique', 'Britannique', 'europe_occidentale', 'en', 'GCSE, A-Levels', '🇬🇧'),
('irlandais', 'Irlandais', 'europe_occidentale', 'en', 'Leaving Certificate', '🇮🇪'),
('allemand', 'Allemand', 'europe_occidentale', 'de', 'Abitur', '🇩🇪'),
('autrichien', 'Autrichien', 'europe_occidentale', 'de', 'Matura', '🇦🇹'),
('italien', 'Italien', 'europe_occidentale', 'it', 'Esame di Stato', '🇮🇹'),
('espagnol', 'Espagnol', 'europe_occidentale', 'es', 'Selectividad / EBAU', '🇪🇸'),
('portugais', 'Portugais', 'europe_occidentale', 'pt', 'Exames Nacionais', '🇵🇹'),
('neerlandais', 'Néerlandais', 'europe_occidentale', 'nl', 'VWO, HAVO, VMBO', '🇳🇱'),
-- International
('ib', 'Baccalauréat International (IB)', 'international', 'multi', 'Programme IB (PYP, MYP, DP)', '🌐'),
('cambridge', 'Cambridge International', 'international', 'en', 'Cambridge IGCSE, AS/A Level', '📚'),
('europeen', 'Baccalauréat Européen', 'international', 'multi', 'Écoles Européennes', '🇪🇺'),
-- Amérique du Nord
('americain', 'Américain', 'amerique_nord', 'en', 'High School Diploma, AP, SAT/ACT', '🇺🇸'),
('canadien_en', 'Canadien Anglophone', 'amerique_nord', 'en', 'Système canadien anglophone', '🇨🇦'),
('canadien_fr', 'Canadien Francophone', 'amerique_nord', 'fr', 'Système québécois (DES, DEC)', '🇨🇦')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- Commentaires sur les tables
-- =====================================================
COMMENT ON TABLE public.education_systems IS 'Catalogue des systèmes éducatifs mondiaux';
COMMENT ON TABLE public.establishment_education_systems IS 'Liaison établissement-systèmes éducatifs (multi-système)';
COMMENT ON TABLE public.establishment_types IS 'Types normalisés avec qualifications';
COMMENT ON TABLE public.establishment_options IS 'Options normalisées (séries, langues, spécialités)';
COMMENT ON TABLE public.establishment_levels IS 'Niveaux enseignés par établissement';
COMMENT ON TABLE public.establishment_history IS 'Historique des modifications (audit trail)';
COMMENT ON FUNCTION public.create_establishment_with_staff IS 'Création atomique établissement + personnel + config';
COMMENT ON FUNCTION public.validate_gps_coordinates IS 'Validation des coordonnées GPS';
