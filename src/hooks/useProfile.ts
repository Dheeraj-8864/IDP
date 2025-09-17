import { useAuth } from '@/components/auth/AuthProvider';

export function useProfile() {
  const { user } = useAuth();

  // Since user is now the profile itself, we can return it directly
  return {
    data: user,
    isLoading: false,
    error: null
  };
}