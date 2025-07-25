import JobCard from './components/JobCard';
import { mockJobs } from './mocks/mockJobs';

function App() {
  return (
    <div className="app">
      <h1>AutoTrack Job Tracker</h1>
      <div className="job-list">
        {mockJobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>
    </div>
  );
}

export default App;
