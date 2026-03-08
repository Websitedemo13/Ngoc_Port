
-- Create media_library table
CREATE TABLE public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  file_type text,
  file_size integer,
  alt_text_en text,
  alt_text_vi text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage media" ON public.media_library
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view media" ON public.media_library
  FOR SELECT USING (true);

-- Create portfolio-media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media', 'portfolio-media', true);

CREATE POLICY "Anyone can view media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admins can upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-media' AND public.has_role(auth.uid(), 'admin'::app_role));
