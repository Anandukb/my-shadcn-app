alter table public.packages
  add column duration_en text,
  add column duration_ar text,
  add column group_size_en text,
  add column group_size_ar text,
  add column meals_en text,
  add column meals_ar text,
  add column accommodation_en text,
  add column accommodation_ar text;

update public.packages set
  duration_en = duration,
  group_size_en = group_size,
  meals_en = meals,
  accommodation_en = accommodation;

alter table public.packages
  alter column duration_en set not null;

alter table public.packages
  drop column duration,
  drop column group_size,
  drop column meals,
  drop column accommodation;
