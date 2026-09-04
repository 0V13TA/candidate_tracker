import { fail, redirect } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { candidate, candidateNote } from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) return redirect(302, '/auth');

  const candidates = await db.query.candidate.findMany({
    orderBy: [desc(candidate.createdAt)],
    with: { notes: { orderBy: [desc(candidateNote.createdAt)] } }
  });

  return { user: event.locals.user, candidates };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const data = await request.formData();
    const skills =
      data
        .get('skills')
        ?.toString()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) || [];

    await db.insert(candidate).values({
      id: crypto.randomUUID(),
      name: data.get('name') as string,
      email: data.get('email') as string,
      phone: (data.get('phone') as string) || null,
      role: data.get('role') as string,
      // Provide fallback values to prevent not-null constraint errors
      stage: (data.get('stage') as string) || 'applied',
      rating: Number(data.get('rating')) || 0,
      experience: (data.get('experience') as string) || null,
      skills,
      addedBy: locals.user?.id
    });
  },

  // Add this action alongside your existing actions in +page.server.ts
  seedDemo: async ({ locals }) => {
    // Generate an array of 5-10 mock candidates using the schema
    const demoCandidates = [
      {
        id: crypto.randomUUID(),
        name: 'Elena Rostova',
        email: 'elena@example.com',
        role: 'Senior Frontend Engineer',
        stage: 'interview',
        rating: 4,
        experience: '6 yrs exp',
        skills: ['React', 'TypeScript', 'Svelte'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Marcus Chen',
        email: 'm.chen@example.com',
        role: 'Staff Backend Architect',
        stage: 'offer',
        rating: 5,
        experience: '9 yrs exp',
        skills: ['Go', 'PostgreSQL', 'Docker'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Amara Okafor',
        email: 'amara@example.com',
        role: 'Full Stack Engineer',
        stage: 'screening',
        rating: 4,
        experience: '4 yrs exp',
        skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Daniel Brooks',
        email: 'daniel@example.com',
        role: 'Senior Backend Engineer',
        stage: 'hired',
        rating: 5,
        experience: '7 yrs exp',
        skills: ['Python', 'Django', 'Redis'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Sofia Martinez',
        email: 'sofia@example.com',
        role: 'Product Designer',
        stage: 'interview',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['Figma', 'UI Design', 'UX Research'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Liam Anderson',
        email: 'liam@example.com',
        role: 'DevOps Engineer',
        stage: 'applied',
        rating: 3,
        experience: '3 yrs exp',
        skills: ['AWS', 'Kubernetes', 'Terraform'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Chioma Eze',
        email: 'chioma@example.com',
        role: 'Frontend Engineer',
        stage: 'screening',
        rating: 4,
        experience: '3 yrs exp',
        skills: ['Svelte', 'TypeScript', 'CSS'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Noah Williams',
        email: 'noah@example.com',
        role: 'Software Engineer',
        stage: 'applied',
        rating: 3,
        experience: '2 yrs exp',
        skills: ['JavaScript', 'Node.js', 'MongoDB'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Isabella Rossi',
        email: 'isabella@example.com',
        role: 'Senior UX Designer',
        stage: 'offer',
        rating: 5,
        experience: '8 yrs exp',
        skills: ['Figma', 'Prototyping', 'Design Systems'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Ethan Carter',
        email: 'ethan@example.com',
        role: 'Cloud Engineer',
        stage: 'interview',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['AWS', 'Azure', 'Docker'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Aisha Bello',
        email: 'aisha@example.com',
        role: 'Backend Engineer',
        stage: 'screening',
        rating: 4,
        experience: '4 yrs exp',
        skills: ['Go', 'PostgreSQL', 'gRPC'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'James Mitchell',
        email: 'james@example.com',
        role: 'Engineering Manager',
        stage: 'hired',
        rating: 5,
        experience: '11 yrs exp',
        skills: ['Leadership', 'Python', 'AWS'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Maya Patel',
        email: 'maya@example.com',
        role: 'Data Engineer',
        stage: 'applied',
        rating: 3,
        experience: '3 yrs exp',
        skills: ['Python', 'SQL', 'Spark'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Lucas Silva',
        email: 'lucas@example.com',
        role: 'Mobile Engineer',
        stage: 'interview',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['Swift', 'iOS', 'UIKit'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Grace Thompson',
        email: 'grace@example.com',
        role: 'QA Engineer',
        stage: 'screening',
        rating: 4,
        experience: '4 yrs exp',
        skills: ['Playwright', 'Cypress', 'TypeScript'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Yusuf Ibrahim',
        email: 'yusuf@example.com',
        role: 'Security Engineer',
        stage: 'interview',
        rating: 5,
        experience: '6 yrs exp',
        skills: ['Cybersecurity', 'Linux', 'Python'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Charlotte Evans',
        email: 'charlotte@example.com',
        role: 'Product Manager',
        stage: 'offer',
        rating: 5,
        experience: '7 yrs exp',
        skills: ['Product Strategy', 'Agile', 'Analytics'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Michael Foster',
        email: 'michael@example.com',
        role: 'Frontend Engineer',
        stage: 'applied',
        rating: 3,
        experience: '2 yrs exp',
        skills: ['React', 'JavaScript', 'Tailwind'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Zainab Mohammed',
        email: 'zainab@example.com',
        role: 'Data Scientist',
        stage: 'screening',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['Python', 'Pandas', 'Machine Learning'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Benjamin Wright',
        email: 'benjamin@example.com',
        role: 'Backend Architect',
        stage: 'hired',
        rating: 5,
        experience: '12 yrs exp',
        skills: ['Go', 'Kubernetes', 'PostgreSQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Nora Jensen',
        email: 'nora@example.com',
        role: 'Technical Writer',
        stage: 'applied',
        rating: 3,
        experience: '4 yrs exp',
        skills: ['Technical Writing', 'API Docs', 'Markdown'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Samuel Adeyemi',
        email: 'samuel@example.com',
        role: 'Full Stack Developer',
        stage: 'interview',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['TypeScript', 'Svelte', 'Node.js'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Olivia Parker',
        email: 'olivia@example.com',
        role: 'UX Researcher',
        stage: 'screening',
        rating: 4,
        experience: '6 yrs exp',
        skills: ['UX Research', 'User Testing', 'Analytics'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Henry Cooper',
        email: 'henry@example.com',
        role: 'Infrastructure Engineer',
        stage: 'applied',
        rating: 3,
        experience: '3 yrs exp',
        skills: ['Linux', 'Terraform', 'AWS'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Fatima Abdullahi',
        email: 'fatima@example.com',
        role: 'Frontend Developer',
        stage: 'hired',
        rating: 5,
        experience: '5 yrs exp',
        skills: ['Vue', 'TypeScript', 'CSS'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Alexander King',
        email: 'alexander@example.com',
        role: 'Senior Software Engineer',
        stage: 'offer',
        rating: 5,
        experience: '8 yrs exp',
        skills: ['C++', 'Linux', 'Systems Programming'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Mia Robinson',
        email: 'mia@example.com',
        role: 'Marketing Manager',
        stage: 'screening',
        rating: 4,
        experience: '6 yrs exp',
        skills: ['SEO', 'Content Strategy', 'Analytics'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'David Kim',
        email: 'david@example.com',
        role: 'Machine Learning Engineer',
        stage: 'interview',
        rating: 5,
        experience: '6 yrs exp',
        skills: ['Python', 'PyTorch', 'TensorFlow'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Emily Turner',
        email: 'emily@example.com',
        role: 'Product Designer',
        stage: 'applied',
        rating: 3,
        experience: '2 yrs exp',
        skills: ['Figma', 'Illustration', 'Prototyping'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Tunde Adebayo',
        email: 'tunde@example.com',
        role: 'DevOps Engineer',
        stage: 'screening',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['Docker', 'Kubernetes', 'GitLab CI'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Sophia Bennett',
        email: 'sophia@example.com',
        role: 'Backend Developer',
        stage: 'applied',
        rating: 3,
        experience: '3 yrs exp',
        skills: ['Python', 'FastAPI', 'PostgreSQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Jacob Wilson',
        email: 'jacob@example.com',
        role: 'Software Architect',
        stage: 'offer',
        rating: 5,
        experience: '10 yrs exp',
        skills: ['C#', '.NET', 'Azure'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Ada Nwosu',
        email: 'ada@example.com',
        role: 'Frontend Engineer',
        stage: 'interview',
        rating: 4,
        experience: '4 yrs exp',
        skills: ['Svelte', 'JavaScript', 'WebGL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'William Hayes',
        email: 'william@example.com',
        role: 'Database Engineer',
        stage: 'hired',
        rating: 5,
        experience: '9 yrs exp',
        skills: ['PostgreSQL', 'Redis', 'Database Design'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Hannah Scott',
        email: 'hannah@example.com',
        role: 'Content Designer',
        stage: 'screening',
        rating: 4,
        experience: '4 yrs exp',
        skills: ['UX Writing', 'Content Strategy', 'Figma'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Chinedu Okoro',
        email: 'chinedu@example.com',
        role: 'Cloud Architect',
        stage: 'interview',
        rating: 5,
        experience: '8 yrs exp',
        skills: ['AWS', 'Terraform', 'Kubernetes'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Amelia Clark',
        email: 'amelia@example.com',
        role: 'QA Automation Engineer',
        stage: 'applied',
        rating: 3,
        experience: '3 yrs exp',
        skills: ['Playwright', 'Python', 'Selenium'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'George Morgan',
        email: 'george@example.com',
        role: 'Senior Full Stack Engineer',
        stage: 'offer',
        rating: 5,
        experience: '9 yrs exp',
        skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Maryam Sule',
        email: 'maryam@example.com',
        role: 'Business Analyst',
        stage: 'screening',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['SQL', 'Excel', 'Data Analysis'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Thomas Reed',
        email: 'thomas@example.com',
        role: 'Systems Engineer',
        stage: 'applied',
        rating: 3,
        experience: '4 yrs exp',
        skills: ['C', 'Linux', 'Networking'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Khadija Yusuf',
        email: 'khadija@example.com',
        role: 'Software Engineer',
        stage: 'interview',
        rating: 4,
        experience: '4 yrs exp',
        skills: ['Go', 'Docker', 'PostgreSQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Daniela Flores',
        email: 'daniela@example.com',
        role: 'UI Engineer',
        stage: 'screening',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['TypeScript', 'CSS', 'Web Components'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Robert Adams',
        email: 'robert@example.com',
        role: 'Security Architect',
        stage: 'offer',
        rating: 5,
        experience: '11 yrs exp',
        skills: ['Cybersecurity', 'Cloud Security', 'Linux'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Ifeoma Nnamdi',
        email: 'ifeoma@example.com',
        role: 'Product Manager',
        stage: 'hired',
        rating: 5,
        experience: '7 yrs exp',
        skills: ['Product Management', 'Agile', 'SQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Christopher Lee',
        email: 'christopher@example.com',
        role: 'Mobile Engineer',
        stage: 'applied',
        rating: 3,
        experience: '3 yrs exp',
        skills: ['Kotlin', 'Android', 'Firebase'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Sarah Mitchell',
        email: 'sarah@example.com',
        role: 'Senior Data Engineer',
        stage: 'interview',
        rating: 4,
        experience: '7 yrs exp',
        skills: ['Python', 'Airflow', 'PostgreSQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Ibrahim Musa',
        email: 'ibrahim@example.com',
        role: 'Backend Engineer',
        stage: 'screening',
        rating: 4,
        experience: '4 yrs exp',
        skills: ['Node.js', 'Express', 'PostgreSQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Victoria Adams',
        email: 'victoria@example.com',
        role: 'Engineering Lead',
        stage: 'hired',
        rating: 5,
        experience: '10 yrs exp',
        skills: ['Go', 'System Design', 'Leadership'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Nathan Brooks',
        email: 'nathan@example.com',
        role: 'Frontend Engineer',
        stage: 'applied',
        rating: 3,
        experience: '2 yrs exp',
        skills: ['JavaScript', 'React', 'CSS'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Blessing Uche',
        email: 'blessing@example.com',
        role: 'Full Stack Engineer',
        stage: 'interview',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['TypeScript', 'SvelteKit', 'PostgreSQL'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Andrew Collins',
        email: 'andrew@example.com',
        role: 'Platform Engineer',
        stage: 'offer',
        rating: 5,
        experience: '8 yrs exp',
        skills: ['Go', 'Kubernetes', 'Linux'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Rebecca Young',
        email: 'rebecca@example.com',
        role: 'UX Designer',
        stage: 'screening',
        rating: 4,
        experience: '5 yrs exp',
        skills: ['Figma', 'UX Research', 'Design Systems'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Kelvin Obi',
        email: 'kelvin@example.com',
        role: 'Software Engineer',
        stage: 'applied',
        rating: 3,
        experience: '3 yrs exp',
        skills: ['C++', 'Linux', 'Git'],
        addedBy: locals.user?.id
      },
      {
        id: crypto.randomUUID(),
        name: 'Jessica Moore',
        email: 'jessica@example.com',
        role: 'Technical Program Manager',
        stage: 'hired',
        rating: 5,
        experience: '9 yrs exp',
        skills: ['Program Management', 'Agile', 'Leadership'],
        addedBy: locals.user?.id
      }
    ];
    await db.insert(candidate).values(demoCandidates);
  },

  updateRating: async ({ request }) => {
    const data = await request.formData();
    await db
      .update(candidate)
      .set({ rating: Number(data.get('rating')) })
      .where(eq(candidate.id, data.get('id') as string));
  },

  updateStage: async ({ request }) => {
    const data = await request.formData();
    await db
      .update(candidate)
      .set({ stage: data.get('stage') as string })
      .where(eq(candidate.id, data.get('id') as string));
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
