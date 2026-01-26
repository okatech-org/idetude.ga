-- =====================================================
-- ESTABLISHMENT CONFIGURATION SCHEMA
-- Includes: establishments, groups, departments, positions, classes
-- =====================================================

-- Establishment Groups (e.g., "Groupe Scolaire Excellence")
CREATE TABLE public.establishment_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  location TEXT,
  country_code TEXT NOT NULL DEFAULT 'GA',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Establishments (Schools)
CREATE TABLE public.establishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.establishment_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('primaire', 'college', 'lycee', 'superieur', 'technique')),
  address TEXT,
  phone TEXT,
  email TEXT,
  country_code TEXT NOT NULL DEFAULT 'GA',
  levels TEXT,
  options TEXT[],
  student_capacity INTEGER,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Departments/Services within establishments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT NOT NULL CHECK (type IN ('direction', 'department', 'service', 'bureau')),
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Positions/Posts within departments
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  is_head BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User positions (linking users to positions)
CREATE TABLE public.user_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  position_id UUID REFERENCES public.positions(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, position_id, start_date)
);

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  level TEXT NOT NULL,
  section TEXT,
  school_year TEXT NOT NULL,
  capacity INTEGER,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Class teachers (linking teachers to classes)
CREATE TABLE public.class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  is_main_teacher BOOLEAN DEFAULT false,
  school_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, teacher_id, subject, school_year)
);

-- Class students (linking students to classes)
CREATE TABLE public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school_year TEXT NOT NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'graduated', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id, school_year)
);

-- User establishment affiliation (which establishment a user belongs to)
CREATE TABLE public.user_establishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, establishment_id)
);

-- Enable RLS on all tables
ALTER TABLE public.establishment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_establishments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for establishment_groups
CREATE POLICY "Super admins can manage all groups" ON public.establishment_groups
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Everyone can view groups" ON public.establishment_groups
  FOR SELECT USING (true);

-- RLS Policies for establishments
CREATE POLICY "Super admins can manage all establishments" ON public.establishments
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School directors can manage their establishment" ON public.establishments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_establishments ue
      WHERE ue.establishment_id = establishments.id
      AND ue.user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'school_director')
  );

CREATE POLICY "Everyone can view establishments" ON public.establishments
  FOR SELECT USING (true);

-- RLS Policies for departments
CREATE POLICY "Super admins can manage all departments" ON public.departments
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can manage their departments" ON public.departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_establishments ue
      WHERE ue.establishment_id = departments.establishment_id
      AND ue.user_id = auth.uid()
    )
    AND (has_role(auth.uid(), 'school_director') OR has_role(auth.uid(), 'school_admin'))
  );

CREATE POLICY "Establishment users can view departments" ON public.departments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_establishments ue
      WHERE ue.establishment_id = departments.establishment_id
      AND ue.user_id = auth.uid()
    )
  );

-- RLS Policies for positions
CREATE POLICY "Super admins can manage all positions" ON public.positions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can manage positions" ON public.positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.departments d
      JOIN public.user_establishments ue ON ue.establishment_id = d.establishment_id
      WHERE d.id = positions.department_id
      AND ue.user_id = auth.uid()
    )
    AND (has_role(auth.uid(), 'school_director') OR has_role(auth.uid(), 'school_admin'))
  );

CREATE POLICY "Establishment users can view positions" ON public.positions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.departments d
      JOIN public.user_establishments ue ON ue.establishment_id = d.establishment_id
      WHERE d.id = positions.department_id
      AND ue.user_id = auth.uid()
    )
  );

-- RLS Policies for user_positions
CREATE POLICY "Super admins can manage all user positions" ON public.user_positions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can manage user positions" ON public.user_positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.positions p
      JOIN public.departments d ON d.id = p.department_id
      JOIN public.user_establishments ue ON ue.establishment_id = d.establishment_id
      WHERE p.id = user_positions.position_id
      AND ue.user_id = auth.uid()
    )
    AND (has_role(auth.uid(), 'school_director') OR has_role(auth.uid(), 'school_admin'))
  );

CREATE POLICY "Users can view their own positions" ON public.user_positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Establishment users can view positions" ON public.user_positions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.positions p
      JOIN public.departments d ON d.id = p.department_id
      JOIN public.user_establishments ue ON ue.establishment_id = d.establishment_id
      WHERE p.id = user_positions.position_id
      AND ue.user_id = auth.uid()
    )
  );

-- RLS Policies for classes
CREATE POLICY "Super admins can manage all classes" ON public.classes
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can manage classes" ON public.classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_establishments ue
      WHERE ue.establishment_id = classes.establishment_id
      AND ue.user_id = auth.uid()
    )
    AND (has_role(auth.uid(), 'school_director') OR has_role(auth.uid(), 'school_admin') OR has_role(auth.uid(), 'cpe'))
  );

CREATE POLICY "Establishment users can view classes" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_establishments ue
      WHERE ue.establishment_id = classes.establishment_id
      AND ue.user_id = auth.uid()
    )
  );

-- RLS Policies for class_teachers
CREATE POLICY "Super admins can manage all class teachers" ON public.class_teachers
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can manage class teachers" ON public.class_teachers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.user_establishments ue ON ue.establishment_id = c.establishment_id
      WHERE c.id = class_teachers.class_id
      AND ue.user_id = auth.uid()
    )
    AND (has_role(auth.uid(), 'school_director') OR has_role(auth.uid(), 'school_admin'))
  );

CREATE POLICY "Teachers can view their classes" ON public.class_teachers
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Establishment users can view class teachers" ON public.class_teachers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.user_establishments ue ON ue.establishment_id = c.establishment_id
      WHERE c.id = class_teachers.class_id
      AND ue.user_id = auth.uid()
    )
  );

-- RLS Policies for class_students
CREATE POLICY "Super admins can manage all class students" ON public.class_students
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can manage class students" ON public.class_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.user_establishments ue ON ue.establishment_id = c.establishment_id
      WHERE c.id = class_students.class_id
      AND ue.user_id = auth.uid()
    )
    AND (has_role(auth.uid(), 'school_director') OR has_role(auth.uid(), 'school_admin') OR has_role(auth.uid(), 'cpe'))
  );

CREATE POLICY "Students can view their own class enrollment" ON public.class_students
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view their class students" ON public.class_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_teachers ct
      WHERE ct.class_id = class_students.class_id
      AND ct.teacher_id = auth.uid()
    )
  );

-- RLS Policies for user_establishments
CREATE POLICY "Super admins can manage all user establishments" ON public.user_establishments
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School directors can manage their establishment users" ON public.user_establishments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_establishments ue2
      WHERE ue2.establishment_id = user_establishments.establishment_id
      AND ue2.user_id = auth.uid()
    )
    AND has_role(auth.uid(), 'school_director')
  );

CREATE POLICY "Users can view their own establishment affiliations" ON public.user_establishments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Establishment users can view affiliations" ON public.user_establishments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_establishments ue2
      WHERE ue2.establishment_id = user_establishments.establishment_id
      AND ue2.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_establishment_groups_updated_at
  BEFORE UPDATE ON public.establishment_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_establishments_updated_at
  BEFORE UPDATE ON public.establishments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_positions_updated_at
  BEFORE UPDATE ON public.user_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();