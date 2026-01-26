-- Add enabled_modules column to establishments table
-- This stores the list of enabled service modules for each establishment
ALTER TABLE public.establishments
ADD COLUMN IF NOT EXISTS enabled_modules text[] DEFAULT ARRAY[
  'messages',
  'chat', 
  'grades',
  'assignments',
  'absences',
  'schedule',
  'report_cards',
  'competencies',
  'resources',
  'documents',
  'calendar',
  'groups',
  'payments',
  'appointments',
  'analytics',
  'export'
];

-- Add comment for documentation
COMMENT ON COLUMN public.establishments.enabled_modules IS 'List of enabled service modules for this establishment';