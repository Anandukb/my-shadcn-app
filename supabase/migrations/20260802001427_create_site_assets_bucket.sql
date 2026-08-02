insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true);

create policy "site-assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'site-assets');
