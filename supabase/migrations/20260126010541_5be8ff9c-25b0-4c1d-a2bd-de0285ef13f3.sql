-- Create messages table for internal messaging
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create grades table for academic grades
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 20),
  coefficient DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  grade_type TEXT NOT NULL DEFAULT 'devoir',
  description TEXT,
  trimester INTEGER NOT NULL CHECK (trimester >= 1 AND trimester <= 3),
  school_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create absences table for attendance tracking
CREATE TABLE public.absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  absence_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  absence_type TEXT NOT NULL DEFAULT 'absence' CHECK (absence_type IN ('absence', 'retard')),
  is_justified BOOLEAN NOT NULL DEFAULT false,
  justification TEXT,
  justified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  justified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

-- Messages RLS policies
CREATE POLICY "Users can view messages they sent or received"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Super admins can view all messages"
ON public.messages FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Grades RLS policies
CREATE POLICY "Teachers can view grades they created"
ON public.grades FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their own grades"
ON public.grades FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can create grades"
ON public.grades FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own grades"
ON public.grades FOR UPDATE
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own grades"
ON public.grades FOR DELETE
USING (auth.uid() = teacher_id);

CREATE POLICY "Super admins can manage all grades"
ON public.grades FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Absences RLS policies
CREATE POLICY "Staff can view absences they recorded"
ON public.absences FOR SELECT
USING (auth.uid() = recorded_by);

CREATE POLICY "Students can view their own absences"
ON public.absences FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Staff can record absences"
ON public.absences FOR INSERT
WITH CHECK (auth.uid() = recorded_by);

CREATE POLICY "Staff can update absences they recorded"
ON public.absences FOR UPDATE
USING (auth.uid() = recorded_by OR auth.uid() = justified_by);

CREATE POLICY "Super admins can manage all absences"
ON public.absences FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grades_updated_at
BEFORE UPDATE ON public.grades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_absences_updated_at
BEFORE UPDATE ON public.absences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;