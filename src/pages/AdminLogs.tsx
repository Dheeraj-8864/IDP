import { motion } from 'framer-motion';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Shield,
  User,
  Calendar,
  Activity,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format } from 'date-fns';

export default function AdminLogs() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const { data: activityLogs, isLoading, refetch } = useActivityLogs();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'bg-green-500/20 text-green-700';
      case 'logout':
        return 'bg-gray-500/20 text-gray-700';
      case 'create':
        return 'bg-blue-500/20 text-blue-700';
      case 'update':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'delete':
        return 'bg-red-500/20 text-red-700';
      case 'approve':
        return 'bg-green-500/20 text-green-700';
      case 'reject':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">
            System Activity Logs
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-700">
              <Shield className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
            <p className="text-muted-foreground">
              Monitor and review all system activities and user actions.
            </p>
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          {/* <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button> */}
        </motion.div>

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                System-wide activity logs and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLogs && activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card/50"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getActionBadgeColor(log.action)}>
                            {log.action}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            by {log.profiles?.name || 'Unknown User'}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Action: {log.action}
                          </p>
                          {log.details && (
                            <div className="text-sm text-muted-foreground">
                              <pre className="whitespace-pre-wrap font-mono text-xs bg-muted/50 p-2 rounded">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), 'HH:mm:ss')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Activity Logs
                  </h3>
                  <p className="text-muted-foreground">
                    No system activity has been recorded yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}