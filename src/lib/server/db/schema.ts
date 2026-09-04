import { pgTable, text, timestamp, real, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';

export const candidate = pgTable('candidate', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	phone: text('phone'),
	role: text('role').notNull(),
	stage: text('stage').notNull().default('applied'),
	rating: real('rating').default(0),
	experience: text('experience'),
	salary: text('salary'),
	skills: jsonb('skills').$type<string[]>().default([]),
	addedBy: text('added_by').references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const candidateNote = pgTable('candidate_note', {
	id: text('id').primaryKey(),
	candidateId: text('candidate_id')
		.notNull()
		.references(() => candidate.id, { onDelete: 'cascade' }),
	authorId: text('author_id')
		.notNull()
		.references(() => user.id),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const candidateRelations = relations(candidate, ({ many, one }) => ({
	notes: many(candidateNote),
	recruiter: one(user, { fields: [candidate.addedBy], references: [user.id] })
}));

export const noteRelations = relations(candidateNote, ({ one }) => ({
	candidate: one(candidate, { fields: [candidateNote.candidateId], references: [candidate.id] }),
	author: one(user, { fields: [candidateNote.authorId], references: [user.id] })
}));

export * from './auth.schema';
