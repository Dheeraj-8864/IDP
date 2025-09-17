import { motion } from 'framer-motion';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  FileText,
  Calendar,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function AdminAnalytics() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const [timeRange, setTimeRange] = useState('7d');

  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case '1d':
        return { start: startOfDay(now), end: endOfDay(now) };
      case '7d':
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
      case '30d':
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      case '90d':
        return { start: startOfDay(subDays(now, 90)), end: endOfDay(now) };
      default:
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
    }
  };

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['admin-analytics', user?.id, timeRange],
    queryFn: async () => {
      if (!user) return null;

      const { start, end } = getDateRange(timeRange);

      // Get user statistics
      const { data: users } = await supabase
        .from('profiles')
        .select('id, role, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // Get request statistics
      const { data: requests } = await supabase
        .from('borrow_requests')
        .select('id, status, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // Get drone statistics
      const { data: drones } = await supabase
        .from('drones')
        .select('id, status, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // Get audit logs
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('id, action, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });

      return {
        users: users || [],
        requests: requests || [],
        drones: drones || [],
        logs: logs || []
      };
    },
    enabled: !!user
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const userStats = {
    total: analytics?.users.length || 0,
    newUsers: analytics?.users.filter(u => new Date(u.created_at) >= getDateRange(timeRange).start).length || 0,
    admins: analytics?.users.filter(u => u.role === 'admin').length || 0,
    superadmins: analytics?.users.filter(u => u.role === 'superadmin').length || 0
  };

  const requestStats = {
    total: analytics?.requests.length || 0,
    pending: analytics?.requests.filter(r => r.status === 'pending').length || 0,
    approved: analytics?.requests.filter(r => r.status === 'approved').length || 0,
    rejected: analytics?.requests.filter(r => r.status === 'rejected').length || 0,
    returned: analytics?.requests.filter(r => r.status === 'returned').length || 0
  };

  const droneStats = {
    total: analytics?.drones.length || 0,
    available: analytics?.drones.filter(d => d.status === 'available').length || 0,
    borrowed: analytics?.drones.filter(d => d.status === 'borrowed').length || 0,
    maintenance: analytics?.drones.filter(d => d.status === 'maintenance').length || 0,
    damaged: analytics?.drones.filter(d => d.status === 'damaged').length || 0
  };

  const activityStats = {
    totalLogs: analytics?.logs.length || 0,
    recentActivity: analytics?.logs.slice(0, 10) || []
  };

  const getStatusBadge = (status: string, type: 'request' | 'drone') => {
    const configs = {
      request: {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        returned: 'bg-blue-100 text-blue-800'
      },
      drone: {
        available: 'bg-green-100 text-green-800',
        borrowed: 'bg-blue-100 text-blue-800',
        maintenance: 'bg-yellow-100 text-yellow-800',
        damaged: 'bg-red-100 text-red-800'
      }
    };

    const config = configs[type][status as keyof typeof configs[typeof type]] || 'bg-gray-100 text-gray-800';
    return <Badge className={config}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
            <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
            <p className="text-muted-foreground">System performance and usage analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Overview Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{userStats.total}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{userStats.newUsers} new
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold text-foreground">{requestStats.total}</p>
                  <p className="text-xs text-yellow-600 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {requestStats.pending} pending
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Drones</p>
                  <p className="text-2xl font-bold text-foreground">{droneStats.available}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    of {droneStats.total} total
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Activity</p>
                  <p className="text-2xl font-bold text-foreground">{activityStats.totalLogs}</p>
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    audit logs
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Request Analytics
                </CardTitle>
                <CardDescription>Request status breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending</span>
                      <span className="font-semibold">{requestStats.pending}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${requestStats.total > 0 ? (requestStats.pending / requestStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Approved</span>
                      <span className="font-semibold">{requestStats.approved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${requestStats.total > 0 ? (requestStats.approved / requestStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rejected</span>
                      <span className="font-semibold">{requestStats.rejected}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${requestStats.total > 0 ? (requestStats.rejected / requestStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Returned</span>
                      <span className="font-semibold">{requestStats.returned}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${requestStats.total > 0 ? (requestStats.returned / requestStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Drone Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Drone Fleet Status
                </CardTitle>
                <CardDescription>Current drone fleet operational status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Available Drones</span>
                      <span className="font-semibold">{droneStats.available}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${droneStats.total > 0 ? (droneStats.available / droneStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Borrowed</span>
                      <span className="font-semibold">{droneStats.borrowed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${droneStats.total > 0 ? (droneStats.borrowed / droneStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Under Maintenance</span>
                      <span className="font-semibold">{droneStats.maintenance}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${droneStats.total > 0 ? (droneStats.maintenance / droneStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Damaged</span>
                      <span className="font-semibold">{droneStats.damaged}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${droneStats.total > 0 ? (droneStats.damaged / droneStats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
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
              <CardDescription>Latest audit logs and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityStats.recentActivity.map((log, index) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{log.action}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                ))}
                {activityStats.recentActivity.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}