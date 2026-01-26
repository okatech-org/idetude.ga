-- Create assignments table for homework management
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_points INTEGER DEFAULT 20,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submissions table for student submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  grade NUMERIC(4,2),
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES public.profiles(id),
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'grade', 'absence', 'assignment', 'submission')),
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Teachers can manage their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Everyone can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Super admins can manage all assignments" ON public.assignments;

CREATE POLICY "Teachers can manage their own assignments"
ON public.assignments FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Everyone can view assignments"
ON public.assignments FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage all assignments"
ON public.assignments FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Submissions policies
DROP POLICY IF EXISTS "Students can manage their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Teachers can grade submissions" ON public.submissions;
DROP POLICY IF EXISTS "Super admins can manage all submissions" ON public.submissions;

CREATE POLICY "Students can manage their own submissions"
ON public.submissions FOR ALL
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all submissions"
ON public.submissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.assignments a 
  WHERE a.id = assignment_id AND a.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can grade submissions"
ON public.submissions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.assignments a 
  WHERE a.id = assignment_id AND a.teacher_id = auth.uid()
));

CREATE POLICY "Super admins can manage all submissions"
ON public.submissions FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Super admins can manage all notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Super admins can manage all notifications"
ON public.notifications FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_assignments_updated_at ON public.assignments;
DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;

CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();