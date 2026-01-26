-- Table pour les conversations de chat en temps réel
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Table pour les messages de chat
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les frais scolaires
CREATE TABLE public.school_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  school_year TEXT NOT NULL,
  fee_type TEXT NOT NULL DEFAULT 'tuition',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique des paiements
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id UUID NOT NULL REFERENCES public.school_fees(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les rendez-vous parent-enseignant
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can update their conversations"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Super admins can manage all conversations"
  ON public.chat_conversations FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  ));

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  ));

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Super admins can manage all messages"
  ON public.chat_messages FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for school_fees
CREATE POLICY "Students can view their fees"
  ON public.school_fees FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Super admins can manage all fees"
  ON public.school_fees FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for payments
CREATE POLICY "Students can view their payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Super admins can manage all payments"
  ON public.payments FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for appointments
CREATE POLICY "Parents can view their appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Teachers can view their appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Parents can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can update their appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = parent_id OR auth.uid() = teacher_id);

CREATE POLICY "Super admins can manage all appointments"
  ON public.appointments FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_fees_updated_at
  BEFORE UPDATE ON public.school_fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;