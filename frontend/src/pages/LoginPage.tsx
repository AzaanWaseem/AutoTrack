import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

type LoginPageProps = {
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
};

const LoginPage: React.FC<LoginPageProps> = ({ setAccessToken }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    flow: "implicit",
    onSuccess: (tokenResponse) => {
      setLoading(true);
      setAccessToken(tokenResponse.access_token);
      setLoading(false);
      navigate("/select-dates");
    },
    onError: () => {
      setLoading(false);
      setError("Login failed. Please try again.");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-12 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <h1 className="text-4xl font-bold text-primary mb-3 text-center">
          AutoTrack
        </h1>
        <p className="text-gray-600 text-lg mb-8 text-center">
          Track your job applications effortlessly.
        </p>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <button
          onClick={() => login()}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded-xl
                   font-semibold transition-colors duration-200 disabled:opacity-50
                   disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "Logging in..." : "Login with Google"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
