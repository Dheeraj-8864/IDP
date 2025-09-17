import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/integrations/supabase/types';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Profile>;
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('drone_hub_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('drone_hub_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password) // Note: In production, passwords should be hashed
      .single();

    if (error || !data) {
      throw new Error('Invalid email or password');
    }

    setUser(data);
    localStorage.setItem('drone_hub_user', JSON.stringify(data));

    // Set user context for RLS policies
    await supabase.rpc('set_current_user_id', { user_id: data.id });

    return data;
  };

  const signUp = async (name: string, email: string, password: string, phone?: string): Promise<void> => {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const { error } = await supabase
      .from('profiles')
      .insert({
        name,
        email,
        password, // Note: In production, passwords should be hashed
        phone,
        role: 'user'
      });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('drone_hub_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}