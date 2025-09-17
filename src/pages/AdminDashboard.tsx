import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plane,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  AlertTriangle,
  Settings,
  BarChart3,
  FileText,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const { data: adminStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['admin-dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [dronesResult, requestsResult, usersResult, logsResult] = await Promise.all([
        supabase.from('drones').select('*'),
        supabase.from('borrow_requests').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('activity_logs').select('*')
      ]);

      const drones = dronesResult.data || [];
      const requests = requestsResult.data || [];
      const users = usersResult.data || [];
      const logs = logsResult.data || [];

      const availableDrones = drones.filter(d => d.status === 'available').length;
      const borrowedDrones = drones.filter(d => d.status === 'borrowed').length;
      const damagedDrones = drones.filter(d => d.status === 'damaged').length;
      const maintenanceDrones = drones.filter(d => d.status === 'maintenance').length;

      const pendingRequests = requests.filter(r => r.status === 'pending').length;
      const approvedRequests = requests.filter(r => r.status === 'approved').length;
      const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
      const returnedRequests = requests.filter(r => r.status === 'returned').length;

      const totalUsers = users.length;
      const adminUsers = users.filter(u => u.role === 'admin').length;
      const regularUsers = users.filter(u => u.role === 'user').length;

      const recentActivities = logs.slice(0, 5);

      return {
        totalDrones: drones.length,
        availableDrones,
        borrowedDrones,
        damagedDrones,
        maintenanceDrones,
        totalRequests: requests.length,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        returnedRequests,
        totalUsers,
        adminUsers,
        regularUsers,
        recentActivities
      };
    },
    enabled: !!user
  });

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{statsError.message}</p>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      title: "Total Drones",
      value: adminStats?.totalDrones || 0,
      icon: Plane,
      color: "text-blue-500"
    },
    {
      title: "Available",
      value: adminStats?.availableDrones || 0,
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      title: "Borrowed",
      value: adminStats?.borrowedDrones || 0,
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Damaged",
      value: adminStats?.damagedDrones || 0,
      icon: AlertTriangle,
      color: "text-red-500"
    },
    {
      title: "Pending Requests",
      value: adminStats?.pendingRequests || 0,
      icon: FileText,
      color: "text-orange-500"
    },
    {
      title: "Total Users",
      value: adminStats?.totalUsers || 0,
      icon: Users,
      color: "text-purple-500"
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
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-700">
              <Shield className="w-3 h-3 mr-1" />
              Administrator
            </Badge>
            <p className="text-muted-foreground">
              Welcome back, {profile?.name || user?.name}! Manage the drone system.
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Actions
              </CardTitle>
              <CardDescription>
                Administrative tools and management functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => navigate('/admin/requests')}
                  className="h-auto p-4 justify-start bg-gradient-primary hover:scale-105 transition-transform"
                >
                  <div className="text-left">
                    <div className="font-semibold">Manage Requests</div>
                    <div className="text-sm opacity-90">Review & approve requests</div>
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

                <Button
                  onClick={() => navigate('/admin/users')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Manage Users</div>
                    <div className="text-sm text-muted-foreground">User management</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/admin/reports')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Reports</div>
                    <div className="text-sm text-muted-foreground">Generate reports</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/admin/settings')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Settings</div>
                    <div className="text-sm text-muted-foreground">System configuration</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/admin/analytics')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Analytics</div>
                    <div className="text-sm text-muted-foreground">Usage statistics</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Requests for Review */}
        {adminStats?.recentRequests && adminStats.recentRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Requests
                </CardTitle>
                <CardDescription>
                  Latest borrow requests requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminStats.recentRequests.slice(0, 5).map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <p className="font-medium">Request #{request.id.slice(0, 8)}</p>
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