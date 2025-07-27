import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import type { JobUpdate } from "../types";
import { JobUpdateCard } from "../components/JobUpdateCard";
import { ClockIcon } from "lucide-react";
import "./TimelinePage.css";

export default function TimelinePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const company = location.state?.company as string | undefined;

  const [updates, setUpdates] = useState<JobUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      if (!jobId) return;

      try {
        const res = await axios.get<JobUpdate[]>(
          `http://localhost:8000/job-updates/${jobId}`
        );
        setUpdates(res.data);
      } catch (err) {
        console.error("Failed to fetch job updates:", err);
        setUpdates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [jobId]);

  return (
    <div className="timeline-container">
      {company && (
        <h1 className="company-header">{company}</h1>
      )}

      <div className="timeline-heading">
        <ClockIcon className="w-6 h-6 text-blue-500" />
        <h2>Application Timeline</h2>
      </div>

      {loading ? (
        <div className="timeline-message">⏳ Loading timeline...</div>
      ) : updates.length === 0 ? (
        <div className="timeline-message">📭 No updates found for this application.</div>
      ) : (
        <ul className="timeline-list">
          {updates.map((update) => (
            <JobUpdateCard key={update.id} update={update} />
          ))}
        </ul>
      )}
    </div>
  );
}
