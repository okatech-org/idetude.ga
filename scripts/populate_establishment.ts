/**
 * Script de population complète de l'établissement
 * Génère ~450 élèves et les assignations enseignants-classes
 */

import pg from 'pg';

const pool = new pg.Pool({
    host: process.env.CLOUDSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.CLOUDSQL_PORT || '5432'),
    database: process.env.CLOUDSQL_DATABASE || 'postgres',
    user: process.env.CLOUDSQL_USER || 'postgres',
    password: process.env.CLOUDSQL_PASSWORD,
});

const ESTABLISHMENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

// Noms gabonais
const MALE_FIRST_NAMES = ['Luc', 'Pierre', 'Jean', 'Paul', 'André', 'Marc', 'Philippe', 'Michel', 'François', 'Joseph', 'Robert', 'Henri', 'Charles', 'Alain', 'Bernard', 'Thierry', 'Patrick', 'Olivier', 'Sylvain', 'Emmanuel', 'Eric', 'Christian', 'Daniel', 'Jacques', 'Yves'];
const FEMALE_FIRST_NAMES = ['Marie', 'Jeanne', 'Anne', 'Sylvie', 'Françoise', 'Nicole', 'Monique', 'Christine', 'Patricia', 'Cécile', 'Lucie', 'Thérèse', 'Marguerite', 'Eugénie', 'Odette', 'Claudette', 'Bernadette', 'Rose', 'Grace', 'Hortense', 'Ruth', 'Esther', 'Diane', 'Sandrine', 'Nadia'];
const LAST_NAMES = ['OBAME', 'MBOUMBA', 'NZENG', 'MOUSSAVOU', 'ONDO', 'NGUEMA', 'OBIANG', 'MBA', 'MINKO', 'ESSONO', 'EVOUNA', 'NDONG', 'MEZUI', 'AYINGONE', 'MEBARA', 'BIBANG', 'EYANG', 'NTOUTOUME', 'ASSOUMOU', 'OVONO', 'EYENE', 'NZUE', 'MINTSA', 'EKANG', 'EDOU'];

// Teacher-subject mapping
const TEACHER_SUBJECTS: Record<string, string[]> = {
    '22222222-0001-0001-0001-000000000006': ['44444444-0001-0001-0001-000000000001'], // Jeanne MBA - Français
    '22222222-0001-0001-0001-000000000002': ['44444444-0001-0001-0001-000000000002'], // André BIBANG - Math
    '22222222-0001-0001-0001-000000000007': ['44444444-0001-0001-0001-000000000003'], // Augustin NTOUTOUME - Anglais
    '22222222-0001-0001-0001-000000000010': ['44444444-0001-0001-0001-000000000004'], // Lucie MEYO - SVT
    '22222222-0001-0001-0001-000000000005': ['44444444-0001-0001-0001-000000000005'], // Marc ESSONO - Physique-Chimie
    '22222222-0001-0001-0001-000000000008': ['44444444-0001-0001-0001-000000000006'], // Carmen OVONO - Histoire-Géo
    '22222222-0001-0001-0001-000000000003': ['44444444-0001-0001-0001-000000000007'], // Grace NGUEMA - Philosophie
    '22222222-0001-0001-0001-000000000015': ['44444444-0001-0001-0001-000000000008'], // Hans OYONO - Espagnol
    '22222222-0001-0001-0001-000000000009': ['44444444-0001-0001-0001-000000000009'], // Dieudonné AKURE - EPS
    '22222222-0001-0001-0001-000000000011': ['44444444-0001-0001-0001-000000000011'], // Patrice EDOU - Musique
    '22222222-0001-0001-0001-000000000012': ['44444444-0001-0001-0001-000000000012'], // Stéphane BOUANGA - Informatique
    '22222222-0001-0001-0001-000000000013': ['44444444-0001-0001-0001-000000000013'], // Thérèse MINKO - Ed Civique
    '22222222-0001-0001-0001-000000000014': ['44444444-0001-0001-0001-000000000010'], // Grégoire ASSOUMOU - Arts Plastiques
};

// Subjects by level
const COLLEGE_SUBJECTS = ['44444444-0001-0001-0001-000000000001', '44444444-0001-0001-0001-000000000002', '44444444-0001-0001-0001-000000000003', '44444444-0001-0001-0001-000000000004', '44444444-0001-0001-0001-000000000005', '44444444-0001-0001-0001-000000000006', '44444444-0001-0001-0001-000000000009', '44444444-0001-0001-0001-000000000013'];
const LYCEE_SUBJECTS = [...COLLEGE_SUBJECTS, '44444444-0001-0001-0001-000000000007', '44444444-0001-0001-0001-000000000008', '44444444-0001-0001-0001-000000000012'];

// Main teacher per class
const MAIN_TEACHERS: Record<string, string> = {
    '55555555-0001-0001-0001-000000000001': '22222222-0001-0001-0001-000000000006', // 6ème A
    '55555555-0001-0001-0001-000000000002': '22222222-0001-0001-0001-000000000002', // 6ème B
    '55555555-0001-0001-0001-000000000003': '22222222-0001-0001-0001-000000000007', // 6ème C
    '55555555-0001-0001-0001-000000000004': '22222222-0001-0001-0001-000000000010', // 5ème A
    '55555555-0001-0001-0001-000000000005': '22222222-0001-0001-0001-000000000005', // 5ème B
    '55555555-0001-0001-0001-000000000006': '22222222-0001-0001-0001-000000000008', // 5ème C
    '55555555-0001-0001-0001-000000000007': '22222222-0001-0001-0001-000000000006', // 4ème A
    '55555555-0001-0001-0001-000000000008': '22222222-0001-0001-0001-000000000002', // 4ème B
    '55555555-0001-0001-0001-000000000009': '22222222-0001-0001-0001-000000000007', // 4ème C
    '55555555-0001-0001-0001-000000000010': '22222222-0001-0001-0001-000000000010', // 3ème A
    '55555555-0001-0001-0001-000000000011': '22222222-0001-0001-0001-000000000005', // 3ème B
    '55555555-0001-0001-0001-000000000012': '22222222-0001-0001-0001-000000000008', // 3ème C
    '55555555-0001-0001-0001-000000000013': '22222222-0001-0001-0001-000000000003', // 2nde A
    '55555555-0001-0001-0001-000000000014': '22222222-0001-0001-0001-000000000006', // 2nde B
    '55555555-0001-0001-0001-000000000015': '22222222-0001-0001-0001-000000000002', // 2nde C
    '55555555-0001-0001-0001-000000000016': '22222222-0001-0001-0001-000000000003', // 1ère A
    '55555555-0001-0001-0001-000000000017': '22222222-0001-0001-0001-000000000005', // 1ère B
    '55555555-0001-0001-0001-000000000018': '22222222-0001-0001-0001-000000000008', // 1ère C
    '55555555-0001-0001-0001-000000000019': '22222222-0001-0001-0001-000000000003', // Tle A
    '55555555-0001-0001-0001-000000000020': '22222222-0001-0001-0001-000000000005', // Tle B
    '55555555-0001-0001-0001-000000000021': '22222222-0001-0001-0001-000000000010', // Tle C
};

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateUUID(prefix: string, index: number): string {
    return `${prefix}${index.toString().padStart(12, '0')}`;
}

async function populateEstablishment() {
    console.log('🏫 Début de la population de l\'établissement...');

    // 1. Clear existing data
    console.log('🧹 Nettoyage des données existantes...');
    await pool.query(`DELETE FROM class_students WHERE class_id::text LIKE '55555555-0001-0001-0001-%'`);
    await pool.query(`DELETE FROM class_teachers WHERE class_id::text LIKE '55555555-0001-0001-0001-%'`);

    // 2. Get classes
    const classesResult = await pool.query(
        `SELECT id, name, level FROM classes WHERE establishment_id = $1 ORDER BY level, name`,
        [ESTABLISHMENT_ID]
    );
    const classes = classesResult.rows;
    console.log(`📚 ${classes.length} classes trouvées`);

    // 3. Generate students (using new demo-friendly columns)
    console.log('👥 Génération des élèves...');
    let studentIndex = 1;

    for (const cls of classes) {
        const studentCount = randomInt(17, 25);
        console.log(`  - ${cls.name}: ${studentCount} élèves`);

        for (let i = 0; i < studentCount; i++) {
            const isFemale = Math.random() > 0.5;
            const firstName = randomElement(isFemale ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES);
            const lastName = randomElement(LAST_NAMES);
            const regNumber = `ETU-${cls.level.toUpperCase().replace('EME', '').replace('NDE', '').replace('ERE', '').replace('LE', '')}-${studentIndex.toString().padStart(4, '0')}`;

            // Create student enrollment with demo name columns
            await pool.query(
                `INSERT INTO class_students (id, class_id, school_year, registration_number, is_delegate, student_first_name, student_last_name, enrolled_at)
                 VALUES ($1, $2, '2024-2025', $3, $4, $5, $6, NOW())`,
                [generateUUID('66666666-0001-0001-0001-', studentIndex), cls.id, regNumber, i === 0, firstName, lastName]
            );

            studentIndex++;
        }
    }
    console.log(`✅ ${studentIndex - 1} élèves créés`);

    // 4. Assign teachers to classes
    console.log('👨‍🏫 Assignation des enseignants aux classes...');
    let assignmentIndex = 1;

    for (const cls of classes) {
        const isLycee = ['2nde', '1ere', 'tle'].includes(cls.level);
        const applicableSubjects = isLycee ? LYCEE_SUBJECTS : COLLEGE_SUBJECTS;
        const mainTeacherId = MAIN_TEACHERS[cls.id];

        for (const [teacherId, teacherSubjects] of Object.entries(TEACHER_SUBJECTS)) {
            for (const subjectId of teacherSubjects) {
                if (applicableSubjects.includes(subjectId)) {
                    const isMainTeacher = teacherId === mainTeacherId;

                    await pool.query(
                        `INSERT INTO class_teachers (id, class_id, teacher_id, subject_id, is_main_teacher, created_at)
                         VALUES ($1, $2, $3, $4, $5, NOW())
                         ON CONFLICT (teacher_id, class_id, subject_id) DO NOTHING`,
                        [generateUUID('77777777-0001-0001-0001-', assignmentIndex), cls.id, teacherId, subjectId, isMainTeacher]
                    );

                    assignmentIndex++;
                }
            }
        }
    }
    console.log(`✅ ${assignmentIndex - 1} assignations créées`);

    // 5. Summary
    const studentCountResult = await pool.query(
        `SELECT COUNT(*) as count FROM class_students cs
         JOIN classes c ON cs.class_id = c.id
         WHERE c.establishment_id = $1`,
        [ESTABLISHMENT_ID]
    );
    const teacherCountResult = await pool.query(
        `SELECT COUNT(DISTINCT teacher_id) as count FROM class_teachers ct
         JOIN classes c ON ct.class_id = c.id
         WHERE c.establishment_id = $1`,
        [ESTABLISHMENT_ID]
    );
    const ppCountResult = await pool.query(
        `SELECT COUNT(*) as count FROM class_teachers ct
         JOIN classes c ON ct.class_id = c.id
         WHERE c.establishment_id = $1 AND ct.is_main_teacher = true`,
        [ESTABLISHMENT_ID]
    );

    console.log('\n📊 Résumé:');
    console.log(`  - Classes: ${classes.length}`);
    console.log(`  - Élèves inscrits: ${studentCountResult.rows[0].count}`);
    console.log(`  - Enseignants actifs: ${teacherCountResult.rows[0].count}`);
    console.log(`  - Profs Principaux: ${ppCountResult.rows[0].count}`);

    await pool.end();
    console.log('\n✅ Population terminée!');
}

populateEstablishment().catch(console.error);
