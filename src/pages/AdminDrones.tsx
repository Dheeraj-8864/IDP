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
import {
  Plane,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Search
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function AdminDrones() {
  const { user, loading } = useAuthRedirect();
  const { data: profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: drones, isLoading, refetch } = useQuery({
    queryKey: ['admin-drones', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('drones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const updateDroneStatus = async (droneId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('drones')
        .update({ status })
        .eq('id', droneId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating drone status:', error);
    }
  };

  const deleteDrone = async (droneId: number) => {
    if (!confirm('Are you sure you want to delete this drone?')) return;

    try {
      const { error } = await supabase
        .from('drones')
        .delete()
        .eq('id', droneId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error deleting drone:', error);
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
      available: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      borrowed: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      damaged: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      maintenance: { color: 'bg-blue-100 text-blue-800', icon: Settings }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredDrones = drones?.filter(drone => {
    const matchesSearch = drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (drone.model_id && drone.model_id.toString().includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || drone.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Drones</h1>
            <p className="text-muted-foreground">Manage your drone inventory and status</p>
          </div>
          <Button className="bg-gradient-primary hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 mr-2" />
            Add New Drone
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Drones</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or model..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="borrowed">Borrowed</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Drones Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDrones?.map((drone) => (
            <Card key={drone.id} className="bg-gradient-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    {drone.name}
                  </CardTitle>
                  {getStatusBadge(drone.status)}
                </div>
                <CardDescription>
                  Model ID: {drone.model_id || 'Not specified'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {drone.image_url && (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <img 
                      src={drone.image_url} 
                      alt={drone.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select 
                    value={drone.status} 
                    onValueChange={(value) => updateDroneStatus(drone.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="borrowed">Borrowed</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteDrone(drone.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDrones?.length === 0 && (
            <div className="col-span-full">
              <Card className="bg-gradient-card border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plane className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Drones Found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No drones match your current filters.' 
                      : 'No drones have been added to the inventory yet.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}