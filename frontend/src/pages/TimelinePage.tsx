import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import type { JobUpdate } from "../types";
import { JobUpdateCard } from "../components/JobUpdateCard";
import { ClockIcon, ArrowLeft } from "lucide-react";

export default function TimelinePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back button styled like the dashboard's sign out button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={handleBack}
          className="px-6 py-2 text-primary border-2 border-primary rounded-xl
                   hover:bg-primary hover:text-white transition-colors duration-200
                   flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header styled like dashboard */}
      <header className="text-center pt-16 pb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {company}
        </h1>
        <div className="flex items-center justify-center gap-2 text-gray-600 text-lg">
          <ClockIcon className="w-6 h-6 text-primary" />
          <span>Application Timeline</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-lg text-primary">
            ⏳ Loading timeline...
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center text-lg text-gray-500">
            📭 No updates found for this application.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ul className="space-y-6">
              {updates.map((update) => (
                <JobUpdateCard key={update.id} update={update} />
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
