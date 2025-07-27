import React from "react";
import { useNavigate } from "react-router-dom";
import type { Job } from "../types";

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewTimeline = () => {
    navigate(`/timeline/${job.id}`, { state: { company: job.company } });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-4 mb-4 transition-all border border-gray-200 dark:border-gray-700">
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        {job.company}
        <span className="text-sm text-gray-500 ml-2">
          • Applied: {formatDate(job.first_applied)}
        </span>
        <span className="text-sm text-gray-500 ml-2">
          • Last Update: {formatDate(job.latest_update_at)}
        </span>
      </div>

      <div className="text-gray-700 dark:text-gray-300 text-md mt-1">
        {job.position || "No position title"}
      </div>

      <div className="text-sm mt-1 text-gray-500 dark:text-gray-400 italic">
        Status: {job.current_status || "Unknown"}
      </div>

      <button
        className="mt-3 px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition"
        onClick={handleViewTimeline}
      >
        View Timeline
      </button>
    </div>
  );
};
