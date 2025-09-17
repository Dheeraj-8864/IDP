import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDrones } from '@/hooks/useDrones';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Plane, Search, Filter, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BrowseDrones() {
  const { user, loading } = useAuthRedirect();
  const { data: drones, isLoading } = useDrones();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredDrones = drones?.filter(drone => {
    const matchesSearch = drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drone.drone_models?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || drone.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'borrowed':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'maintenance':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'damaged':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const handleBorrowRequest = (droneId: number) => {
    navigate(`/request?droneId=${droneId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Plane className="h-8 w-8 text-primary" />
            Browse Drones
          </h1>
          <p className="text-muted-foreground">
            Explore our fleet of available drones and submit borrow requests.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search drones by name or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="borrowed">Borrowed</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Drones Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gradient-card border-primary/20">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-48 bg-muted rounded-lg"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDrones.map((drone, index) => (
              <motion.div
                key={drone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-card border-primary/20 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{drone.name}</CardTitle>
                        <CardDescription>
                          {drone.drone_models?.name} by {drone.drone_models?.manufacturer}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(drone.status)}>
                        {drone.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Drone Image */}
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      {drone.image_url ? (
                        <img
                          src={drone.image_url}
                          alt={drone.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Plane className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>

                    {/* Drone Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Added {new Date(drone.created_at || '').toLocaleDateString()}
                      </div>
                      {drone.drone_models?.specs && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Specs:</strong> {JSON.stringify(drone.drone_models.specs)}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleBorrowRequest(drone.id)}
                      disabled={drone.status !== 'available'}
                      className="w-full"
                      variant={drone.status === 'available' ? 'default' : 'secondary'}
                    >
                      {drone.status === 'available' ? 'Request to Borrow' : `Currently ${drone.status}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredDrones.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No drones found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No drones are currently available in the system.'}
            </p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}