import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const authCheckComplete = useRef(false);
  const { toast } = useToast();

  const checkUserRole = async (userId: string) => {
    if (roleCheckInProgress) return;
    
    try {
      setRoleCheckInProgress(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("No authenticated user found");
      }
      
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .select('id')
        .eq('email', userData.user.email)
        .single();

      if (ownerError && ownerError.code !== 'PGRST116') {
        console.error("Error checking owner status:", ownerError);
      }

      if (ownerData) {
        console.log("User is an owner");
        setUserRole('owner');
        return;
      }

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
      authCheckComplete.current = true;
    }
  };

  useEffect(() => {
    let isActive = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, authSession) => {
            console.log("Auth state change event:", event);
            
            if (!isActive) return;
            
            setSession(authSession);
            
            if (authSession?.user) {
              setCurrentUser(authSession.user);
              if (!authCheckComplete.current) {
                setTimeout(() => {
                  if (isActive) {
                    checkUserRole(authSession.user.id);
                  }
                }, 50);
              }
            } else {
              setCurrentUser(null);
              setUserRole(null);
              setIsLoading(false);
              authCheckComplete.current = true;
            }
          }
        );
        
        authSubscription = subscription;
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isActive) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          setCurrentUser(currentSession.user);
          await checkUserRole(currentSession.user.id);
        } else {
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
          authCheckComplete.current = true;
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isActive) {
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
          authCheckComplete.current = true;
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      isActive = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
    authCheckComplete.current = false;
    
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
    authCheckComplete.current = false;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        try {
          const { data: ownerData, error: ownerError } = await supabase
            .from('owners')
            .select('id')
            .eq('email', data.user.email)
            .maybeSingle();
            
          if (ownerError) {
            console.error("Error checking if email exists in owners table:", ownerError);
          }
          
          if (ownerData) {
            console.log("User email found in owners table, setting role to owner");
            setUserRole('owner');
          } else {
            const { data: existingUser, error: fetchError } = await supabase
              .from('Shoppers')
              .select('id')
              .eq('id', data.user.id)
              .maybeSingle();

            if (fetchError) {
              console.error("Error checking if user exists in shoppers table:", fetchError);
            }

            if (!existingUser) {
              console.log("User not found in shoppers table, inserting new record");
              const { error: insertError } = await supabase
                .from('Shoppers')
                .insert([{ 
                  id: data.user.id, 
                  email: data.user.email || '', 
                  rfid_tag: '' 
                }]);
              
              if (insertError) {
                console.error("Error inserting user into shoppers table:", insertError);
              } else {
                console.log("Successfully added user to shoppers table");
                setUserRole('shopper');
              }
            } else {
              console.log("User already exists in shoppers table");
              setUserRole('shopper');
            }
          }
        } catch (error) {
          console.error("Exception during role determination:", error);
          setUserRole('shopper');
        }
      }

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
      authCheckComplete.current = false;
      
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
      authCheckComplete.current = true;
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
