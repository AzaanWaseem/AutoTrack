// src/pages/LoginPage.tsx
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; 

type LoginPageProps = {
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
};

const LoginPage: React.FC<LoginPageProps> = ({ setAccessToken }) => {
  return (
    <div className="login-page">
      <h1>Welcome to AutoTrack</h1>
      <p>Please sign in with Google to continue</p>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            const decoded = jwtDecode<{ email: string }>(
              credentialResponse.credential
            );
            console.log("Logged in as:", decoded.email);
            setAccessToken(credentialResponse.credential);
          }
        }}
        onError={() => {
          console.error("Login failed");
        }}
      />
    </div>
  );
};

export default LoginPage;
