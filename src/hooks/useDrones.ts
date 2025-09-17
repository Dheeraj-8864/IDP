import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Drone, DroneModel, DroneStatus } from '@/integrations/supabase/types';

export function useDrones() {
    return useQuery({
        queryKey: ['drones'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('drones')
                .select(`
          *,
          drone_models (
            id,
            name,
            manufacturer,
            specs
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });
}

export function useDroneModels() {
    return useQuery({
        queryKey: ['drone-models'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('drone_models')
                .select('*')
                .order('name');

            if (error) throw error;
            return data;
        },
    });
}

export function useCreateDrone() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (drone: {
            name: string;
            model_id?: number;
            image_url?: string;
            status: DroneStatus;
        }) => {
            const { data, error } = await supabase
                .from('drones')
                .insert(drone)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drones'] });
        },
    });
}

export function useUpdateDrone() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Drone> & { id: number }) => {
            const { data, error } = await supabase
                .from('drones')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drones'] });
        },
    });
}

export function useDeleteDrone() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from('drones')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drones'] });
        },
    });
}