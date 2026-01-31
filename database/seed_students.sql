-- Seed 7 students per class (21 classes × 7 = 147 students)
-- Using realistic Gabonese names

-- Create base ID pattern for students
-- Format: 77777777-xxxx-xxxx-xxxx-xxxxxxxxxxxx

-- Class IDs follow pattern: 55555555-0001-0001-0001-00000000000X

DO $$
DECLARE
    class_record RECORD;
    student_id UUID;
    student_num INT;
    first_names TEXT[] := ARRAY[
        'Jean-Pierre', 'Marie-Claire', 'Patrick', 'Christelle', 'Fabrice', 'Nadège', 'Rodrigue',
        'Sylvie', 'Christian', 'Paulette', 'Hervé', 'Francine', 'Thierry', 'Béatrice', 'Gervais',
        'Arlette', 'Landry', 'Josiane', 'Serge', 'Martine', 'Ferdinand', 'Léontine', 'Boris',
        'Clémence', 'Arnaud', 'Micheline', 'Gaston', 'Odette', 'Yannick', 'Rosalie',
        'Emmanuel', 'Solange', 'Wilfried', 'Clarisse', 'Brice', 'Pélagie', 'Kevin',
        'Chancelvie', 'Ulrich', 'Fortunée', 'Cédric', 'Divine', 'Steve', 'Grâce',
        'Parfait', 'Ornella', 'Régis', 'Phébée', 'Junior', 'Esther',
        'Christ', 'Prisca', 'Fréjus', 'Merveille', 'Loic', 'Sandrine', 'Dimitri',
        'Pétroline', 'Maurel', 'Doriane', 'Landrick', 'Camélia', 'Exaucé', 'Prophétesse',
        'Christ-Olivier', 'Bénédicte', 'Fleury', 'Trinité', 'Anicet', 'Félicité',
        'Chardin', 'Précieuse', 'Lys-Axel', 'Lumière', 'Chance', 'Célestine',
        'Crépin', 'Prudence', 'Modeste', 'Perpétue', 'Clovis', 'Thérèse',
        'Bienvenu', 'Constance', 'Prosper', 'Honorine', 'Calvin', 'Blandine',
        'Placide', 'Augustine', 'Ghislain', 'Victoire', 'Dieuveil', 'Espérance',
        'Kader', 'Alida', 'Stone', 'Charline', 'Privat', 'Carmelle',
        'Kevin-Juste', 'Divine-Grâce', 'Franck', 'Aubierge', 'Romaric', 'Flavienne',
        'Christ-Emmanuel', 'Pélie', 'Crédo', 'Florentine', 'Belvie', 'Andreline',
        'Andy', 'Wendy', 'Christ-Roi', 'Marie-Ange', 'Dalva', 'Olivienne',
        'Juste', 'Ivana', 'Glordy', 'Adeline', 'Fabien', 'Monique',
        'Luther', 'Mélanie', 'Axel', 'Larissa', 'Dimitri', 'Ornelia',
        'Yves', 'Patricia', 'Guy-Roland', 'Nicole', 'Léon', 'Gertrude',
        'Blaise', 'Jeannette', 'Auguste', 'Colette', 'Norbert', 'Véronique'
    ];
    last_names TEXT[] := ARRAY[
        'Moussavou', 'Ndong', 'Obame', 'Mba', 'Ondo', 'Essono', 'Nze', 
        'Mintsa', 'Ella', 'Nguema', 'Ovono', 'Nzoghe', 'Bekale', 'Oye',
        'Mezui', 'Bibang', 'Eyi', 'Mboumba', 'Mbadinga', 'Ntoutoume',
        'Ndjave', 'Assoumou', 'Edou', 'Mfoubou', 'Bivigou', 'Mounguengui',
        'Biyogho', 'Makanga', 'Edzang', 'Anguile', 'Engonga', 'Ekomi',
        'Mboulou', 'Kombila', 'Mayila', 'Mouloungui', 'Koumba', 'Issembe',
        'Nziengui', 'Otandault', 'Massounga', 'Boutamba', 'Mengue', 'Lendoye',
        'Mandji', 'Boussamba', 'Mackaya', 'Rekangalt', 'Oyenga', 'Maganga'
    ];
    first_name TEXT;
    last_name TEXT;
    email TEXT;
    class_idx INT := 0;
BEGIN
    -- Loop through each class
    FOR class_record IN SELECT id, name FROM classes ORDER BY id LOOP
        class_idx := class_idx + 1;
        
        -- Create 7 students per class
        FOR student_num IN 1..7 LOOP
            -- Generate unique student ID
            student_id := ('77777777-' || LPAD(class_idx::TEXT, 4, '0') || '-0001-0001-' || LPAD(student_num::TEXT, 12, '0'))::UUID;
            
            -- Select random names
            first_name := first_names[1 + ((class_idx * 7 + student_num) % array_length(first_names, 1))];
            last_name := last_names[1 + ((class_idx + student_num * 3) % array_length(last_names, 1))];
            
            -- Generate email
            email := lower(regexp_replace(first_name, '[^a-zA-Z]', '', 'g')) || '.' || 
                     lower(last_name) || '.' || class_idx || student_num || '@eleve.idetude.ga';
            
            -- Insert into auth.users
            INSERT INTO auth.users (id, email, raw_user_meta_data)
            VALUES (
                student_id, 
                email,
                jsonb_build_object('role', 'student', 'first_name', first_name, 'last_name', last_name)
            )
            ON CONFLICT (id) DO NOTHING;
            
            -- Insert into profiles
            INSERT INTO profiles (id, email, first_name, last_name, is_demo)
            VALUES (student_id, email, first_name, last_name, true)
            ON CONFLICT (id) DO NOTHING;
            
            -- Insert into class_students
            INSERT INTO class_students (student_id, class_id, school_year, registration_number, is_delegate)
            VALUES (
                student_id, 
                class_record.id, 
                '2025-2026', 
                'ETU-' || LPAD(class_idx::TEXT, 2, '0') || '-' || LPAD(student_num::TEXT, 3, '0'),
                student_num = 1  -- First student in each class is delegate
            )
            ON CONFLICT (student_id, class_id, school_year) DO NOTHING;
            
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Successfully seeded % students across % classes', class_idx * 7, class_idx;
END $$;

-- Verification query
SELECT 
    c.name as class_name,
    COUNT(cs.id) as student_count
FROM classes c
LEFT JOIN class_students cs ON c.id = cs.class_id
GROUP BY c.id, c.name
ORDER BY c.name;
