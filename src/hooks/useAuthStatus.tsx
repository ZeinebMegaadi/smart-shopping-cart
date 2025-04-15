
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    let authListener: { unsubscribe: () => void } | null = null;
    
    const checkAuthStatus = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setIsAuthenticated(!!session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };
    
    // Set up auth state listener
    const setupAuthListener = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (isMounted) {
            setIsAuthenticated(!!session);
            setIsLoading(false);
          }
        }
      );
      
      authListener = subscription;
    };
    
    setupAuthListener();
    checkAuthStatus();
    
    return () => {
      isMounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);
  
  return { isAuthenticated, isLoading };
}
