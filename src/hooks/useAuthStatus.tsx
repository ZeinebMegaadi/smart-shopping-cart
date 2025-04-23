import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'shopper' | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    let authListener: { unsubscribe: () => void } | null = null;
    
    // Only fetch the initial auth state once
    const checkAuthStatus = async () => {
      try {
        console.log("Checking auth status...");
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          setIsAuthenticated(true);
          
          // Check user role
          try {
            // First check if user is an owner
            const { data: ownerData } = await supabase
              .from('owners')
              .select('id')
              .eq('id', session.user.id)
              .single();
            
            if (ownerData) {
              console.log("User role determined: owner");
              if (isMounted) setUserRole('owner');
            } else {
              console.log("User role determined: shopper");
              if (isMounted) setUserRole('shopper');
            }
          } catch (error) {
            console.log("Error checking user role, defaulting to shopper:", error);
            if (isMounted) setUserRole('shopper');
          }
        } else {
          if (isMounted) {
            setIsAuthenticated(false);
            setUserRole(null);
          }
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
        }
      }
    };
    
    // Set up auth listener
    const setupAuthListener = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          
          if (!isMounted) return;
          
          if (session?.user) {
            setIsAuthenticated(true);
            
            // Don't make DB calls inside the auth callback directly
            // Use setTimeout to prevent blocking auth state changes
            setTimeout(async () => {
              if (!isMounted) return;
              
              try {
                const { data: ownerData } = await supabase
                  .from('owners')
                  .select('id')
                  .eq('id', session.user.id)
                  .single();
                
                if (ownerData && isMounted) {
                  console.log("User role from listener: owner");
                  setUserRole('owner');
                } else if (isMounted) {
                  console.log("User role from listener: shopper");
                  setUserRole('shopper');
                }
              } catch (error) {
                console.log("Error in listener checking role:", error);
                if (isMounted) setUserRole('shopper');
              }
              
              if (isMounted) setIsLoading(false);
            }, 0);
          } else {
            if (isMounted) {
              setIsAuthenticated(false);
              setUserRole(null);
              setIsLoading(false);
            }
          }
        }
      );
      
      authListener = subscription;
    };
    
    // Order matters - first set up the listener, then check current state
    setupAuthListener();
    checkAuthStatus();
    
    // Proper cleanup
    return () => {
      console.log("Cleaning up auth status hook");
      isMounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);
  
  return { isAuthenticated, isLoading, userRole };
}
