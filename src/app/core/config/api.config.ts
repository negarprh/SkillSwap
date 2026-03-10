export const DEFAULT_JOB_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Data Analysis',
  'Content Writing',
  'Marketing',
  'QA Testing',
  'General',
];

export const JOB_STATUSES = ['open', 'in_progress', 'completed'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

