import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActivityLog } from '@/integrations/supabase/types';
import { useAuth } from '@/components/auth/AuthProvider';

export function useActivityLogs() {
    return useQuery({
        queryKey: ['activity-logs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('activity_logs')
                .select(`
          *,
          profiles (
            id,
            name
          )
        `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data;
        },
    });
}

export function useCreateActivityLog() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (log: {
            action: string;
            details?: any;
        }) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('activity_logs')
                .insert({
                    ...log,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
        },
    });
}