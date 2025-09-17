import { motion } from 'framer-motion';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useProfile } from '@/hooks/useProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users,
  UserCheck,
  Shield,
  Crown,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Plus,
  Ban,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { format } from 'date-fns';

export default function SuperAdminUsers() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['superadmin-users', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const updateUserRole = async (userId: number, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
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

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { color: 'bg-blue-100 text-blue-800', icon: UserCheck },
      admin: { color: 'bg-orange-100 text-orange-800', icon: Shield },
      superadmin: { color: 'bg-purple-100 text-purple-800', icon: Crown }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {role === 'superadmin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
        <Ban className="w-3 h-3" />
        Suspended
      </Badge>
    );
  };

  const filteredUsers = users?.filter(userData => {
    const matchesSearch = userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || userData.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && userData.is_active !== false) ||
                         (statusFilter === 'suspended' && userData.is_active === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users?.length || 0,
    active: users?.filter(u => u.is_active !== false).length || 0,
    suspended: users?.filter(u => u.is_active === false).length || 0,
    users: users?.filter(u => u.role === 'user').length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
    superadmins: users?.filter(u => u.role === 'superadmin').length || 0
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
            <h1 className="text-3xl font-bold text-foreground">Advanced User Management</h1>
            <p className="text-muted-foreground">Complete control over user accounts and permissions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with specified role and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter email address" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="Enter phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select defaultValue="user">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="send-invite" defaultChecked />
                  <Label htmlFor="send-invite">Send invitation email</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Create User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* User Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-6 gap-4"
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{userStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{userStats.suspended}</p>
                <p className="text-sm text-muted-foreground">Suspended</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{userStats.users}</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{userStats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{userStats.superadmins}</p>
                <p className="text-sm text-muted-foreground">Super Admins</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role Filter</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="superadmin">Super Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4"
        >
          {filteredUsers?.map((userData) => (
            <Card key={userData.id} className="bg-gradient-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {userData.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(userData.role)}
                    {getStatusBadge(userData.is_active !== false)}
                  </div>
                </div>
                <CardDescription>
                  User ID: {userData.id} • Joined {format(new Date(userData.created_at), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {userData.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {userData.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(userData.updated_at), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Update Role</Label>
                      <Select 
                        value={userData.role} 
                        onValueChange={(value) => updateUserRole(userData.id, value)}
                        disabled={userData.id === user.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`status-${userData.id}`}
                          checked={userData.is_active !== false}
                          onCheckedChange={(checked) => toggleUserStatus(userData.id, checked)}
                          disabled={userData.id === user.id}
                        />
                        <Label htmlFor={`status-${userData.id}`}>Active</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Permissions
                    </Button>
                    {userData.id !== user.id && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteUser(userData.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers?.length === 0 && (
            <Card className="bg-gradient-card border-primary/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'No users match your current filters.' 
                    : 'No users have been registered yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}