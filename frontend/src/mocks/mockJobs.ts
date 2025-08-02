import type { Job } from '../types';

export const mockJobs: Job[] = [
  {
    id: '1',
    company: 'OpenAI',
    position: 'Software Engineer',
    first_applied: '2025-07-20',
    current_status: 'Application Received',
    latest_update_at: '2025-07-20T14:30:00Z'
  },
  {
    id: '2',
    company: 'Google',
    position: 'SWE Intern',
    first_applied: '2025-07-10',
    current_status: 'Technical Interview',
    latest_update_at: '2025-07-15T09:00:00Z'
  },
  {
    id: '3',
    company: 'Meta',
    position: 'Frontend Engineer Intern',
    first_applied: '2025-07-12',
    current_status: 'Assessment',
    latest_update_at: '2025-07-14T16:45:00Z'
  },
  {
    id: '4',
    company: 'Amazon',
    position: 'Software Development Engineer',
    first_applied: '2025-07-18',
    current_status: 'Screen',
    latest_update_at: '2025-07-19T11:20:00Z'
  },
  {
    id: '5',
    company: 'Microsoft',
    position: 'Software Engineering Intern',
    first_applied: '2025-07-05',
    current_status: 'Offer',
    latest_update_at: '2025-07-25T13:15:00Z'
  }
];
