import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [dronesResult, requestsResult] = await Promise.all([
        supabase.from('drones').select('status'),
        supabase.from('borrow_requests').select('status').eq('user_id', user.id)
      ]);

      const availableDrones = dronesResult.data?.filter(d => d.status === 'available').length || 0;
      const totalDrones = dronesResult.data?.length || 0;
      const pendingRequests = requestsResult.data?.filter(r => r.status === 'pending').length || 0;
      const approvedRequests = requestsResult.data?.filter(r => r.status === 'approved').length || 0;

      return {
        availableDrones,
        totalDrones,
        pendingRequests,
        approvedRequests
      };
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const quickStats = [
    {
      title: "Available Drones",
      value: stats?.availableDrones || 0,
      total: stats?.totalDrones || 0,
      icon: Plane,
      color: "text-green-500"
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests || 0,
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Approved Requests",
      value: stats?.approvedRequests || 0,
      icon: CheckCircle,
      color: "text-blue-500"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.name || user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your drone management activities.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {quickStats.map((stat, index) => (
            <Card key={stat.title} className="bg-gradient-card border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                      {stat.total && (
                        <span className="text-sm text-muted-foreground ml-1">
                          / {stat.total}
                        </span>
                      )}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => navigate('/drones')}
                  className="h-auto p-4 justify-start bg-gradient-primary hover:scale-105 transition-transform"
                >
                  <div className="text-left">
                    <div className="font-semibold">Browse Drones</div>
                    <div className="text-sm opacity-90">View available drones</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/request')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">New Request</div>
                    <div className="text-sm text-muted-foreground">Borrow a drone</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/requests')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">My Requests</div>
                    <div className="text-sm text-muted-foreground">Track your requests</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role-based Content */}
        {profile?.role && ['admin', 'superadmin'].includes(profile.role) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Admin Actions
                </CardTitle>
                <CardDescription>
                  Administrative tools and oversight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate('/admin/requests')}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Manage Requests</div>
                      <div className="text-sm text-muted-foreground">Review and approve</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => navigate('/admin/drones')}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Manage Drones</div>
                      <div className="text-sm text-muted-foreground">Update inventory</div>
                    </div>
                  </Button>

                  {profile.role === 'superadmin' && (
                    <Button
                      onClick={() => navigate('/admin/analytics')}
                      variant="outline"
                      className="h-auto p-4 justify-start"
                    >
                      <div className="text-left">
                        <div className="font-semibold">Analytics</div>
                        <div className="text-sm text-muted-foreground">View insights</div>
                      </div>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}