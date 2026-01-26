-- Create table for push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Create table for shared documents
CREATE TABLE public.shared_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  shared_with UUID REFERENCES public.profiles(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;

-- Push subscriptions policies
CREATE POLICY "Users can manage their own subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all subscriptions"
ON public.push_subscriptions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Shared documents policies
CREATE POLICY "Users can view documents shared with them"
ON public.shared_documents
FOR SELECT
USING (
  auth.uid() = uploaded_by 
  OR auth.uid() = shared_with 
  OR is_public = true
);

CREATE POLICY "Users can upload documents"
ON public.shared_documents
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own documents"
ON public.shared_documents
FOR UPDATE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own documents"
ON public.shared_documents
FOR DELETE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Super admins can manage all documents"
ON public.shared_documents
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Triggers for updated_at
CREATE TRIGGER update_shared_documents_updated_at
BEFORE UPDATE ON public.shared_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();