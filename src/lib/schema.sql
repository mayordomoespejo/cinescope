create table user_lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  list_type text not null check (list_type in ('favorites', 'watchlist')),
  movies jsonb not null default '[]',
  updated_at timestamptz default now(),
  unique(user_id, list_type)
);

alter table user_lists enable row level security;

create policy "Users manage own lists" on user_lists
  for all using (auth.uid() = user_id);
