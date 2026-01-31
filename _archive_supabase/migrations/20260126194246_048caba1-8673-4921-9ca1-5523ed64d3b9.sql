-- Create establishment_drafts table for saving drafts
CREATE TABLE public.establishment_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  data jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  last_step text DEFAULT 'informations',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create establishment_staff table for all personnel
CREATE TABLE public.establishment_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_type text NOT NULL CHECK (staff_type IN ('direction', 'admin', 'teacher', 'student', 'tutor', 'technical')),
  position text,
  department text,
  contract_type text CHECK (contract_type IN ('permanent', 'temporary', 'contractor', 'intern')),
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_establishment_drafts_user_id ON public.establishment_drafts(user_id);
CREATE INDEX idx_establishment_staff_establishment_id ON public.establishment_staff(establishment_id);
CREATE INDEX idx_establishment_staff_user_id ON public.establishment_staff(user_id);
CREATE INDEX idx_establishment_staff_type ON public.establishment_staff(staff_type);

-- Enable RLS
ALTER TABLE public.establishment_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishment_staff ENABLE ROW LEVEL SECURITY;

-- RLS policies for drafts
CREATE POLICY "Users can manage their own drafts"
  ON public.establishment_drafts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all drafts"
  ON public.establishment_drafts FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS policies for staff
CREATE POLICY "Establishment users can view staff"
  ON public.establishment_staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_establishments ue
      WHERE ue.establishment_id = establishment_staff.establishment_id
        AND ue.user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage staff"
  ON public.establishment_staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_establishments ue
      WHERE ue.establishment_id = establishment_staff.establishment_id
        AND ue.user_id = auth.uid()
    ) AND (
      has_role(auth.uid(), 'school_director') OR 
      has_role(auth.uid(), 'school_admin')
    )
  );

CREATE POLICY "Super admins can manage all staff"
  ON public.establishment_staff FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Update triggers
CREATE TRIGGER update_establishment_drafts_updated_at
  BEFORE UPDATE ON public.establishment_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_establishment_staff_updated_at
  BEFORE UPDATE ON public.establishment_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();