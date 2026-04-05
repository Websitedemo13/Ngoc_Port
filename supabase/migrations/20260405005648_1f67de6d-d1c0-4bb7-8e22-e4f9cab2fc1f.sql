DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
DROP POLICY IF EXISTS "Public can view safe settings only" ON public.settings;

CREATE POLICY "Public can view safe settings only"
ON public.settings
FOR SELECT
TO public
USING (
  key = ANY (
    ARRAY[
      'logo_url',
      'favicon_url',
      'site_name',
      'footer_tagline',
      'footer_text',
      'header_style',
      'footer_style',
      'page_about',
      'page_projects',
      'page_blog',
      'page_contact',
      'page_store',
      'page_heroes',
      'show_testimonials',
      'color_theme',
      'custom_theme_colors',
      'font_theme',
      'bank_name',
      'bank_code',
      'bank_account',
      'bank_owner'
    ]
  )
);

DROP POLICY IF EXISTS "Admins can update hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hero images" ON storage.objects;

CREATE POLICY "Admins can update hero images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hero-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'hero-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete hero images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hero-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);