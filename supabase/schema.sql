-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  notifications_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create residents table
create table residents (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  coordinate jsonb not null, -- Stores [longitude, latitude]
  address text,
  resident_name text default 'New Neighbor',
  current_bless_status text default 'Prayer',
  prayer_requests text,
  last_interaction timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create interactions table
create table interactions (
  id uuid default gen_random_uuid() primary key,
  resident_id uuid references residents(id) on delete cascade not null,
  type text not null,
  content text,
  status text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;
alter table residents enable row level security;
alter table interactions enable row level security;

-- Create Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own residents" on residents for select using (auth.uid() = profile_id);
create policy "Users can insert own residents" on residents for insert with check (auth.uid() = profile_id);
create policy "Users can update own residents" on residents for update using (auth.uid() = profile_id);
create policy "Users can delete own residents" on residents for delete using (auth.uid() = profile_id);

-- Interactions policies depend on owning the resident
create policy "Users can view own interactions" on interactions for select using (
  exists (select 1 from residents where residents.id = interactions.resident_id and residents.profile_id = auth.uid())
);
create policy "Users can insert own interactions" on interactions for insert with check (
  exists (select 1 from residents where residents.id = interactions.resident_id and residents.profile_id = auth.uid())
);
create policy "Users can delete own interactions" on interactions for delete using (
  exists (select 1 from residents where residents.id = interactions.resident_id and residents.profile_id = auth.uid())
);

-- Auto-create profile on signup trigger
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
