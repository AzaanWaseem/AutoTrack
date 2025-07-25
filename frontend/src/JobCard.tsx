import { Job } from './types';

// passed in job, job must match the structure of Job
export default function JobCard({ job }: { job: Job }) {
  return (
    <div>
      <h2>{job.position} @ {job.company}</h2>
      <p>{job.application_date}</p>
      <p>{job.description}</p>
    </div>
  );
}
