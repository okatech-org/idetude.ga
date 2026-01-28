import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// Replicate connection logic
const pool = new Pool({
    host: process.env.CLOUDSQL_HOST || '35.195.248.19',
    port: parseInt(process.env.CLOUDSQL_PORT || '5432'),
    database: process.env.CLOUDSQL_DATABASE || 'postgres',
    user: process.env.CLOUDSQL_USER || 'postgres',
    password: process.env.CLOUDSQL_PASSWORD || 'sovereign_db_pass_2026',
    max: 10,
    idleTimeoutMillis: 30000,
    // Disable SSL when using Cloud SQL Proxy (localhost), enable for direct connection
    ssl: (process.env.CLOUDSQL_HOST === '127.0.0.1' || process.env.CLOUDSQL_HOST === 'localhost')
        ? false
        : { rejectUnauthorized: false },
});

async function runSeed() {
    const files = [
        'sql/01_schema_extension.sql',
        'sql/02_seed_staff.sql',
        'sql/03_seed_subjects_classes.sql',
        'sql/04_seed_students_part1.sql',
        'sql/05_seed_students_part2.sql',
        'sql/06_seed_students_part3.sql'
    ];

    try {
        console.log('🌱 Starting sequential seed process...');
        console.log(`🔌 Target: ${process.env.CLOUDSQL_HOST || 'default'}:${process.env.CLOUDSQL_PORT || 'default'}`);

        const client = await pool.connect();
        try {
            console.log('🔌 Connected to database');

            for (const file of files) {
                const sqlPath = path.join(process.cwd(), file);
                if (!fs.existsSync(sqlPath)) {
                    throw new Error(`File not found: ${file}`);
                }
                const sql = fs.readFileSync(sqlPath, 'utf8');
                console.log(`📄 Executing ${file} (${sql.length} bytes)...`);

                // Execute logic
                await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query('COMMIT');
                    console.log(`✅ ${file} completed.`);
                } catch (sqlError) {
                    await client.query('ROLLBACK');
                    console.error(`❌ Error in ${file}:`, sqlError);
                    throw sqlError;
                }

                // Small delay to be gentle
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log('🎉 All seed scripts completed successfully!');
        } catch (e) {
            // Already rolled back inside loop if needed, but safe to ensure here
            throw e;
        } finally {
            client.release();
        }
    } catch (e) {
        console.error('❌ Seed failed execution:', e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runSeed();
