import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  integer,
  boolean,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ── Auth ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const progress = pgTable(
  'progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    conceptId: text('concept_id').notNull(),
    completedAt: timestamp('completed_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('progress_user_concept_idx').on(t.userId, t.conceptId)],
);

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  conceptId: text('concept_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const flashcards = pgTable('flashcards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  conceptId: text('concept_id').notNull(),
  front: text('front').notNull(),
  back: text('back').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Courses ──────────────────────────────────────────────────────────────────

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  language: text('language').notNull().default('ro'),
  description: text('description'),
  // 'cells' = simple mind-map cards | 'chunks' = branches+chunks | 'modules' = long-form HTML
  structureType: text('structure_type').notNull().default('cells'),
  theme: text('theme').default('light'), // 'light' | 'dark'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Named branch groups within a course (e.g. "Fundamente", "Parole & Stocare")
export const courseBranches = pgTable('course_branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  branchIndex: integer('branch_index').notNull(),
  label: text('label').notNull(),
  color: text('color'),
  sortOrder: integer('sort_order').notNull().default(0),
});

// Unified concept/chunk row — fields used depend on structureType
export const concepts = pgTable(
  'concepts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    conceptKey: text('concept_key').notNull(),
    label: text('label').notNull(),
    subtitle: text('subtitle'),
    branchIndex: integer('branch_index'),
    sortOrder: integer('sort_order').notNull().default(0),
    // Mind-map position (cells)
    posX: integer('pos_x'),
    posY: integer('pos_y'),
    // cells fields
    explain: jsonb('explain').$type<string[]>(),
    diagram: text('diagram'),
    usecases: jsonb('usecases').$type<string[]>(),
    pros: jsonb('pros').$type<string[]>(),
    cons: jsonb('cons').$type<string[]>(),
    // chunks extra fields
    isBreak: boolean('is_break').default(false),
    conceptText: text('concept_text'),
    anchor: text('anchor'),
    anchorExp: text('anchor_exp'),
    badExample: text('bad_example'),
    goodExample: text('good_example'),
    retrieval: jsonb('retrieval').$type<{ q: string; a: string }[]>(),
    exercise: text('exercise'),
    cal: jsonb('cal'),
    flowSteps: jsonb('flow_steps'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('concepts_course_key_idx').on(t.courseId, t.conceptKey)],
);

export const conceptConnections = pgTable(
  'concept_connections',
  {
    fromConceptId: uuid('from_concept_id')
      .notNull()
      .references(() => concepts.id, { onDelete: 'cascade' }),
    toConceptId: uuid('to_concept_id')
      .notNull()
      .references(() => concepts.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.fromConceptId, t.toConceptId] })],
);

// ── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CourseBranch = typeof courseBranches.$inferSelect;
export type Concept = typeof concepts.$inferSelect;
export type ConceptConnection = typeof conceptConnections.$inferSelect;
