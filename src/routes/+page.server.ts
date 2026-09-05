// import { fail, redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { candidate, candidateNote, user } from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
  const mockUserId = event.locals.user?.id || 'admin-123';

  // Ensure mock user exists to prevent Foreign Key errors
  const existingAdmin = await db.query.user.findFirst({ where: eq(user.id, mockUserId) });
  if (!existingAdmin) {
    await db.insert(user).values({
      id: mockUserId,
      name: 'ProVA Reviewer',
      email: 'admin@prova.com'
    });
  }

  const candidates = await db.query.candidate.findMany({
    orderBy: [desc(candidate.createdAt)],
    with: { notes: { orderBy: [desc(candidateNote.createdAt)] } }
  });

  return { user: event.locals.user, candidates };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const data = await request.formData();
    const skills = data.get('skills')?.toString().split(',').map((s) => s.trim()).filter(Boolean) || [];
    await db.insert(candidate).values({
      id: crypto.randomUUID(),
      name: data.get('name') as string,
      email: data.get('email') as string,
      phone: (data.get('phone') as string) || null,
      role: data.get('role') as string,
      stage: (data.get('stage') as string) || 'applied',
      rating: Number(data.get('rating')) || 0,
      experience: (data.get('experience') as string) || null,
      skills,
      addedBy: locals.user?.id
    });
  },
  seedDemo: async ({ locals }) => {
    const demoCandidates = [
      { id: crypto.randomUUID(), name: 'Elena Rostova', email: 'elena@example.com', role: 'Senior Frontend Engineer', stage: 'interview', rating: 4, experience: '6 yrs exp', skills: ['React', 'TypeScript', 'Svelte'], addedBy: locals.user?.id },
      { id: crypto.randomUUID(), name: 'Marcus Chen', email: 'm.chen@example.com', role: 'Staff Backend Architect', stage: 'offer', rating: 5, experience: '9 yrs exp', skills: ['Go', 'PostgreSQL', 'Docker'], addedBy: locals.user?.id },
      { id: crypto.randomUUID(), name: 'Amara Okafor', email: 'amara@example.com', role: 'Full Stack Engineer', stage: 'applied', rating: 4, experience: '4 yrs exp', skills: ['TypeScript', 'Node.js', 'PostgreSQL'], addedBy: locals.user?.id }
    ];
    await db.insert(candidate).values(demoCandidates);
  },
  updateRating: async ({ request }) => {
    const data = await request.formData();
    await db.update(candidate).set({ rating: Number(data.get('rating')) }).where(eq(candidate.id, data.get('id') as string));
  },
  updateStage: async ({ request }) => {
    const data = await request.formData();
    await db.update(candidate).set({ stage: data.get('stage') as string }).where(eq(candidate.id, data.get('id') as string));
  },
  addNote: async ({ request, locals }) => {
    const data = await request.formData();
    await db.insert(candidateNote).values({
      id: crypto.randomUUID(),
      candidateId: data.get('candidateId') as string,
      authorId: locals.user?.id as string,
      content: data.get('content') as string
    });
  },
  archive: async ({ request }) => {
    const data = await request.formData();
    await db.delete(candidate).where(eq(candidate.id, data.get('id') as string));
  }
};
