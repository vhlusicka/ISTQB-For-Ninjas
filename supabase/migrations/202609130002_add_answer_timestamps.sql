-- Add answer audit timestamps to databases created with the original v0.1
-- migration. Existing rows receive the time at which this migration is run.

alter table public.answers
  add column if not exists date_added timestamptz not null default now(),
  add column if not exists date_edited timestamptz not null default now();

create or replace function public.touch_answer_date_edited()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.date_edited = now();
  return new;
end;
$$;

drop trigger if exists answers_touch_date_edited on public.answers;

create trigger answers_touch_date_edited
before update on public.answers
for each row execute function public.touch_answer_date_edited();
