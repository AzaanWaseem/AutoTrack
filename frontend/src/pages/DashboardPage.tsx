import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { JobCard } from "../components/JobCard";
import { fetchJobs } from "../api/jobs";
import type { Job } from "../types";

type DashboardPageProps = {
  accessToken: string | null;
  onLogout: () => void;
};

export default function DashboardPage({ accessToken, onLogout }: DashboardPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noUpdates, setNoUpdates] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searching, setSearching] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  const location = useLocation();
  const navigate = useNavigate();
  const startDate = location.state?.startDate;
  const endDate = location.state?.endDate;

  const handleStopSearch = async () => {
    if (abortController) {
        abortController.abort();
        setSearching(false);
        setRefreshing(false);
        setLoadingMessage("Loading existing applications...");

        // Add a small delay to ensure backend receives abort
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            setLoading(true);
            const jobsData = await fetchJobs();
            setJobs(jobsData);
            
            if (jobsData.length === 0) {
                setNoUpdates(true);
            }
        } catch (error) {
            console.error("Failed to fetch existing jobs:", error);
            setLoadingMessage("Error loading jobs");
        } finally {
            setLoading(false);
            setAbortController(null);
        }
    }
  };

  // Only run on initial mount or when dates are passed
  useEffect(() => {
    const loadInitialJobs = async () => {
      if (!initialLoad) return;

      setLoading(true);
      setNoUpdates(false);
      setSearching(true);
      setLoadingMessage("Connecting to Gmail...");

      // Create controller and set it in state FIRST
      const controller = new AbortController();
      setAbortController(controller);
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 10));

      try {
        if (startDate && endDate) {
          setLoadingMessage("Searching for job applications...");
          const response = await fetch("http://localhost:8000/extract-emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ startDate, endDate }),
            signal: controller.signal
          });

          if (controller.signal.aborted) {
            console.log('Search was stopped by user');
            return;
          }

          if (!response.ok) {
            throw new Error('Failed to extract emails');
          }
        }

        if (!controller.signal.aborted) {
          setLoadingMessage("Fetching your job applications...");
          const jobsData = await fetchJobs();
          setJobs(jobsData);

          if (jobsData.length === 0) {
            setNoUpdates(true);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Search was stopped by user');
        } else {
          console.error("Failed to load jobs:", error);
          setLoadingMessage("Error loading jobs");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setInitialLoad(false);
          setSearching(false);
          setAbortController(null);
          navigate(".", { replace: true });
        }
      }
    };

    loadInitialJobs();

    // Cleanup function
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [accessToken, startDate, endDate, initialLoad, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setNoUpdates(false);
    setSearching(true); 

    const controller = new AbortController(); 
    setAbortController(controller);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().slice(0, 10);

    try {
        await fetch("http://localhost:8000/extract-emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
            }),
            signal: controller.signal
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "name" in error &&
            typeof (error as { name?: unknown }).name === "string" &&
            (error as { name: string }).name === "AbortError"
        ) {
            console.log('Search was stopped by user');
        } else {
            setNoUpdates(true);
            console.error("Failed to refresh jobs:", error);
        }
    }

    // Always try to fetch existing jobs, even if search was aborted
    try {
        const prevCount = jobs.length;
        const newJobs = await fetchJobs();
        setJobs(newJobs);

        if (newJobs.length === prevCount) {
            setNoUpdates(true);
        }
    } catch (error) {
        console.error("Failed to fetch existing jobs:", error);
    } finally {
        setRefreshing(false);
        setSearching(false);
        setAbortController(null);
    }
  };

  const handleJobDelete = (deletedJobId: string) => {
    setJobs(jobs.filter(job => job.id !== deletedJobId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute top-6 right-6">
        <button
          onClick={onLogout}
          className="px-6 py-2 text-primary border-2 border-primary rounded-xl
                   hover:bg-primary hover:text-white transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>

      <header className="text-center pt-16 pb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🎯 AutoTrack Dashboard
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Keep track of all your job applications in one place.
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium
                   hover:bg-primary-hover transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading || refreshing ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <p className="text-lg text-primary">
                {refreshing
                  ? "Checking for new job application updates..."
                  : loadingMessage}
              </p>
            </div>
            {searching && (
              <button
                onClick={handleStopSearch}
                className="px-6 py-2 bg-red-500 text-white rounded-xl font-medium
                         hover:bg-red-600 transition-colors duration-200"
              >
                Stop Search
              </button>
            )}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onDelete={handleJobDelete}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">
            No job applications found.
          </p>
        )}
        {noUpdates && (
          <p className="text-center text-gray-500 mt-4">
            No new job application updates found.
          </p>
        )}
      </main>
    </div>
  );
}
