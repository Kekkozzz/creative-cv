-- Fix: rimuove possibilita' di insert anonime via client.
-- Le quote anonime (user_id IS NULL) passano solo via service role.
DROP POLICY "Users can insert own quotes" ON public.quotes;

CREATE POLICY "Users can insert own quotes"
  ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
