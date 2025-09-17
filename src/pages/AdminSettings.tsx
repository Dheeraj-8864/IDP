import { motion } from 'framer-motion';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  Lock
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      requestAlerts: true,
      maintenanceAlerts: true,
      systemAlerts: true
    },
    system: {
      autoApproval: false,
      maintenanceMode: false,
      debugMode: false,
      backupFrequency: 'daily',
      sessionTimeout: '30'
    },
    email: {
      smtpServer: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@dronehub.com'
    },
    security: {
      passwordPolicy: 'medium',
      twoFactorAuth: false,
      loginAttempts: '5',
      lockoutDuration: '15'
    }
  });

  const handleSave = async () => {
    try {
      // Here you would typically save to database
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Configure system settings and preferences
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailNotifications: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch
                    id="push-notifications"
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, pushNotifications: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="request-alerts">Request Alerts</Label>
                  <Switch
                    id="request-alerts"
                    checked={settings.notifications.requestAlerts}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, requestAlerts: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
                  <Switch
                    id="maintenance-alerts"
                    checked={settings.notifications.maintenanceAlerts}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, maintenanceAlerts: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system behavior and maintenance options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-approval">Auto Approval</Label>
                  <Switch
                    id="auto-approval"
                    checked={settings.system.autoApproval}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        system: { ...prev.system, autoApproval: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Switch
                    id="maintenance-mode"
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        system: { ...prev.system, maintenanceMode: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select
                    value={settings.system.backupFrequency}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        system: { ...prev.system, backupFrequency: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.system.sessionTimeout}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        system: { ...prev.system, sessionTimeout: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password Policy</Label>
                  <Select
                    value={settings.security.passwordPolicy}
                    onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, passwordPolicy: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (6+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="high">High (12+ chars, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <Switch
                    id="two-factor"
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactorAuth: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-attempts">Max Login Attempts</Label>
                  <Input
                    id="login-attempts"
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, loginAttempts: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    value={settings.security.lockoutDuration}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, lockoutDuration: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-server">SMTP Server</Label>
                  <Input
                    id="smtp-server"
                    value={settings.email.smtpServer}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, smtpServer: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    value={settings.email.smtpPort}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, smtpPort: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input
                    id="smtp-username"
                    value={settings.email.smtpUsername}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, smtpUsername: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, fromEmail: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}