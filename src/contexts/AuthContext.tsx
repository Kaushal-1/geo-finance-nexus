
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { createAuthToastManager } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any | null, user: User | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Create a ref to store the authToastManager to persist across renders
  const authToastManagerRef = useRef(createAuthToastManager());
  
  // Create a ref to track auth state initialization
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    console.log("AuthContext initialization");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Only show toasts after initial loading is complete
        if (isInitializedRef.current) {
          if (event === 'SIGNED_IN') {
            authToastManagerRef.current.showAuthToast(() => {
              toast({
                title: "Welcome!",
                description: "You have successfully signed in.",
              });
            }, "You have successfully signed in.");
          }
          
          if (event === 'SIGNED_OUT') {
            authToastManagerRef.current.showAuthToast(() => {
              toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
              });
            }, "You have been signed out successfully.");
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got session:", currentSession ? "yes" : "no");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      isInitializedRef.current = true;
    });

    return () => {
      console.log("Unsubscribing from auth state changes");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Reset toast manager before attempting sign in
      authToastManagerRef.current.reset();
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Reset toast manager before attempting sign up
      authToastManagerRef.current.reset();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, user: null };
      }
      
      // After sign up, update additional user data in the profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            industry: userData.industry,
            role: userData.role,
            experience: userData.experience,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
      
      return { error: null, user: data.user };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error, user: null };
    }
  };

  const signOut = async () => {
    // Reset toast manager before signing out
    authToastManagerRef.current.reset();
    await supabase.auth.signOut();
  };

  const contextValue = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };

  console.log("AuthProvider rendering, user:", user ? "logged in" : "not logged in");

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
