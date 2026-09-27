-- Prices were entered in Qatari Riyal. The business is in Kerala, India, so every
-- stored price becomes Indian Rupees (INR) and the site converts to other
-- currencies for display only.
--
-- Rate: 1 QAR = 26.3401 INR (27 Sep 2026). Results are rounded to clean amounts
-- (nearest 100 from 1000 up, nearest 10 from 100 up, otherwise whole rupees).
-- The old values are kept in public.price_conversion_backup; the script skips
-- itself if that table already exists, so it can never convert twice.

create or replace function public.inr_round(x numeric)
returns numeric language sql immutable as $$
  select case
    when x is null then null
    when x >= 1000 then round(x / 100) * 100
    when x >= 100 then round(x / 10) * 10
    else round(x)
  end;
$$;

-- Converts every numeric value of a JSON object (all of the price objects hold prices only).
create or replace function public.inr_convert_object(j jsonb, rate numeric)
returns jsonb language sql immutable as $$
  select case
    when j is null or jsonb_typeof(j) <> 'object' then j
    else coalesce(
      (select jsonb_object_agg(
         t.k,
         case when jsonb_typeof(t.v) = 'number' then to_jsonb(public.inr_round((t.v)::numeric * rate)) else t.v end
       ) from jsonb_each(j) as t(k, v)),
      '{}'::jsonb)
  end;
$$;

create or replace function public.inr_convert_array(a jsonb, rate numeric)
returns jsonb language sql immutable as $$
  select case
    when a is null or jsonb_typeof(a) <> 'array' then a
    else coalesce(
      (select jsonb_agg(case when jsonb_typeof(e) = 'object' then public.inr_convert_object(e, rate) else e end)
       from jsonb_array_elements(a) as e),
      '[]'::jsonb)
  end;
$$;

do $$
declare
  rate constant numeric := 26.3401;
begin
  if to_regclass('public.price_conversion_backup') is not null then
    raise notice 'Prices were already converted to INR; nothing to do.';
    return;
  end if;

  create table public.price_conversion_backup as
    select 'packages'::text as source_table, id::text as row_id,
           jsonb_build_object('price', price, 'pricing', pricing, 'offer_pricing', offer_pricing,
                              'departure_dates', departure_dates, 'optional_tours', optional_tours) as old_values
    from public.packages
    union all
    select 'bookings', id::text, jsonb_build_object('price', price) from public.bookings
    union all
    select 'visa_countries', id::text, jsonb_build_object('price', price) from public.visa_countries;

  alter table public.price_conversion_backup enable row level security;

  update public.packages set
    price = public.inr_round(price * rate),
    pricing = public.inr_convert_object(pricing, rate),
    offer_pricing = public.inr_convert_object(offer_pricing, rate),
    departure_dates = public.inr_convert_array(departure_dates, rate),
    optional_tours = public.inr_convert_array(optional_tours, rate);

  update public.bookings set price = public.inr_round(price * rate) where price is not null;

  -- Visa fees were free text such as "QAR 100"; keep the number and convert it.
  alter table public.visa_countries
    alter column price type numeric
    using (case
      when nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '') is null then null
      else public.inr_round(nullif(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric * rate)
    end);
end $$;

drop function public.inr_convert_array(jsonb, numeric);
drop function public.inr_convert_object(jsonb, numeric);
drop function public.inr_round(numeric);
