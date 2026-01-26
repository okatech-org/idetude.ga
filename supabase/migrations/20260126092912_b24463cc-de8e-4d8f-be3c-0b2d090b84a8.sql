-- Create schedules table for class timetables
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  room TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  school_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_cards table for storing generated report cards
CREATE TABLE public.report_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trimester INTEGER NOT NULL CHECK (trimester >= 1 AND trimester <= 3),
  school_year TEXT NOT NULL,
  general_average NUMERIC(4,2),
  class_average NUMERIC(4,2),
  rank INTEGER,
  teacher_comment TEXT,
  principal_comment TEXT,
  generated_by UUID REFERENCES public.profiles(id),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, trimester, school_year)
);

-- Enable RLS on schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Enable RLS on report_cards
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

-- Schedules policies
CREATE POLICY "Teachers can manage their own schedules"
ON public.schedules FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Everyone can view schedules"
ON public.schedules FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage all schedules"
ON public.schedules FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Report cards policies
CREATE POLICY "Students can view their own report cards"
ON public.report_cards FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Staff can create report cards"
ON public.report_cards FOR INSERT
WITH CHECK (auth.uid() = generated_by);

CREATE POLICY "Staff can update report cards they generated"
ON public.report_cards FOR UPDATE
USING (auth.uid() = generated_by);

CREATE POLICY "Super admins can manage all report cards"
ON public.report_cards FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Triggers for updated_at
CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_cards_updated_at
BEFORE UPDATE ON public.report_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();