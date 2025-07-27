import React from "react";
import type { JobUpdate } from "../types";

interface JobUpdateCardProps {
  update: JobUpdate;
}

export const JobUpdateCard: React.FC<JobUpdateCardProps> = ({ update }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <li className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-5 shadow-md">
      <div className="mb-3">
        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Status
        </span>
        <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
          {update.stage || "No stage provided"}
        </span>
      </div>

      {update.description && (
        <div className="mb-3">
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Description
          </span>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            {update.description}
          </p>
        </div>
      )}

      <div>
        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Date
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatDate(update.received_at)}
        </span>
      </div>
    </li>
  );
};
