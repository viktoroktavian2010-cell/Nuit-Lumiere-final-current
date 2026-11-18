# Supabase setup

1. The root `.env` is configured for the supplied project using its publishable key. For deployment, set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values in the host environment; the server-side catalog reader accepts those names or `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
2. The supplied project's REST API reported that `public.products` is missing. Run `products_setup.sql` in Supabase SQL Editor, then run `seed.sql` to insert the 12 included catalog products.
3. Restart/rebuild the app after setting the Vite variables. The Admin product list reads from Supabase, and product create/edit/price/delete operations are persisted there. Public catalog reads prefer Supabase when configured and fall back to the existing database/seed if Supabase is unavailable.

## Seed-data count

The supplied project archive contains **12 complete mock product records** in `shared/catalog.ts`, not 30. `seed.sql` inserts those 12 exact records. The remaining 11 product image files do not have complete product records in the supplied source, so they were not turned into invented products. The source also has no year, fragrance family, structured notes, or bottle volume values; those columns are left `NULL` for the seed rows.

## Security note

The current Admin password is checked only in browser code. To make its direct anon-key product writes work, `schema.sql` includes prototype-only anon insert/update/delete policies. Anyone with the public project URL and anon key can therefore modify the product catalog. Before using this publicly, replace those policies with Supabase Auth-based admin RLS or a server/Edge Function protected by a server-side secret. Never put a service-role key in a `VITE_*` variable or browser bundle.

The `orders` table is created with RLS enabled and no anon policies because it contains customer contact and delivery information. The current demo checkout is not changed by this step and does not submit customer data to Supabase.
