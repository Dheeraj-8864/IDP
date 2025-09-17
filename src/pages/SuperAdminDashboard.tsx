import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Plane,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  AlertTriangle,
  Settings,
  BarChart3,
  FileText,
  Shield,
  Database,
  Activity,
  TrendingUp,
  UserCheck,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function SuperAdminDashboard() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const { data: superAdminStats } = useQuery({
    queryKey: ['superadmin-dashboard-stats', user?.id],
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
      const superAdminUsers = users.filter(u => u.role === 'superadmin').length;
      const regularUsers = users.filter(u => u.role === 'user').length;

      // Recent activity from logs
      const recentActivity = logs.slice(0, 10);

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
        superAdminUsers,
        regularUsers,
        totalLogs: logs.length,
        recentActivity,
        recentRequests: requests.slice(0, 5)
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

  const systemStats = [
    {
      title: "Total Drones",
      value: superAdminStats?.totalDrones || 0,
      icon: Plane,
      color: "text-blue-500"
    },
    {
      title: "Available",
      value: superAdminStats?.availableDrones || 0,
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      title: "In Use",
      value: superAdminStats?.borrowedDrones || 0,
      icon: Clock,
      color: "text-yellow-500"
    },
    {
      title: "Maintenance",
      value: superAdminStats?.maintenanceDrones || 0,
      icon: Settings,
      color: "text-orange-500"
    },
    {
      title: "Damaged",
      value: superAdminStats?.damagedDrones || 0,
      icon: AlertTriangle,
      color: "text-red-500"
    },
    {
      title: "Total Users",
      value: superAdminStats?.totalUsers || 0,
      icon: Users,
      color: "text-purple-500"
    },
    {
      title: "System Logs",
      value: superAdminStats?.totalLogs || 0,
      icon: Database,
      color: "text-cyan-500"
    },
    {
      title: "Active Requests",
      value: superAdminStats?.pendingRequests || 0,
      icon: FileText,
      color: "text-indigo-500"
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
            Super Admin Command Center
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border-purple-300">
              <Crown className="w-3 h-3 mr-1" />
              Super Administrator
            </Badge>
            <p className="text-muted-foreground">
              Welcome back, {profile?.name || user?.name}! Full system control and oversight.
            </p>
          </div>
        </motion.div>

        {/* System Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {systemStats.map((stat, index) => (
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

        {/* Super Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Super Admin Controls
              </CardTitle>
              <CardDescription>
                Full system administration and advanced management tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => navigate('/superadmin/system')}
                  className="h-auto p-4 justify-start bg-gradient-primary hover:scale-105 transition-transform"
                >
                  <div className="text-left">
                    <div className="font-semibold">System Management</div>
                    <div className="text-sm opacity-90">Core system controls</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/superadmin/users')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">User Management</div>
                    <div className="text-sm text-muted-foreground">Manage all users & roles</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/superadmin/analytics')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Advanced Analytics</div>
                    <div className="text-sm text-muted-foreground">Deep insights & reports</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/superadmin/audit')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Audit Logs</div>
                    <div className="text-sm text-muted-foreground">System activity logs</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/superadmin/backup')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Backup & Recovery</div>
                    <div className="text-sm text-muted-foreground">Data management</div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/superadmin/security')}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                >
                  <div className="text-left">
                    <div className="font-semibold">Security Center</div>
                    <div className="text-sm text-muted-foreground">Security configuration</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Role Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                User Role Distribution
              </CardTitle>
              <CardDescription>
                System user breakdown by access level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-500/10">
                  <p className="text-2xl font-bold text-blue-600">{superAdminStats?.regularUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Regular Users</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-500/10">
                  <p className="text-2xl font-bold text-orange-600">{superAdminStats?.adminUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Administrators</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10">
                  <p className="text-2xl font-bold text-purple-600">{superAdminStats?.superAdminUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Super Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent System Activity */}
        {superAdminStats?.recentActivity && superAdminStats.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent System Activity
                </CardTitle>
                <CardDescription>
                  Latest actions and events across the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {superAdminStats.recentActivity.slice(0, 8).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Log #{log.id.slice(0, 8)}
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