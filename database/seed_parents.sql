-- Seed Parents/Tutors for all students
-- Each student gets 1 or 2 parents with realistic Gabonese names
-- Fixed: renamed variables to avoid conflict with column names

DO $$
DECLARE
    student_record RECORD;
    v_parent_id UUID;
    v_parent2_id UUID;
    parent_num INT := 0;
    first_names_m TEXT[] := ARRAY[
        'Jacques', 'Michel', 'François', 'Pierre', 'Jean-Baptiste', 'Robert', 'Henri',
        'Charles', 'Bernard', 'Louis', 'Étienne', 'Albert', 'Joseph', 'Marcel',
        'Georges', 'Raymond', 'André', 'Paul', 'René', 'Lucien', 'Roger',
        'Gaston', 'Fernand', 'Émile', 'Léon', 'Maurice', 'Victor', 'Eugène',
        'Gustave', 'Alphonse', 'Édouard', 'Théodore', 'Aristide', 'Barthélémy',
        'Célestin', 'Dieudonné', 'Emmanuel', 'Félix', 'Gabriel', 'Hippolyte'
    ];
    first_names_f TEXT[] := ARRAY[
        'Marie-Louise', 'Jeanne', 'Marguerite', 'Suzanne', 'Germaine', 'Madeleine',
        'Louise', 'Yvonne', 'Henriette', 'Simone', 'Paulette', 'Denise', 'Odette',
        'Christiane', 'Jacqueline', 'Monique', 'Raymonde', 'Ginette', 'Thérèse',
        'Colette', 'Josette', 'Andrée', 'Lucienne', 'Georgette', 'Marcelle',
        'Renée', 'Fernande', 'Huguette', 'Bernadette', 'Arlette', 'Claudette',
        'Antoinette', 'Brigitte', 'Célestine', 'Dorothée', 'Édith', 'Félicité'
    ];
    last_names TEXT[] := ARRAY[
        'Moussavou', 'Ndong', 'Obame', 'Mba', 'Ondo', 'Essono', 'Nze', 
        'Mintsa', 'Ella', 'Nguema', 'Ovono', 'Nzoghe', 'Bekale', 'Oye',
        'Mezui', 'Bibang', 'Eyi', 'Mboumba', 'Mbadinga', 'Ntoutoume',
        'Ndjave', 'Assoumou', 'Edou', 'Mfoubou', 'Bivigou', 'Mounguengui',
        'Biyogho', 'Makanga', 'Edzang', 'Anguile', 'Engonga', 'Ekomi',
        'Mboulou', 'Kombila', 'Mayila', 'Mouloungui', 'Koumba', 'Issembe'
    ];
    v_fname TEXT;
    v_lname TEXT;
    v_email TEXT;
    v_student_id UUID;
BEGIN
    -- Loop through each student
    FOR student_record IN 
        SELECT cs.student_id as sid, p.last_name as student_lastname
        FROM class_students cs 
        JOIN profiles p ON p.id = cs.student_id
    LOOP
        parent_num := parent_num + 1;
        v_student_id := student_record.sid;
        
        -- Create Father
        v_parent_id := ('88880000-' || LPAD((parent_num/100)::TEXT, 4, '0') || '-0001-0001-' || LPAD((parent_num % 1000)::TEXT, 12, '0'))::UUID;
        v_fname := first_names_m[1 + (parent_num % array_length(first_names_m, 1))];
        v_lname := student_record.student_lastname;
        v_email := lower(regexp_replace(v_fname, '[^a-zA-Z]', '', 'g')) || '.' || 
                   lower(v_lname) || '.pere' || parent_num || '@tuteur.idetude.ga';
        
        -- Insert father into auth.users
        INSERT INTO auth.users (id, email, raw_user_meta_data)
        VALUES (v_parent_id, v_email, jsonb_build_object('role', 'parent', 'first_name', v_fname, 'last_name', v_lname))
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert into profiles
        INSERT INTO profiles (id, email, first_name, last_name, is_demo)
        VALUES (v_parent_id, v_email, v_fname, v_lname, true)
        ON CONFLICT (id) DO NOTHING;
        
        -- Link parent to student
        INSERT INTO parent_students (parent_id, student_id, relationship, is_primary)
        VALUES (v_parent_id, v_student_id, 'pere', true)
        ON CONFLICT (parent_id, student_id) DO NOTHING;
        
        -- Create Mother (for 80% of students)
        IF parent_num % 5 != 0 THEN
            v_parent2_id := ('88881000-' || LPAD((parent_num/100)::TEXT, 4, '0') || '-0001-0001-' || LPAD((parent_num % 1000)::TEXT, 12, '0'))::UUID;
            v_fname := first_names_f[1 + (parent_num % array_length(first_names_f, 1))];
            v_lname := last_names[1 + ((parent_num * 3) % array_length(last_names, 1))];
            v_email := lower(regexp_replace(v_fname, '[^a-zA-Z]', '', 'g')) || '.' || 
                       lower(v_lname) || '.mere' || parent_num || '@tuteur.idetude.ga';
            
            INSERT INTO auth.users (id, email, raw_user_meta_data)
            VALUES (v_parent2_id, v_email, jsonb_build_object('role', 'parent', 'first_name', v_fname, 'last_name', v_lname))
            ON CONFLICT (id) DO NOTHING;
            
            INSERT INTO profiles (id, email, first_name, last_name, is_demo)
            VALUES (v_parent2_id, v_email, v_fname, v_lname, true)
            ON CONFLICT (id) DO NOTHING;
            
            INSERT INTO parent_students (parent_id, student_id, relationship, is_primary)
            VALUES (v_parent2_id, v_student_id, 'mere', false)
            ON CONFLICT (parent_id, student_id) DO NOTHING;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE 'Successfully seeded parents for % students', parent_num;
END $$;

-- Verification
SELECT 
    relationship,
    COUNT(*) as count
FROM parent_students
GROUP BY relationship;

SELECT COUNT(DISTINCT parent_id) as total_parents FROM parent_students;
