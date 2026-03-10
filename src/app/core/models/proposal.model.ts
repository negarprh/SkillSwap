export interface Proposal {
  id: string;
  job_id: string;
  freelancer_id: string;
  price: number;
  cover_letter: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface CreateProposalPayload {
  price: number;
  cover_letter?: string;
  message?: string;
}

