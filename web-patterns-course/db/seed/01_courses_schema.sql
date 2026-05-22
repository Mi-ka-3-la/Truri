-- Run each statement separately in Neon SQL Editor
-- Step 1: courses

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  language text NOT NULL DEFAULT 'ro',
  description text,
  structure_type text NOT NULL DEFAULT 'cells',
  theme text DEFAULT 'light',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Step 2: course_branches

CREATE TABLE IF NOT EXISTS course_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  branch_index int NOT NULL,
  label text NOT NULL,
  color text,
  sort_order int NOT NULL DEFAULT 0
);

-- Step 3: concepts

CREATE TABLE IF NOT EXISTS concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  concept_key text NOT NULL,
  label text NOT NULL,
  subtitle text,
  branch_index int,
  sort_order int NOT NULL DEFAULT 0,
  pos_x int,
  pos_y int,
  explain jsonb,
  diagram text,
  usecases jsonb,
  pros jsonb,
  cons jsonb,
  is_break boolean DEFAULT false,
  concept_text text,
  anchor text,
  anchor_exp text,
  bad_example text,
  good_example text,
  retrieval jsonb,
  exercise text,
  cal jsonb,
  flow_steps jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, concept_key)
);

-- Step 4: concept_connections

CREATE TABLE IF NOT EXISTS concept_connections (
  from_concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  to_concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (from_concept_id, to_concept_id)
);
