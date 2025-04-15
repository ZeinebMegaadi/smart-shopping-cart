
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
  const [roleCheckInProgress, setRoleCheckInProgress] = useState(false);
  const { toast } = useToast();

  // Check user role function that's debounced and prevents multiple simultaneous calls
  const checkUserRole = async (userId: string) => {
    // Prevent multiple simultaneous role checks
    if (roleCheckInProgress) return;
    
    try {
      setRoleCheckInProgress(true);
      
      // First check if the user exists in the owners table
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("No authenticated user found");
      }
      
      // Check if user is in owners table
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('id')
        .eq('id', userId)
        .single();

      if (ownerError && ownerError.code !== 'PGRST116') {
        console.error("Error checking owner status:", ownerError);
      }

      if (ownerData) {
        console.log("User is an owner");
        setUserRole('owner');
        return;
      }

      // Check if user is in Shoppers table
      const { data: shopperData, error: shopperError } = await supabase
        .from('Shoppers')
        .select('id')
        .eq('id', userId)
        .single();

      if (shopperError && shopperError.code !== 'PGRST116') {
        console.error("Error checking shopper status:", shopperError);
      }

      if (shopperData) {
        console.log("User is a shopper");
        setUserRole('shopper');
        return;
      }

      // If user is not in any role table, add them as a shopper by default
      console.log("User not found in either table, defaulting to shopper role");
      setUserRole('shopper');
      
      const { error: insertError } = await supabase
        .from('Shoppers')
        .insert([{ id: userId, email: userData.user.email || '', rfid_tag: '' }]);
      
      if (insertError) {
        console.error("Error adding user to shoppers table:", insertError);
      }
      
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      setUserRole('shopper');
    } finally {
      setRoleCheckInProgress(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Set up auth state change listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, authSession) => {
            console.log("Auth state change event:", event);
            
            if (isActive) {
              setSession(authSession);
              
              if (authSession?.user) {
                setCurrentUser(authSession.user);
                // Use setTimeout to prevent rapid state updates
                setTimeout(() => {
                  if (isActive) {
                    checkUserRole(authSession.user.id);
                  }
                }, 0);
              } else {
                setCurrentUser(null);
                setUserRole(null);
                setIsLoading(false);
              }
            }
          }
        );
        
        // Then check current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (isActive) {
          setSession(currentSession);
          
          if (currentSession?.user) {
            setCurrentUser(currentSession.user);
            await checkUserRole(currentSession.user.id);
          } else {
            setCurrentUser(null);
            setUserRole(null);
            setIsLoading(false);
          }
        }
        
        return () => {
          isActive = false;
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isActive) {
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      isActive = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please provide both email and password",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
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
      setIsLoading(false);
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
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Logging out user");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      setUserRole(null);
      setCurrentUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      console.error("Logout failed:", error);
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
