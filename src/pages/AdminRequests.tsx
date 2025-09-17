import { motion } from 'framer-motion';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function AdminRequests() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['admin-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('borrow_requests')
        .select(`
          *,
          profiles(name, email),
          drones(name, drone_models(name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const updateRequestStatus = async (requestId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      returned: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Requests</h1>
            <p className="text-muted-foreground">Review and manage all borrow requests</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4"
        >
          {requests?.map((request) => (
            <Card key={request.id} className="bg-gradient-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Request #{request.id}
                  </CardTitle>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  Submitted on {format(new Date(request.created_at), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requester</p>
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {request.profiles?.name || 'Unknown User'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Drone</p>
                    <p>{request.drones?.name || 'Unknown Drone'}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.drones?.drone_models?.name || 'Model Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                    <p className="truncate">{request.purpose}</p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => updateRequestStatus(request.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {requests?.length === 0 && (
            <Card className="bg-gradient-card border-primary/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Requests Found</h3>
                <p className="text-muted-foreground text-center">
                  There are no borrow requests to review at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}