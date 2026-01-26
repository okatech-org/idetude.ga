-- Create countries table for ecosystem management
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL DEFAULT '🏳️',
  currency TEXT NOT NULL DEFAULT 'XAF',
  timezone TEXT NOT NULL DEFAULT 'Africa/Libreville',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create regions table for ecosystem management
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  capital TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_code, code)
);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for countries
CREATE POLICY "Everyone can view countries" 
ON public.countries 
FOR SELECT 
USING (true);

CREATE POLICY "Super admins can manage all countries" 
ON public.countries 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for regions
CREATE POLICY "Everyone can view regions" 
ON public.regions 
FOR SELECT 
USING (true);

CREATE POLICY "Super admins can manage all regions" 
ON public.regions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_countries_updated_at
BEFORE UPDATE ON public.countries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regions_updated_at
BEFORE UPDATE ON public.regions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default countries
INSERT INTO public.countries (code, name, flag_emoji, currency, timezone) VALUES
('GA', 'Gabon', '🇬🇦', 'XAF', 'Africa/Libreville'),
('CD', 'République Démocratique du Congo', '🇨🇩', 'CDF', 'Africa/Kinshasa'),
('CG', 'Congo-Brazzaville', '🇨🇬', 'XAF', 'Africa/Brazzaville'),
('CM', 'Cameroun', '🇨🇲', 'XAF', 'Africa/Douala'),
('CI', 'Côte d''Ivoire', '🇨🇮', 'XOF', 'Africa/Abidjan'),
('SN', 'Sénégal', '🇸🇳', 'XOF', 'Africa/Dakar'),
('FR', 'France', '🇫🇷', 'EUR', 'Europe/Paris'),
('BE', 'Belgique', '🇧🇪', 'EUR', 'Europe/Brussels');

-- Insert default regions for Gabon
INSERT INTO public.regions (code, name, country_code, capital) VALUES
('EST', 'Estuaire', 'GA', 'Libreville'),
('HO', 'Haut-Ogooué', 'GA', 'Franceville'),
('MO', 'Moyen-Ogooué', 'GA', 'Lambaréné'),
('NG', 'Ngounié', 'GA', 'Mouila'),
('NY', 'Nyanga', 'GA', 'Tchibanga'),
('OI', 'Ogooué-Ivindo', 'GA', 'Makokou'),
('OL', 'Ogooué-Lolo', 'GA', 'Koulamoutou'),
('OM', 'Ogooué-Maritime', 'GA', 'Port-Gentil'),
('WN', 'Woleu-Ntem', 'GA', 'Oyem');

-- Insert default regions for DRC
INSERT INTO public.regions (code, name, country_code, capital) VALUES
('KIN', 'Kinshasa', 'CD', 'Kinshasa'),
('KAT', 'Katanga', 'CD', 'Lubumbashi'),
('NK', 'Nord-Kivu', 'CD', 'Goma'),
('SK', 'Sud-Kivu', 'CD', 'Bukavu'),
('EQ', 'Équateur', 'CD', 'Mbandaka'),
('BC', 'Bas-Congo', 'CD', 'Matadi');

-- Insert default regions for Cameroon
INSERT INTO public.regions (code, name, country_code, capital) VALUES
('CE', 'Centre', 'CM', 'Yaoundé'),
('LT', 'Littoral', 'CM', 'Douala'),
('OU', 'Ouest', 'CM', 'Bafoussam'),
('NO', 'Nord', 'CM', 'Garoua'),
('SU', 'Sud', 'CM', 'Ebolowa');