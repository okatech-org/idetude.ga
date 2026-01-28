/**
 * Cloud SQL Connection Configuration for iEtude
 * Instance: idetude-db (project: idetude)
 * Region: europe-west1-b
 */

export const cloudSqlConfig = {
    // Instance connection details
    host: import.meta.env.VITE_CLOUDSQL_HOST || '35.195.248.19',
    port: parseInt(import.meta.env.VITE_CLOUDSQL_PORT || '5432'),
    database: import.meta.env.VITE_CLOUDSQL_DATABASE || 'postgres',
    user: import.meta.env.VITE_CLOUDSQL_USER || 'postgres',

    // For production, use Cloud SQL Proxy or Private IP
    // ssl: {
    //   rejectUnauthorized: false,
    // },

    // Connection pool settings
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// API endpoint for Cloud SQL proxy (for frontend use)
export const CLOUDSQL_API_URL = import.meta.env.VITE_CLOUDSQL_API_URL || '/api/db';

// GCP Project info
export const GCP_PROJECT_ID = 'idetude';
export const CLOUDSQL_INSTANCE_NAME = 'idetude-db';
export const CLOUDSQL_REGION = 'europe-west1';
