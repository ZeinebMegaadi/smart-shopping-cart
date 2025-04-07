
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, users } from "../services/mockData";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for saved user in localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const signup = async (email: string, name: string, password: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      toast({
        title: "Signup failed",
        description: "User with this email already exists",
        variant: "destructive",
      });
      return false;
    }

    // In a real app, we would create a new user in the database
    // Here we'll just pretend we did and return success
    toast({
      title: "Account created",
      description: "Your account has been created successfully!",
    });
    
    // Auto login the new user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      password,
      role: 'shopper' as const
    };
    
    setCurrentUser(newUser);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    
    return true;
  };

  const value = {
    currentUser,
    login,
    logout,
    signup,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
