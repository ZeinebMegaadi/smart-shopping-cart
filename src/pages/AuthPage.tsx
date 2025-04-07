
import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { currentUser } = useAuth();
  
  // If already logged in, redirect to home
  if (currentUser) {
    return <Navigate to="/" />;
  }
  
  const toggleForm = () => {
    setIsLoginView(!isLoginView);
  };
  
  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4">
        {isLoginView ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <SignupForm onToggleForm={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
