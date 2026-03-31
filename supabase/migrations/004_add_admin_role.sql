-- Campo role nella tabella profiles
ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- CRITICAL: Prevent users from modifying their own role via self-update.
-- The original "Users can update own profile" policy allows unrestricted column updates.
-- We replace it with a version that ensures `role` cannot be changed by the user.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Policy: admin può leggere tutte le quote
CREATE POLICY "Admins can view all quotes"
  ON public.quotes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: admin può aggiornare tutte le quote
CREATE POLICY "Admins can update all quotes"
  ON public.quotes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: admin può leggere tutte le preview
CREATE POLICY "Admins can view all previews"
  ON public.previews FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: admin può leggere tutti i profili
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
