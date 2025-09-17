import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Clock, CheckCircle, Calendar, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function UserDashboard() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const { data: userStats } = useQuery({
    queryKey: ['user-dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [dronesResult, requestsResult] = await Promise.all([
        supabase.from('drones').select('*'),
        supabase.from('borrow_requests').select('*').eq('user_id', user.id)
      ]);

      const availableDrones = dronesResult.data?.filter(d => d.status === 'available').length || 0;
      const totalDrones = dronesResult.data?.length || 0;
      const myRequests = requestsResult.data || [];
      const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
      const approvedRequests = myRequests.filter(r => r.status === 'approved').length;
      const rejectedRequests = myRequests.filter(r => r.status === 'rejected').length;

      return {
        availableDrones,
        totalDrones,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalRequests: myRequests.length,
        recentRequests: myRequests.slice(0, 3)
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
      value: userStats?.availableDrones || 0,
      total: userStats?.totalDrones || 0,
      icon: Plane,
      color: "text-green-500"
    },
    {
      title: "My Requests",
      value: userStats?.totalRequests || 0,
      icon: FileText,
      color: "text-blue-500"
    },
    {
      title: "Pending",
      value: userStats?.pendingRequests || 0,
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Approved",
      value: userStats?.approvedRequests || 0,
      icon: CheckCircle,
      color: "text-green-500"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      case 'approved': return 'bg-green-500/20 text-green-700 border-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-700 border-red-300';
      case 'returned': return 'bg-blue-500/20 text-blue-700 border-blue-300';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

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
            Welcome, {profile?.name || user?.name}!
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-700">
              User Account
            </Badge>
            <p className="text-muted-foreground">
              Manage your drone borrowing requests and browse available drones.
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onClick={() => navigate('/my-requests')}
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

        {/* Recent Requests */}
        {userStats?.recentRequests && userStats.recentRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Requests
                </CardTitle>
                <CardDescription>
                  Your latest drone borrowing requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userStats.recentRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <p className="font-medium">Request #{String(request.id).slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{request.purpose}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}