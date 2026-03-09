
CREATE TABLE public.custom_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  content text,
  image_url text,
  page text NOT NULL DEFAULT 'home',
  section_type text NOT NULL DEFAULT 'content',
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  show_title boolean DEFAULT true,
  background_style text DEFAULT 'default',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published custom sections" ON public.custom_sections
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage custom sections" ON public.custom_sections
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_custom_sections_updated_at
  BEFORE UPDATE ON public.custom_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
