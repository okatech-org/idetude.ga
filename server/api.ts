/**
 * Cloud SQL API Proxy Server for iEtude
 * This server provides secure access to the Cloud SQL database
 * Run with: npx ts-node server/api.ts
 */

import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection pool
const pool = new Pool({
    max: 10,
    idleTimeoutMillis: 30000,
    // Disable SSL when using Cloud SQL Proxy (localhost), enable for direct connection
    ssl: (process.env.CLOUDSQL_HOST === '127.0.0.1' || process.env.CLOUDSQL_HOST === 'localhost')
        ? false
        : { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/db/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', timestamp: result.rows[0].now });
    } catch (error) {
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
            'SELECT * FROM classes WHERE establishment_id = $1 ORDER BY name',
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Cloud SQL API server running on port ${PORT}`);
    console.log(`📦 Database: idetude-db (35.195.248.19)`);
});

export default app;
