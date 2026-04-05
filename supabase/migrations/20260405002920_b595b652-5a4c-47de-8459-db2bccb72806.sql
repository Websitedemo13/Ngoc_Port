
-- 1. Fix user_roles: drop broken service_role policy, add proper admin-only write policy
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix project-images storage: restrict uploads to admins only
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload project images" ON storage.objects;

CREATE POLICY "Admins can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Fix hero-images storage: restrict uploads to admins only
DROP POLICY IF EXISTS "Allow upload hero images 1vxel63_0" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload hero images" ON storage.objects;

CREATE POLICY "Admins can upload hero images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hero-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Fix vouchers: restrict public read to code-based lookup only (not full list)
DROP POLICY IF EXISTS "Anyone can view active vouchers" ON public.vouchers;

CREATE POLICY "Authenticated users can view active vouchers"
ON public.vouchers
FOR SELECT
TO authenticated
USING (active = true);
