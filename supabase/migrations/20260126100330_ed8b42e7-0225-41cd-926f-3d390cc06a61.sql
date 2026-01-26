-- Create table for class groups (discussion forums)
CREATE TABLE public.class_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  class_name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for group members
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.class_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create table for group messages
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.class_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_moderated BOOLEAN NOT NULL DEFAULT false,
  moderated_by UUID REFERENCES public.profiles(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for school events calendar
CREATE TABLE public.school_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'general',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  target_audience TEXT NOT NULL DEFAULT 'all',
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for event reminders
CREATE TABLE public.event_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.school_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id, remind_at)
);

-- Enable RLS
ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- Class groups policies
CREATE POLICY "Teachers can manage their groups"
ON public.class_groups
FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Members can view their groups"
ON public.class_groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = id AND user_id = auth.uid()
  )
  OR auth.uid() = teacher_id
);

CREATE POLICY "Super admins can manage all groups"
ON public.class_groups
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Group members policies
CREATE POLICY "Teachers can manage group members"
ON public.group_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.class_groups
    WHERE id = group_id AND teacher_id = auth.uid()
  )
);

CREATE POLICY "Users can view their memberships"
ON public.group_members
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all members"
ON public.group_members
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Group messages policies
CREATE POLICY "Members can view group messages"
ON public.group_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.class_groups
    WHERE id = group_messages.group_id AND teacher_id = auth.uid()
  )
);

CREATE POLICY "Members can send messages"
ON public.group_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_messages.group_id AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.class_groups
      WHERE id = group_messages.group_id AND teacher_id = auth.uid()
    )
  )
);

CREATE POLICY "Teachers can moderate messages"
ON public.group_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.class_groups
    WHERE id = group_messages.group_id AND teacher_id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage all messages"
ON public.group_messages
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- School events policies
CREATE POLICY "Everyone can view events"
ON public.school_events
FOR SELECT
USING (true);

CREATE POLICY "Staff can create events"
ON public.school_events
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their events"
ON public.school_events
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Super admins can manage all events"
ON public.school_events
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Event reminders policies
CREATE POLICY "Users can manage their reminders"
ON public.event_reminders
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all reminders"
ON public.event_reminders
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

-- Triggers for updated_at
CREATE TRIGGER update_class_groups_updated_at
BEFORE UPDATE ON public.class_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at
BEFORE UPDATE ON public.group_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_events_updated_at
BEFORE UPDATE ON public.school_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();