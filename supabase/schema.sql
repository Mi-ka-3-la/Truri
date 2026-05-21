-- Run this in Supabase Dashboard → SQL Editor

-- Course progress (which modules a user has completed)
create table if not exists course_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  module_id text not null,
  completed_at timestamptz default now(),
  unique(user_id, course_id, module_id)
);

-- Quiz results
create table if not exists quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  score integer not null,
  max_score integer not null,
  taken_at timestamptz default now()
);

-- Notes per course / module
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  module_id text,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security (users only see their own data)
alter table course_progress enable row level security;
alter table quiz_results enable row level security;
alter table notes enable row level security;

create policy "own progress" on course_progress for all using (auth.uid() = user_id);
create policy "own quiz results" on quiz_results for all using (auth.uid() = user_id);
create policy "own notes" on notes for all using (auth.uid() = user_id);
