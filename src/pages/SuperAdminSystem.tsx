import { motion } from 'framer-motion';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Server, 
  Database, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Settings,
  Cpu,
  MemoryStick,
  HardDrive,
  Download,
  Upload,
  Power,
  Network
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function SuperAdminSystem() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Fetch system statistics
  const { data: systemStats, isLoading, refetch } = useQuery({
    queryKey: ['system-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [dronesResult, requestsResult, usersResult, logsResult] = await Promise.all([
        supabase.from('drones').select('status'),
        supabase.from('borrow_requests').select('status'),
        supabase.from('profiles').select('role'),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      const totalDrones = dronesResult.data?.length || 0;
      const activeDrones = dronesResult.data?.filter(d => d.status === 'available').length || 0;
      const totalRequests = requestsResult.data?.length || 0;
      const pendingRequests = requestsResult.data?.filter(r => r.status === 'pending').length || 0;
      const totalUsers = usersResult.data?.length || 0;
      const adminUsers = usersResult.data?.filter(u => u.role === 'admin').length || 0;

      return {
        totalDrones,
        activeDrones,
        totalRequests,
        pendingRequests,
        totalUsers,
        adminUsers,
        recentLogs: logsResult.data || []
      };
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  const { data: systemHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['system-health', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Simulate system health checks
      const dbHealth = await supabase.from('profiles').select('count').limit(1);
      const isDbHealthy = !dbHealth.error;

      return {
        database: {
          status: isDbHealthy ? 'healthy' : 'error',
          connections: Math.floor(Math.random() * 50) + 10,
          responseTime: Math.floor(Math.random() * 100) + 20
        },
        server: {
          status: 'healthy',
          uptime: '15 days, 3 hours',
          cpu: Math.floor(Math.random() * 30) + 20,
          memory: Math.floor(Math.random() * 40) + 30,
          disk: Math.floor(Math.random() * 20) + 10
        },
        services: {
          authentication: 'healthy',
          fileStorage: 'healthy',
          notifications: 'warning',
          backup: 'healthy'
        }
      };
    },
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (loading || isLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Management</h1>
            <p className="text-muted-foreground">Monitor and control core system operations</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* System Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Drones</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.totalDrones || 0}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats?.activeDrones || 0} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.totalRequests || 0}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats?.pendingRequests || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats?.adminUsers || 0} admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={systemHealth?.database.status === 'healthy' ? 'default' : 'destructive'}>
                  {systemHealth?.database.status === 'healthy' ? 'Healthy' : 'Issues'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemHealth?.server.uptime || '0h'} uptime
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Health Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Database</p>
                  <p className="text-lg font-bold text-foreground">
                    {systemHealth?.database.connections} connections
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth?.database.responseTime}ms avg response
                  </p>
                </div>
                <div className="text-right">
                  <Database className="h-8 w-8 text-blue-500 mb-2" />
                  {getStatusBadge(systemHealth?.database.status || 'error')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Server</p>
                  <p className="text-lg font-bold text-foreground">
                    {systemHealth?.server.uptime}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CPU: {systemHealth?.server.cpu}% | RAM: {systemHealth?.server.memory}%
                  </p>
                </div>
                <div className="text-right">
                  <Server className="h-8 w-8 text-green-500 mb-2" />
                  {getStatusBadge(systemHealth?.server.status || 'error')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Services</p>
                  <p className="text-lg font-bold text-foreground">4 Active</p>
                  <p className="text-xs text-muted-foreground">1 warning detected</p>
                </div>
                <div className="text-right">
                  <Activity className="h-8 w-8 text-orange-500 mb-2" />
                  {getStatusBadge('warning')}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                System Resources
              </CardTitle>
              <CardDescription>Real-time system resource monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      CPU Usage
                    </Label>
                    <span className="text-sm font-medium">{systemHealth?.server.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemHealth?.server.cpu}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4" />
                      Memory Usage
                    </Label>
                    <span className="text-sm font-medium">{systemHealth?.server.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemHealth?.server.memory}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Disk Usage
                    </Label>
                    <span className="text-sm font-medium">{systemHealth?.server.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemHealth?.server.disk}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Service Status
              </CardTitle>
              <CardDescription>Monitor individual service health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(systemHealth?.services || {}).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium capitalize">{service.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
              <CardDescription>Latest system events and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemStats?.recentLogs && systemStats.recentLogs.length > 0 ? (
                  systemStats.recentLogs.map((log: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{log.action || 'System Activity'}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.details || 'No details available'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {log.user_id ? 'User Action' : 'System'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity logs available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* System Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Controls
              </CardTitle>
              <CardDescription>Configure system-wide settings and modes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable user access for system updates
                      </p>
                    </div>
                    <Switch
                      id="maintenance-mode"
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="debug-mode">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable detailed logging for troubleshooting
                      </p>
                    </div>
                    <Switch
                      id="debug-mode"
                      checked={debugMode}
                      onCheckedChange={setDebugMode}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="system-message">System Message</Label>
                    <Textarea
                      id="system-message"
                      placeholder="Enter a system-wide message for users..."
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Logs
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import Config
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Restart Services
                </Button>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Power className="w-4 h-4" />
                  System Shutdown
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}