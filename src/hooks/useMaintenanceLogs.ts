import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceLog } from '@/integrations/supabase/types';
import { useAuth } from '@/components/auth/AuthProvider';

export function useMaintenanceLogs(droneId?: number) {
    return useQuery({
        queryKey: ['maintenance-logs', droneId],
        queryFn: async () => {
            let query = supabase
                .from('maintenance_logs')
                .select(`
          *,
          drones (
            id,
            name
          ),
          profiles (
            id,
            name
          )
        `)
                .order('created_at', { ascending: false });

            if (droneId) {
                query = query.eq('drone_id', droneId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data;
        },
    });
}

export function useCreateMaintenanceLog() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (log: {
            drone_id: number;
            condition: string;
            notes?: string;
        }) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('maintenance_logs')
                .insert({
                    ...log,
                    performed_by: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
        },
    });
}