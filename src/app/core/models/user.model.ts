export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  bio: string;
  skills: string[];
  rating_avg: number;
  completed_jobs?: number;
}

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  rating_avg: number;
}

