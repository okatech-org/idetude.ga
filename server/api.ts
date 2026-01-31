/**
 * Cloud SQL API Proxy Server for iEtude
 * This server provides secure access to the Cloud SQL database
 * Run with: npx ts-node server/api.ts
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection pool
// Cloud Run uses Unix socket: /cloudsql/PROJECT:REGION:INSTANCE
const CLOUD_SQL_CONNECTION_NAME = process.env.CLOUD_SQL_CONNECTION_NAME || 'idetude:europe-west1:idetude-db';
const isCloudRun = process.env.K_SERVICE !== undefined;
const isLocalProxy = process.env.CLOUDSQL_HOST === '127.0.0.1' || process.env.CLOUDSQL_HOST === 'localhost';

const pool = new Pool({
    host: isCloudRun ? `/cloudsql/${CLOUD_SQL_CONNECTION_NAME}` : (process.env.CLOUDSQL_HOST || 'localhost'),
    port: isCloudRun ? undefined : parseInt(process.env.CLOUDSQL_PORT || '5432'),
    database: process.env.CLOUDSQL_DATABASE || 'postgres',
    user: process.env.CLOUDSQL_USER || 'postgres',
    password: process.env.CLOUDSQL_PASSWORD,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: isLocalProxy ? false : (isCloudRun ? false : { rejectUnauthorized: false }),
});

console.log('DB Config:', {
    host: process.env.CLOUDSQL_HOST,
    port: process.env.CLOUDSQL_PORT,
    ssl: (process.env.CLOUDSQL_HOST === '127.0.0.1' || process.env.CLOUDSQL_HOST === 'localhost') ? false : 'enabled'
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/db/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', timestamp: result.rows[0].now });
    } catch (error) {
        console.error('Health Check Failed:', error);
        res.status(500).json({ status: 'error', error: (error as Error).message });
    }
});

// ==================== ESTABLISHMENTS ====================

// Get all establishments
app.get('/api/db/establishments', async (req, res) => {
    try {
        const includeArchived = req.query.includeArchived === 'true';
        const query = includeArchived
            ? 'SELECT * FROM establishments ORDER BY name'
            : 'SELECT * FROM establishments WHERE is_archived = false ORDER BY name';

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get establishment by ID
app.get('/api/db/establishments/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM establishments WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Establishment not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Create establishment
app.post('/api/db/establishments', async (req, res) => {
    try {
        const { name, code, type, group_id, address, phone, email, country_code, levels, options, student_capacity, logo_url } = req.body;
        const result = await pool.query(
            `INSERT INTO establishments (name, code, type, group_id, address, phone, email, country_code, levels, options, student_capacity, logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
            [name, code, type, group_id, address, phone, email, country_code || 'GA', levels, options, student_capacity, logo_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update establishment
app.put('/api/db/establishments/:id', async (req, res) => {
    try {
        const updates = req.body;
        const setClauses = Object.keys(updates)
            .map((key, i) => `${key} = $${i + 2}`)
            .join(', ');
        const values = [req.params.id, ...Object.values(updates)];

        const result = await pool.query(
            `UPDATE establishments SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            values
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Archive establishment
app.post('/api/db/establishments/:id/archive', async (req, res) => {
    try {
        const { archived_by } = req.body;
        const result = await pool.query(
            `UPDATE establishments 
       SET is_archived = true, archived_at = NOW(), archived_by = $2, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
            [req.params.id, archived_by]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Restore establishment
app.post('/api/db/establishments/:id/restore', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE establishments 
       SET is_archived = false, archived_at = NULL, archived_by = NULL, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
            [req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete establishment permanently
app.delete('/api/db/establishments/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM establishments WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== ESTABLISHMENT GROUPS ====================

app.get('/api/db/establishment-groups', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM establishment_groups ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== PROFILES ====================

// Get all profiles (for admin dashboard)
app.get('/api/db/profiles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.get('/api/db/profiles/:userId', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.params.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== USER ROLES ====================

app.get('/api/db/users/:userId/roles', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_roles WHERE user_id = $1',
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== CLASSES ====================

app.get('/api/db/establishments/:establishmentId/classes', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, 
                    (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
             FROM classes c 
             WHERE c.establishment_id = $1 
             ORDER BY c.name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== USER ESTABLISHMENTS ====================

app.get('/api/db/users/:userId/establishments', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ue.*, e.name as establishment_name, e.type as establishment_type
       FROM user_establishments ue
       JOIN establishments e ON ue.establishment_id = e.id
       WHERE ue.user_id = $1`,
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== SUBJECTS ====================

// Get all subjects
app.get('/api/db/subjects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM subjects ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get subjects by establishment (ALL subjects, not just those with teachers)
app.get('/api/db/establishments/:establishmentId/subjects', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM subjects 
             WHERE establishment_id = $1
             ORDER BY category, name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Create subject for establishment
app.post('/api/db/establishments/:establishmentId/subjects', async (req, res) => {
    try {
        const { establishmentId } = req.params;
        const { name, code, category, coefficient, levels, is_language, language_code, language_level, hours_per_week, is_mandatory, color, description, order_index } = req.body;
        const result = await pool.query(
            `INSERT INTO subjects (establishment_id, name, code, category, coefficient, levels, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [establishmentId, name, code || name.substring(0, 4).toUpperCase(), category || 'litteraire', coefficient || 1, levels || [], order_index || 0]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Bulk create subjects for establishment
app.post('/api/db/establishments/:establishmentId/subjects/bulk', async (req, res) => {
    try {
        const { establishmentId } = req.params;
        const subjects = req.body;

        if (!Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ error: 'Expected array of subjects' });
        }

        const inserted = [];
        for (const subj of subjects) {
            const result = await pool.query(
                `INSERT INTO subjects (establishment_id, name, code, category, coefficient, levels, order_index)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [establishmentId, subj.name, subj.code || subj.name.substring(0, 4).toUpperCase(), subj.category || 'litteraire', subj.coefficient || 1, subj.levels || [], subj.order_index || 0]
            );
            inserted.push(result.rows[0]);
        }
        res.json(inserted);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PATCH subject (partial update)
app.patch('/api/db/subjects/:id', async (req, res) => {
    try {
        const { name, code, category, coefficient, levels, order_index } = req.body;
        const result = await pool.query(
            `UPDATE subjects 
             SET name = COALESCE($2, name), 
                 code = COALESCE($3, code), 
                 category = COALESCE($4, category),
                 coefficient = COALESCE($5, coefficient), 
                 levels = COALESCE($6, levels),
                 order_index = COALESCE($7, order_index),
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [req.params.id, name, code, category, coefficient, levels, order_index]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== STAFF (Teachers & Admin) ====================

// Get all staff for an establishment
app.get('/api/db/establishments/:establishmentId/staff', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, ue.is_primary,
              CASE WHEN EXISTS (SELECT 1 FROM teacher_subjects ts WHERE ts.teacher_id = p.id) THEN 'teacher' ELSE 'admin' END as role
       FROM profiles p
       JOIN user_establishments ue ON p.id = ue.user_id
       WHERE ue.establishment_id = $1
       ORDER BY p.last_name, p.first_name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get teachers for an establishment
app.get('/api/db/establishments/:establishmentId/teachers', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT p.*, 'teacher' as role,
              (SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'code', s.code))
               FROM teacher_subjects ts
               JOIN subjects s ON ts.subject_id = s.id
               WHERE ts.teacher_id = p.id) as subjects
       FROM profiles p
       JOIN user_establishments ue ON p.id = ue.user_id
       JOIN teacher_subjects ts ON p.id = ts.teacher_id
       WHERE ue.establishment_id = $1
       ORDER BY p.last_name, p.first_name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== STUDENTS ====================

// Get all students for an establishment
app.get('/api/db/establishments/:establishmentId/students', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
               cs.id,
               cs.student_id,
               cs.class_id,
               COALESCE(p.first_name, cs.student_first_name) as first_name,
               COALESCE(p.last_name, cs.student_last_name) as last_name,
               COALESCE(p.email, '') as email,
               cs.registration_number,
               cs.is_delegate,
               cs.enrolled_at,
               c.name as class_name,
               c.level
             FROM class_students cs
             LEFT JOIN profiles p ON p.id = cs.student_id
             JOIN classes c ON cs.class_id = c.id
             WHERE c.establishment_id = $1
             ORDER BY c.level, c.name, COALESCE(p.last_name, cs.student_last_name), COALESCE(p.first_name, cs.student_first_name)`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get students by class
app.get('/api/db/classes/:classId/students', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
               cs.id,
               cs.student_id,
               COALESCE(p.first_name, cs.student_first_name) as first_name,
               COALESCE(p.last_name, cs.student_last_name) as last_name,
               COALESCE(p.email, '') as email,
               cs.enrolled_at,
               cs.registration_number,
               cs.is_delegate
             FROM class_students cs
             LEFT JOIN profiles p ON p.id = cs.student_id
             WHERE cs.class_id = $1
             ORDER BY COALESCE(p.last_name, cs.student_last_name), COALESCE(p.first_name, cs.student_first_name)`,
            [req.params.classId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


// ==================== TEACHER-CLASS ASSIGNMENTS ====================

// Get teachers assigned to a class
app.get('/api/db/classes/:classId/teachers', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, ct.subject_id, s.name as subject_name
       FROM profiles p
       JOIN class_teachers ct ON p.id = ct.teacher_id
       LEFT JOIN subjects s ON ct.subject_id = s.id
       WHERE ct.class_id = $1
       ORDER BY s.name, p.last_name`,
            [req.params.classId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Add teacher to a class with subject
app.post('/api/db/classes/:classId/teachers', async (req, res) => {
    try {
        const { teacher_id, subject_id, is_main_teacher } = req.body;
        const classId = req.params.classId;

        // If setting as main teacher, first unset any existing main teacher
        if (is_main_teacher) {
            await pool.query(
                `UPDATE class_teachers SET is_main_teacher = false WHERE class_id = $1`,
                [classId]
            );
        }

        const result = await pool.query(
            `INSERT INTO class_teachers (teacher_id, class_id, subject_id, is_main_teacher)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [teacher_id, classId, subject_id, is_main_teacher || false]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete teacher assignment from class
app.delete('/api/db/class-teachers/:assignmentId', async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM class_teachers WHERE id = $1`,
            [req.params.assignmentId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Set main teacher for a class
app.put('/api/db/classes/:classId/main-teacher', async (req, res) => {
    try {
        const { teacher_id } = req.body;
        const classId = req.params.classId;

        // First unset all main teachers for this class
        await pool.query(
            `UPDATE class_teachers SET is_main_teacher = false WHERE class_id = $1`,
            [classId]
        );

        // Set the new main teacher
        const result = await pool.query(
            `UPDATE class_teachers SET is_main_teacher = true 
             WHERE class_id = $1 AND teacher_id = $2
             RETURNING *`,
            [classId, teacher_id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update class information
app.put('/api/db/classes/:classId', async (req, res) => {
    try {
        const { name, capacity, room } = req.body;
        const result = await pool.query(
            `UPDATE classes SET name = COALESCE($1, name), capacity = $2, room = $3
             WHERE id = $4
             RETURNING *`,
            [name, capacity, room, req.params.classId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get teachers for an establishment
app.get('/api/db/establishments/:establishmentId/teachers', async (req, res) => {
    try {
        // Get staff members with teaching role
        const result = await pool.query(
            `SELECT DISTINCT p.id, p.first_name, p.last_name, p.email
             FROM profiles p
             JOIN class_teachers ct ON p.id = ct.teacher_id
             JOIN classes c ON ct.class_id = c.id
             WHERE c.establishment_id = $1
             UNION
             SELECT p.id, p.first_name, p.last_name, p.email
             FROM profiles p
             JOIN establishment_staff es ON p.id = es.user_id
             WHERE es.establishment_id = $1 AND es.role IN ('teacher', 'administrateur', 'administration')
             ORDER BY last_name, first_name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get all teacher assignments for an establishment (classes, subjects)
app.get('/api/db/establishments/:establishmentId/teacher-assignments', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                ct.id,
                ct.teacher_id,
                ct.class_id,
                c.name as class_name,
                ct.subject_id,
                s.name as subject_name,
                ct.is_main_teacher,
                p.first_name,
                p.last_name,
                p.email
             FROM class_teachers ct
             JOIN classes c ON ct.class_id = c.id
             LEFT JOIN subjects s ON ct.subject_id = s.id
             LEFT JOIN profiles p ON ct.teacher_id = p.id
             WHERE c.establishment_id = $1
             ORDER BY c.name, s.name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get establishment staff with profile data (alias for compatibility)
app.get('/api/db/establishments/:establishmentId/staff-detailed', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                es.*,
                p.first_name,
                p.last_name,
                p.email,
                p.phone,
                p.avatar_url
             FROM establishment_staff es
             LEFT JOIN profiles p ON es.user_id = p.id
             WHERE es.establishment_id = $1
             ORDER BY 
                CASE es.staff_type 
                    WHEN 'direction' THEN 1 
                    WHEN 'admin' THEN 2 
                    WHEN 'cpe' THEN 3 
                    WHEN 'teacher' THEN 4 
                    ELSE 5 
                END,
                p.last_name, p.first_name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get establishment staff with profile data
app.get('/api/db/establishments/:establishmentId/staff', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                es.*,
                p.first_name,
                p.last_name,
                p.email,
                p.phone,
                p.avatar_url
             FROM establishment_staff es
             LEFT JOIN profiles p ON es.user_id = p.id
             WHERE es.establishment_id = $1
             ORDER BY 
                CASE es.staff_type 
                    WHEN 'direction' THEN 1 
                    WHEN 'admin' THEN 2 
                    WHEN 'cpe' THEN 3 
                    WHEN 'teacher' THEN 4 
                    ELSE 5 
                END,
                p.last_name, p.first_name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update establishment staff
app.put('/api/db/establishment-staff/:staffId', async (req, res) => {
    try {
        const { position, department, category, staff_type, contract_type, is_active } = req.body;
        const result = await pool.query(
            `UPDATE establishment_staff 
             SET position = COALESCE($1, position),
                 department = COALESCE($2, department),
                 category = COALESCE($3, category),
                 staff_type = COALESCE($4, staff_type),
                 contract_type = COALESCE($5, contract_type),
                 is_active = COALESCE($6, is_active),
                 updated_at = NOW()
             WHERE id = $7
             RETURNING *`,
            [position, department, category, staff_type, contract_type, is_active, req.params.staffId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete establishment staff
app.delete('/api/db/establishment-staff/:staffId', async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM establishment_staff WHERE id = $1`,
            [req.params.staffId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== DEPARTMENTS (Organigramme) ====================

// Get all departments for an establishment
app.get('/api/db/establishments/:establishmentId/departments', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM departments 
       WHERE establishment_id = $1 
       ORDER BY order_index`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== POSITIONS ====================

// Get all positions for a department
app.get('/api/db/departments/:departmentId/positions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM positions 
       WHERE department_id = $1 
       ORDER BY order_index`,
            [req.params.departmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get all positions for an establishment (via departments)
app.get('/api/db/establishments/:establishmentId/positions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, d.name as department_name 
       FROM positions p
       JOIN departments d ON p.department_id = d.id
       WHERE d.establishment_id = $1 
       ORDER BY d.order_index, p.order_index`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== USER POSITIONS ====================

// Get user positions for a position
app.get('/api/db/positions/:positionId/users', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT up.*, pr.first_name, pr.last_name, pr.email, pr.avatar_url
       FROM user_positions up
       JOIN profiles pr ON up.user_id = pr.id
       WHERE up.position_id = $1 AND up.is_active = true
       ORDER BY pr.last_name, pr.first_name`,
            [req.params.positionId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get all user positions for an establishment (complete organigramme)
app.get('/api/db/establishments/:establishmentId/user-positions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT up.*, 
              p.name as position_name, p.code as position_code, p.is_head,
              d.name as department_name, d.code as department_code, d.type as department_type,
              pr.first_name, pr.last_name, pr.email, pr.avatar_url
       FROM user_positions up
       JOIN positions p ON up.position_id = p.id
       JOIN departments d ON p.department_id = d.id
       JOIN profiles pr ON up.user_id = pr.id
       WHERE d.establishment_id = $1 AND up.is_active = true
       ORDER BY d.order_index, p.order_index, pr.last_name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== LINGUISTIC SECTIONS ====================

// Get linguistic sections for an establishment
app.get('/api/db/establishments/:establishmentId/linguistic-sections', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM linguistic_sections 
       WHERE establishment_id = $1 
       ORDER BY order_index`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== ESTABLISHMENT STAFF ====================

// Get all staff for an establishment (detailed)
app.get('/api/db/establishments/:establishmentId/staff-detailed', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT es.*, pr.first_name, pr.last_name, pr.email, pr.avatar_url
       FROM establishment_staff es
       LEFT JOIN profiles pr ON es.user_id = pr.id
       WHERE es.establishment_id = $1 AND es.is_active = true
       ORDER BY es.staff_type, pr.last_name`,
            [req.params.establishmentId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== DEPARTMENTS CRUD ====================

// Create department
app.post('/api/db/departments', async (req, res) => {
    try {
        const { name, establishment_id, description, order_index, type, code, parent_id } = req.body;
        const result = await pool.query(
            `INSERT INTO departments (name, establishment_id, description, order_index, type, code, parent_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, establishment_id, description || null, order_index || 0, type || 'department', code || null, parent_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update department
app.put('/api/db/departments/:id', async (req, res) => {
    try {
        const { name, description, order_index } = req.body;
        const result = await pool.query(
            `UPDATE departments SET name = COALESCE($2, name), description = COALESCE($3, description), 
             order_index = COALESCE($4, order_index), updated_at = NOW()
             WHERE id = $1 RETURNING *`,
            [req.params.id, name, description, order_index]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete department
app.delete('/api/db/departments/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== POSITIONS CRUD ====================

// Create position
app.post('/api/db/positions', async (req, res) => {
    try {
        const { title, department_id, establishment_id, description, order_index } = req.body;
        const result = await pool.query(
            `INSERT INTO positions (title, department_id, establishment_id, description, order_index)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, department_id, establishment_id, description || null, order_index || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update position
app.put('/api/db/positions/:id', async (req, res) => {
    try {
        const { title, description, order_index } = req.body;
        const result = await pool.query(
            `UPDATE positions SET title = COALESCE($2, title), description = COALESCE($3, description),
             order_index = COALESCE($4, order_index), updated_at = NOW()
             WHERE id = $1 RETURNING *`,
            [req.params.id, title, description, order_index]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Position not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete position
app.delete('/api/db/positions/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM positions WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Position not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== CLASSES CRUD ====================

// Create class
app.post('/api/db/classes', async (req, res) => {
    try {
        const { name, level, section, establishment_id, school_year, capacity, room_number, main_teacher_id } = req.body;
        const result = await pool.query(
            `INSERT INTO classes (name, level, section, establishment_id, school_year, capacity, room_number, main_teacher_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, level, section || null, establishment_id, school_year || '2024-2025', capacity || 35, room_number || null, main_teacher_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update class
app.put('/api/db/classes/:id', async (req, res) => {
    try {
        const { name, level, section, capacity, room_number, main_teacher_id } = req.body;
        const result = await pool.query(
            `UPDATE classes SET name = COALESCE($2, name), level = COALESCE($3, level), section = COALESCE($4, section),
             capacity = COALESCE($5, capacity), room_number = COALESCE($6, room_number), main_teacher_id = COALESCE($7, main_teacher_id),
             updated_at = NOW() WHERE id = $1 RETURNING *`,
            [req.params.id, name, level, section, capacity, room_number, main_teacher_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete class
app.delete('/api/db/classes/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM classes WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== SUBJECTS CRUD ====================

// Create subject
app.post('/api/db/subjects', async (req, res) => {
    try {
        const { name, code, category, coefficient, establishment_id, levels } = req.body;
        const result = await pool.query(
            `INSERT INTO subjects (name, code, category, coefficient, establishment_id, levels)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, code, category || 'general', coefficient || 1, establishment_id, levels || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update subject
app.put('/api/db/subjects/:id', async (req, res) => {
    try {
        const { name, code, category, coefficient, levels } = req.body;
        const result = await pool.query(
            `UPDATE subjects SET name = COALESCE($2, name), code = COALESCE($3, code), category = COALESCE($4, category),
             coefficient = COALESCE($5, coefficient), levels = COALESCE($6, levels), updated_at = NOW()
             WHERE id = $1 RETURNING *`,
            [req.params.id, name, code, category, coefficient, levels]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete subject
app.delete('/api/db/subjects/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== LINGUISTIC SECTIONS CRUD ====================

// Create linguistic section
app.post('/api/db/linguistic-sections', async (req, res) => {
    try {
        const { name, language, establishment_id, description, order_index } = req.body;
        const result = await pool.query(
            `INSERT INTO linguistic_sections (name, language, establishment_id, description, order_index)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, language, establishment_id, description || null, order_index || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete linguistic section
app.delete('/api/db/linguistic-sections/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM linguistic_sections WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Linguistic section not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== PUBLIC PAGE CONFIGURATION ====================

// Get public page config by establishment ID
app.get('/api/db/establishments/:establishmentId/public-config', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM v_establishment_public_page 
             WHERE establishment_id = $1`,
            [req.params.establishmentId]
        );
        if (result.rows.length === 0) {
            // Return empty config if none exists
            return res.json(null);
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get public page by slug (for public rendering)
app.get('/api/db/public-pages/:slug', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM v_establishment_public_page 
             WHERE slug = $1 AND is_published = true`,
            [req.params.slug]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Create or update public page config
app.post('/api/db/establishments/:establishmentId/public-config', async (req, res) => {
    try {
        const { template_id, palette, sections_order, meta, is_published, slug } = req.body;
        const establishmentId = req.params.establishmentId;

        // Check if config exists
        const existing = await pool.query(
            'SELECT id FROM establishment_public_config WHERE establishment_id = $1',
            [establishmentId]
        );

        if (existing.rows.length > 0) {
            // Update existing
            const result = await pool.query(
                `UPDATE establishment_public_config SET
                    template_id = COALESCE($1, template_id),
                    palette = COALESCE($2, palette),
                    sections_order = COALESCE($3, sections_order),
                    meta = COALESCE($4, meta),
                    is_published = COALESCE($5, is_published),
                    slug = COALESCE($6, slug),
                    published_at = CASE WHEN $5 = true AND is_published = false THEN NOW() ELSE published_at END,
                    updated_at = NOW()
                 WHERE establishment_id = $7
                 RETURNING *`,
                [template_id, JSON.stringify(palette), JSON.stringify(sections_order),
                    JSON.stringify(meta), is_published, slug, establishmentId]
            );
            res.json(result.rows[0]);
        } else {
            // Create new
            const result = await pool.query(
                `INSERT INTO establishment_public_config 
                    (establishment_id, template_id, palette, sections_order, meta, is_published, slug, published_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, CASE WHEN $6 = true THEN NOW() ELSE NULL END)
                 RETURNING *`,
                [establishmentId, template_id || 'classique',
                    JSON.stringify(palette) || null,
                    JSON.stringify(sections_order) || null,
                    JSON.stringify(meta) || null,
                    is_published || false, slug]
            );
            res.json(result.rows[0]);
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== PUBLIC PAGE SECTIONS ====================

// Get sections for a config
app.get('/api/db/public-config/:configId/sections', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM public_page_sections 
             WHERE config_id = $1 
             ORDER BY order_index`,
            [req.params.configId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Create section
app.post('/api/db/public-config/:configId/sections', async (req, res) => {
    try {
        const { section_type, content, order_index, is_visible, custom_style } = req.body;
        const result = await pool.query(
            `INSERT INTO public_page_sections 
                (config_id, section_type, content, order_index, is_visible, custom_style)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.params.configId, section_type, JSON.stringify(content),
            order_index || 0, is_visible !== false, JSON.stringify(custom_style)]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update section
app.put('/api/db/sections/:sectionId', async (req, res) => {
    try {
        const { content, order_index, is_visible, custom_style } = req.body;
        const result = await pool.query(
            `UPDATE public_page_sections SET
                content = COALESCE($1, content),
                order_index = COALESCE($2, order_index),
                is_visible = COALESCE($3, is_visible),
                custom_style = COALESCE($4, custom_style),
                updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
            [JSON.stringify(content), order_index, is_visible,
            JSON.stringify(custom_style), req.params.sectionId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete section
app.delete('/api/db/sections/:sectionId', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM public_page_sections WHERE id = $1 RETURNING id',
            [req.params.sectionId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Bulk update sections order
app.put('/api/db/public-config/:configId/sections/reorder', async (req, res) => {
    try {
        const { sections } = req.body; // Array of { id, order_index }
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const section of sections) {
                await client.query(
                    'UPDATE public_page_sections SET order_index = $1 WHERE id = $2',
                    [section.order_index, section.id]
                );
            }
            await client.query('COMMIT');
            res.json({ success: true });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== TEMPLATES & PALETTES ====================
// NOTE: Enhanced multi-page templates endpoint is defined below in the ENHANCED TEMPLATES section

// Get available color palettes
app.get('/api/db/color-palettes', async (_req, res) => {
    const palettes = [
        {
            id: 'ocean',
            name: '🌊 Océan',
            colors: {
                primary: '#0ea5e9',
                secondary: '#06b6d4',
                accent: '#f59e0b',
                background: '#f0f9ff',
                text: '#0c4a6e',
                muted: '#7dd3fc'
            }
        },
        {
            id: 'foret',
            name: '🌳 Forêt',
            colors: {
                primary: '#16a34a',
                secondary: '#84cc16',
                accent: '#eab308',
                background: '#f0fdf4',
                text: '#14532d',
                muted: '#86efac'
            }
        },
        {
            id: 'couchant',
            name: '🌅 Coucher de soleil',
            colors: {
                primary: '#f97316',
                secondary: '#ec4899',
                accent: '#a855f7',
                background: '#fff7ed',
                text: '#7c2d12',
                muted: '#fdba74'
            }
        },
        {
            id: 'academique',
            name: '🎓 Académique',
            colors: {
                primary: '#1e40af',
                secondary: '#3730a3',
                accent: '#ca8a04',
                background: '#eff6ff',
                text: '#1e3a8a',
                muted: '#93c5fd'
            }
        },
        {
            id: 'printemps',
            name: '🌸 Printemps',
            colors: {
                primary: '#ec4899',
                secondary: '#a855f7',
                accent: '#22c55e',
                background: '#fdf2f8',
                text: '#831843',
                muted: '#f9a8d4'
            }
        },
        {
            id: 'monochrome',
            name: '⚫ Monochrome',
            colors: {
                primary: '#18181b',
                secondary: '#3f3f46',
                accent: '#71717a',
                background: '#fafafa',
                text: '#09090b',
                muted: '#a1a1aa'
            }
        }
    ];
    res.json(palettes);
});

// ==================== PUBLIC PAGES ====================

// Get pages for a config
app.get('/api/db/public-config/:configId/pages', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM public_pages 
             WHERE config_id = $1 
             ORDER BY order_index`,
            [req.params.configId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Create page
app.post('/api/db/public-config/:configId/pages', async (req, res) => {
    try {
        const {
            slug, title, is_home, show_in_menu, menu_label,
            order_index, palette_override, meta_title, meta_description
        } = req.body;

        const result = await pool.query(
            `INSERT INTO public_pages 
                (config_id, slug, title, is_home, show_in_menu, menu_label, 
                 order_index, palette_override, meta_title, meta_description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [req.params.configId, slug, title, is_home || false,
            show_in_menu !== false, menu_label || title,
            order_index || 0, JSON.stringify(palette_override),
                meta_title, meta_description]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Update page
app.put('/api/db/pages/:pageId', async (req, res) => {
    try {
        const {
            slug, title, is_home, show_in_menu, menu_label,
            order_index, palette_override, meta_title, meta_description
        } = req.body;

        const result = await pool.query(
            `UPDATE public_pages SET
                slug = COALESCE($1, slug),
                title = COALESCE($2, title),
                is_home = COALESCE($3, is_home),
                show_in_menu = COALESCE($4, show_in_menu),
                menu_label = COALESCE($5, menu_label),
                order_index = COALESCE($6, order_index),
                palette_override = COALESCE($7, palette_override),
                meta_title = COALESCE($8, meta_title),
                meta_description = COALESCE($9, meta_description),
                updated_at = NOW()
             WHERE id = $10
             RETURNING *`,
            [slug, title, is_home, show_in_menu, menu_label,
                order_index, JSON.stringify(palette_override),
                meta_title, meta_description, req.params.pageId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete page
app.delete('/api/db/pages/:pageId', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM public_pages WHERE id = $1 RETURNING id',
            [req.params.pageId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Create section for a page
app.post('/api/db/pages/:pageId/sections', async (req, res) => {
    try {
        const { section_type, content, order_index, is_visible, custom_style, image_config } = req.body;

        // Get config_id from page
        const pageResult = await pool.query(
            'SELECT config_id FROM public_pages WHERE id = $1',
            [req.params.pageId]
        );
        if (pageResult.rows.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }

        const result = await pool.query(
            `INSERT INTO public_page_sections 
                (config_id, page_id, section_type, content, order_index, is_visible, custom_style, image_config)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [pageResult.rows[0].config_id, req.params.pageId, section_type,
            JSON.stringify(content), order_index || 0, is_visible !== false,
            JSON.stringify(custom_style), JSON.stringify(image_config)]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get public page by slug (home page)
app.get('/api/db/public-pages/:slug', async (req, res) => {
    try {
        const configResult = await pool.query(
            `SELECT * FROM v_establishment_public_page 
             WHERE slug = $1 AND is_published = true`,
            [req.params.slug]
        );
        if (configResult.rows.length === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }

        const config = configResult.rows[0];
        const homePage = config.pages?.find((p: any) => p.is_home);
        res.json({ ...config, currentPage: homePage || null });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get public page by slug with specific page
app.get('/api/db/public-pages/:slug/:pageSlug', async (req, res) => {
    try {
        const configResult = await pool.query(
            `SELECT * FROM v_establishment_public_page 
             WHERE slug = $1 AND is_published = true`,
            [req.params.slug]
        );
        if (configResult.rows.length === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }

        const config = configResult.rows[0];
        const requestedPage = config.pages?.find((p: any) => p.slug === req.params.pageSlug);
        if (!requestedPage) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json({ ...config, currentPage: requestedPage });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== ENHANCED TEMPLATES ====================

// Get enhanced templates with multi-page support
app.get('/api/db/public-page-templates', async (_req, res) => {
    const templates = [
        {
            id: 'classique',
            name: 'Classique',
            description: 'Design formel et académique avec couleurs sobres',
            thumbnail: '/templates/classique.png',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'about', 'stats'] },
                { slug: 'a-propos', title: 'À propos', sections: ['about'] },
                { slug: 'contact', title: 'Contact', sections: ['contact'] },
            ],
            defaultPalette: 'academique'
        },
        {
            id: 'moderne',
            name: 'Moderne',
            description: 'Design épuré et contemporain avec grands visuels',
            thumbnail: '/templates/moderne.png',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'stats'] },
                { slug: 'decouvrir', title: 'Découvrir', sections: ['about', 'gallery'] },
                { slug: 'temoignages', title: 'Témoignages', sections: ['testimonials'] },
                { slug: 'contact', title: 'Contact', sections: ['contact'] },
            ],
            defaultPalette: 'ocean'
        },
        {
            id: 'colore',
            name: 'Coloré',
            description: 'Design vibrant et accueillant avec couleurs vives',
            thumbnail: '/templates/colore.png',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'about', 'gallery'] },
                { slug: 'actualites', title: 'Actualités', sections: ['news'] },
                { slug: 'contact', title: 'Contact', sections: ['contact'] },
            ],
            defaultPalette: 'couchant'
        },
        {
            id: 'premium',
            name: 'Premium',
            description: 'Design luxueux noir et or, élégant',
            thumbnail: '/templates/premium.png',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'about'] },
                { slug: 'equipe', title: 'Notre Équipe', sections: ['team'] },
                { slug: 'statistiques', title: 'En Chiffres', sections: ['stats'] },
                { slug: 'temoignages', title: 'Témoignages', sections: ['testimonials'] },
                { slug: 'contact', title: 'Contact', sections: ['contact'] },
            ],
            defaultPalette: 'monochrome'
        },
        {
            id: 'ecologique',
            name: 'Écologique',
            description: 'Design nature avec tons verts et organiques',
            thumbnail: '/templates/ecologique.png',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'about', 'stats'] },
                { slug: 'partenaires', title: 'Partenaires', sections: ['partners'] },
                { slug: 'contact', title: 'Contact', sections: ['contact'] },
            ],
            defaultPalette: 'foret'
        },
        {
            id: 'complet',
            name: 'Complet',
            description: 'Toutes les pages et sections disponibles',
            thumbnail: '/templates/complet.png',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'about', 'stats'] },
                { slug: 'a-propos', title: 'À propos', sections: ['about'] },
                { slug: 'equipe', title: 'Équipe', sections: ['team'] },
                { slug: 'actualites', title: 'Actualités', sections: ['news'] },
                { slug: 'galerie', title: 'Galerie', sections: ['gallery'] },
                { slug: 'temoignages', title: 'Témoignages', sections: ['testimonials'] },
                { slug: 'partenaires', title: 'Partenaires', sections: ['partners'] },
                { slug: 'evenements', title: 'Événements', sections: ['events'] },
                { slug: 'contact', title: 'Contact', sections: ['contact'] },
            ],
            defaultPalette: 'academique'
        },
        {
            id: 'minimal',
            name: 'Minimal',
            description: 'Une seule page d\'accueil simple',
            thumbnail: '/templates/minimal.png',
            pages: [
                { slug: 'accueil', title: 'Accueil', is_home: true, sections: ['hero', 'contact'] },
            ],
            defaultPalette: 'monochrome'
        },
        {
            id: 'personnalise',
            name: 'Personnalisé',
            description: 'Commencez de zéro - Création totalement libre',
            thumbnail: '/templates/personnalise.png',
            pages: [],
            defaultPalette: null,
            isCustom: true
        }
    ];
    res.json(templates);
});

// ==================== IMAGE UPLOAD ====================

import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Configure multer for image uploads
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'establishments');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});

// Upload image for establishment
app.post('/api/db/establishments/:establishmentId/media', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { category, alt_text, caption } = req.body;
        const url = `/uploads/establishments/${req.file.filename}`;

        const result = await pool.query(
            `INSERT INTO establishment_media 
                (establishment_id, filename, original_name, mime_type, file_size, url, category, alt_text, caption)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [req.params.establishmentId, req.file.filename, req.file.originalname,
            req.file.mimetype, req.file.size, url, category || 'general',
                alt_text, caption]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Get media for establishment
app.get('/api/db/establishments/:establishmentId/media', async (req, res) => {
    try {
        const category = req.query.category;
        let query = 'SELECT * FROM establishment_media WHERE establishment_id = $1';
        const params: any[] = [req.params.establishmentId];

        if (category) {
            query += ' AND category = $2';
            params.push(category);
        }
        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Delete media
app.delete('/api/db/media/:mediaId', async (req, res) => {
    try {
        // Get file info first
        const mediaResult = await pool.query(
            'SELECT filename FROM establishment_media WHERE id = $1',
            [req.params.mediaId]
        );

        if (mediaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Media not found' });
        }

        // Delete file from disk
        const filePath = path.join(uploadDir, mediaResult.rows[0].filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await pool.query('DELETE FROM establishment_media WHERE id = $1', [req.params.mediaId]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// ==================== STATIC FILE SERVING (Production) ====================


if (process.env.NODE_ENV === 'production') {
    // In production, static files are at ../dist relative to server/ directory
    const staticPath = path.join(__dirname, '..', 'dist');

    // Serve static files from Vite build
    app.use(express.static(staticPath));

    // SPA fallback: serve index.html for all non-API routes
    // Express 5 requires named parameter syntax for catch-all
    app.get('/{*path}', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(staticPath, 'index.html'));
        }
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Cloud SQL API server running on port ${PORT}`);
    console.log(`📦 Database: idetude-db`);
    console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
    if (isCloudRun) {
        console.log(`☁️  Cloud Run: Using Unix socket /cloudsql/${CLOUD_SQL_CONNECTION_NAME}`);
    }
});

export default app;
