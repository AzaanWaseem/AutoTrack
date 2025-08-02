import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Mail, Undo2 } from "lucide-react"; // Add Undo2 import
import type { Job } from "../types";
import { deleteJob } from "../api/jobs";
import { ConfirmDialog } from "./ConfirmDialog";

interface JobCardProps {
  job: Job;
  onDelete: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onDelete }) => {
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showUndoTimer, setShowUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false);
    setIsDeleted(true);
    
    // Set a timer for 5 seconds before actually deleting
    const timer = setTimeout(async () => {
      try {
        await deleteJob(job.id);
        onDelete(job.id);
      } catch (error) {
        console.error("Failed to delete job:", error);
        setIsDeleted(false);
      }
    }, 5000);
    
    setShowUndoTimer(timer);
  };

  const handleUndo = () => {
    if (showUndoTimer) {
      clearTimeout(showUndoTimer);
      setShowUndoTimer(null);
    }
    setIsDeleted(false);
  };

  const getEmailUrl = (emailId: string) => {
    // Handle both RFC822 and Gmail IDs
    if (emailId.includes("@")) {
        // It's an RFC822 message ID
        return `https://mail.google.com/mail/u/0/#search/rfc822msgid:${encodeURIComponent(emailId)}`;
    } else {
        // It's a Gmail ID
        return `https://mail.google.com/mail/u/0/#all/${emailId}`;
    }
};

  if (isDeleted) {
    return (
      <div className="bg-gray-100 shadow-md rounded-2xl p-4 mb-4 transition-all border border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Job application for {job.company} will be deleted...
          </p>
          <button
            onClick={handleUndo}
            className="flex items-center gap-2 px-4 py-2 text-primary hover:text-primary-hover transition-colors duration-200"
          >
            <Undo2 size={16} />
            Undo
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-2xl p-4 mb-4 transition-all border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-lg font-semibold text-gray-900">
              {job.company}
              <span className="text-sm text-gray-500 ml-2">
                • Applied: {formatDate(job.first_applied)}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                • Last Update: {formatDate(job.latest_update_at)}
              </span>
            </div>

            <div className="text-gray-700 text-md mt-1">
              {job.position || "No position title"}
            </div>

            <div className="text-sm mt-1 text-gray-500 italic">
              Status: {job.current_status || "Unknown"}
            </div>
          </div>

          <div className="flex gap-2">
            {job.email_id && (
              <a
                href={getEmailUrl(job.email_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                title="View original email"
              >
                <Mail size={20} />
              </a>
            )}
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              title="Delete job application"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <button
          className="mt-3 px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition"
          onClick={handleViewTimeline}
        >
          View Timeline
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Job Application"
        message="Are you sure you want to delete this job application? This action cannot be undone after 5 seconds."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
};
