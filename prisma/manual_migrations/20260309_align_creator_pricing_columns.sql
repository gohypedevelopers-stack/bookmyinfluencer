-- Idempotent Postgres/Neon fix for creator pricing drift.
-- Run this against the exact Neon branch used by Vercel if `public.creators.price`
-- (or the related pricing columns) are missing.

BEGIN;

ALTER TABLE public.creators
    ADD COLUMN IF NOT EXISTS price INTEGER,
    ADD COLUMN IF NOT EXISTS price_story INTEGER,
    ADD COLUMN IF NOT EXISTS price_post INTEGER,
    ADD COLUMN IF NOT EXISTS price_collab INTEGER,
    ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'Per Post';

UPDATE public.creators
SET price = COALESCE(price, price_post, price_collab, price_story)
WHERE price IS NULL;

COMMIT;
