import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type SelectDatesPageProps = object;

const SelectDatesPage: React.FC<SelectDatesPageProps> = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const handleLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    setError(null);
  };

  const handleLast60Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 60);

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    setError(null);
  };

  const validateDates = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return false;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateDates()) return;

    setLoading(true);
    navigate("/dashboard", {
      state: { startDate, endDate },
    });
  };

  const isSubmitDisabled = loading || !startDate || !endDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Select Date Range
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Choose the range to extract your job-related emails.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={handleLast30Days}
            disabled={loading}
            className="px-6 py-2.5 text-primary border-2 border-primary rounded-xl
                     hover:bg-primary hover:text-white transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={handleLast60Days}
            disabled={loading}
            className="px-6 py-2.5 text-primary border-2 border-primary rounded-xl
                     hover:bg-primary hover:text-white transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Last 60 Days
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError(null);
                }}
                max={formatDate(new Date())}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full bg-primary text-white py-3 px-4 rounded-xl font-medium
                     hover:bg-primary-hover transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Extract Emails"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectDatesPage;