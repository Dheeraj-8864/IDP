import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDrones } from '@/hooks/useDrones';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarIcon, Plus, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NewRequest() {
  const { user, loading } = useAuthRedirect();
  const { data: drones, isLoading: dronesLoading } = useDrones();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    drone_id: '',
    purpose: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    additional_notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const availableDrones = drones?.filter(drone => 
    drone.status === 'available' || 
    drone.status === 'Currently active' || 
    drone.status === 'active'
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.drone_id || !formData.purpose || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.start_date >= formData.end_date) {
      toast.error('End date must be after start date');
      return;
    }

    if (formData.start_date < new Date()) {
      toast.error('Start date cannot be in the past');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('borrow_requests')
        .insert({
          user_id: user.id,
          drone_id: parseInt(formData.drone_id),
          purpose: formData.purpose,
          start_date: formData.start_date.toISOString().split('T')[0],
          end_date: formData.end_date.toISOString().split('T')[0],
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Request submitted successfully!');
      navigate('/requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Plus className="h-8 w-8 text-primary" />
            New Request
          </h1>
          <p className="text-muted-foreground">
            Submit a new drone borrow request for your project needs.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                Fill out the form below to submit your drone borrow request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Drone Selection */}
                <div className="space-y-2">
                  <Label htmlFor="drone_id">Select Drone *</Label>
                  <Select
                    value={formData.drone_id}
                    onValueChange={(value) => handleInputChange('drone_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a drone" />
                    </SelectTrigger>
                    <SelectContent>
                      {dronesLoading ? (
                        <SelectItem value="loading" disabled>Loading drones...</SelectItem>
                      ) : availableDrones.length === 0 ? (
                        <SelectItem value="none" disabled>No drones available</SelectItem>
                      ) : (
                        availableDrones.map((drone) => (
                          <SelectItem key={drone.id} value={drone.id.toString()}>
                            {drone.name} - {drone.drone_models?.name || 'Unknown Model'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Research project, Photography, Survey work"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    required
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.start_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.start_date ? (
                            format(formData.start_date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.start_date}
                          onSelect={(date) => handleInputChange('start_date', date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.end_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.end_date ? (
                            format(formData.end_date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.end_date}
                          onSelect={(date) => handleInputChange('end_date', date)}
                          disabled={(date) => 
                            date < new Date() || 
                            (formData.start_date && date <= formData.start_date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="additional_notes">Additional Notes</Label>
                  <Textarea
                    id="additional_notes"
                    placeholder="Any additional information or special requirements..."
                    value={formData.additional_notes}
                    onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/requests')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || availableDrones.length === 0}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Request Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Requests are subject to approval by administrators</p>
              <p>• Please provide a clear purpose for your drone usage</p>
              <p>• Ensure you return the drone in good condition by the end date</p>
              <p>• Contact support if you need to extend your borrow period</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}