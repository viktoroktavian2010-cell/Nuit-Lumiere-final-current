-- The catalog and Supabase seed classify Tom Ford Fabulous in the men's collection.
-- Correct the legacy default-women value without changing any other product.
UPDATE `products`
SET `gender` = 'men'
WHERE `slug` = 'fabulous'
  AND `gender` <> 'men';
