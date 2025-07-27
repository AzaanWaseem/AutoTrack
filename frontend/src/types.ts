export interface Job {
  id: string;
  company: string;
  position: string | null;
  first_applied: string | null;
  current_status: string | null;
  latest_update_at: string | null;
}

export interface JobUpdate {
  id: string;
  job_id: string;
  description: string | null;
  stage: string | null;
  received_at: string;
}

