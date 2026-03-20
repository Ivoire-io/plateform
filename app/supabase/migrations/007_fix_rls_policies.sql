-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 007: Correction des policies RLS manquantes
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Waitlist : policy SELECT pour les admins ───
-- (INSERT public déjà définie en migration 001)
DROP POLICY IF EXISTS "waitlist_select_admin" ON ivoireio_waitlist;
CREATE POLICY "waitlist_select_admin"
  ON ivoireio_waitlist FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "waitlist_update_admin" ON ivoireio_waitlist;
CREATE POLICY "waitlist_update_admin"
  ON ivoireio_waitlist FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "waitlist_delete_admin" ON ivoireio_waitlist;
CREATE POLICY "waitlist_delete_admin"
  ON ivoireio_waitlist FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ─── Link Clicks : policy SELECT pour les admins ───
-- (INSERT public + SELECT own déjà définies en migration 004)
DROP POLICY IF EXISTS "clicks_select_admin" ON ivoireio_link_clicks;
CREATE POLICY "clicks_select_admin"
  ON ivoireio_link_clicks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ─── Favorites : policy SELECT pour les admins ───
DROP POLICY IF EXISTS "favorites_select_admin" ON ivoireio_favorites;
CREATE POLICY "favorites_select_admin"
  ON ivoireio_favorites FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true)
  );
