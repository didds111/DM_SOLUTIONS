-- DM SOLUTION product CMS migration
-- Run once in Supabase SQL Editor before saving products from admin.html.
-- Existing rows are preserved; new column is nullable for compatibility.
alter table public.products
  add column if not exists subcategory text;

-- Existing filter records can be categorized more precisely in the admin form.
