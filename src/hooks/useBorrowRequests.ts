import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BorrowRequest, RequestStatus } from '@/integrations/supabase/types';
import { useAuth } from '@/components/auth/AuthProvider';

export function useBorrowRequests() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['borrow-requests', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('borrow_requests')
                .select(`
          *,
          drones (
            id,
            name,
            drone_models (
              name,
              manufacturer
            )
          ),
          profiles (
            id,
            name,
            email
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });
}

export function useAllBorrowRequests() {
    return useQuery({
        queryKey: ['all-borrow-requests'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('borrow_requests')
                .select(`
          *,
          drones (
            id,
            name,
            drone_models (
              name,
              manufacturer
            )
          ),
          profiles (
            id,
            name,
            email
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });
}

export function useCreateBorrowRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (request: {
            drone_id: number;
            purpose: string;
            start_date: string;
            end_date: string;
        }) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('borrow_requests')
                .insert({
                    ...request,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
            queryClient.invalidateQueries({ queryKey: ['all-borrow-requests'] });
        },
    });
}

export function useUpdateBorrowRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<BorrowRequest> & { id: number }) => {
            const { data, error } = await supabase
                .from('borrow_requests')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
            queryClient.invalidateQueries({ queryKey: ['all-borrow-requests'] });
        },
    });
}