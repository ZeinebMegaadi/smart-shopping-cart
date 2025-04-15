
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  userRole: 'owner' | 'shopper' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'shopper' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Clear any existing session from localStorage to prevent caching issues
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setCurrentUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await checkUserRole(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          await checkUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      }
    );

    fetchSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('id')
        .eq('id', userId)
        .single();

      if (ownerError && ownerError.code !== 'PGRST116') {
        console.error("Error checking owner status:", ownerError);
      }

      if (ownerData) {
        setUserRole('owner');
        return;
      }

      const { data: shopperData, error: shopperError } = await supabase
        .from('Shoppers')  // Using correct capitalization from types
        .select('id')
        .eq('id', userId)
        .single();

      if (shopperError && shopperError.code !== 'PGRST116') {
        console.error("Error checking shopper status:", shopperError);
      }

      if (shopperData) {
        setUserRole('shopper');
        return;
      }

      console.log("User not found in either table, defaulting to shopper role");
      setUserRole('shopper');
      
      const { error: insertError } = await supabase
        .from('Shoppers')  // Using correct capitalization from types
        .insert([{ id: userId, email: currentUser?.email || '', rfid_tag: '' }]);
      
      if (insertError) {
        console.error("Error adding user to shoppers table:", insertError);
      }
      
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      setUserRole('shopper');
    }
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please provide both email and password",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user?.email}!`,
        });
        return true;
      } else {
        // This shouldn't happen normally, but just in case
        throw new Error("No user data received");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials or connection issue",
        variant: "destructive"
      });
      return false;
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Sign up successful",
        description: "Your account has been created. Please confirm your email.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Logging out user");
      
      setUserRole(null);
      setCurrentUser(null);
      setSession(null);
      
      localStorage.removeItem('supabase.auth.token');
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      window.location.href = "/auth";
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred while logging out",
        variant: "destructive"
      });
      
      try {
        await supabase.auth.setSession({ access_token: '', refresh_token: '' });
        window.location.href = "/auth";
      } catch (fallbackError) {
        console.error("Fallback logout failed:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    session,
    login,
    logout,
    signup,
    isLoading,
    userRole
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
