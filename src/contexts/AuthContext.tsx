
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
    // Set up initial session and auth state listener
    const fetchSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setCurrentUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await checkUserRole(currentSession.user.id);
      }
      
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      // First check if the user is an owner
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

      // If not an owner, check if they're a shopper
      const { data: shopperData, error: shopperError } = await supabase
        .from('shoppers')
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

      // If not found in either table, default to shopper
      console.log("User not found in either table, defaulting to shopper role");
      setUserRole('shopper');
      
      // Automatically insert the user into the shoppers table
      const { error: insertError } = await supabase
        .from('shoppers')
        .insert([{ id: userId, email: currentUser?.email || '' }]);
      
      if (insertError) {
        console.error("Error adding user to shoppers table:", insertError);
      }
      
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      // Default to shopper role on error
      setUserRole('shopper');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user?.email}!`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
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
      // Clear local state first
      setUserRole(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Force clear any user/session data (redundant but ensures UI updates)
      setCurrentUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      // Force browser reload to clear any lingering state
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred while logging out",
        variant: "destructive"
      });
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
