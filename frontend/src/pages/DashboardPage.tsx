// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { JobCard } from "../components/JobCard";
import { fetchJobs } from "../api/jobs";
import type { Job } from "../types";

export default function DashboardPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchJobs()
      .then((data) => setJobs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🎯 AutoTrack Job Tracker</h1>
        <p className="subtitle">
          Keep track of all your job applications in one place.
        </p>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </header>

      <main className="job-list">
        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <p>No job applications found.</p>
        )}
      </main>
    </div>
  );
}
