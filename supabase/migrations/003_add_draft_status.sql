-- Aggiunge status "draft" per catturare lead che generano preview ma non completano il contatto
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_status_check
  CHECK (status IN ('draft','new','contacted','in_progress','quoted','accepted','rejected','archived'));

-- Policy UPDATE per utenti autenticati (necessaria per aggiornare draft → new allo step 6)
CREATE POLICY "Users can update own quotes"
  ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
