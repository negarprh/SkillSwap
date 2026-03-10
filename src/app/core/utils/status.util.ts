import { JobStatus } from '../config/api.config';

export const jobStatusLabel = (status: JobStatus): string => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'open':
    default:
      return 'Open';
  }
};

