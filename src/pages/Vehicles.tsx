import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, 
  ArrowLeft, 
  Car,
  Plus,
  Trash2,
  Loader2,
  Bike
} from 'lucide-react';

interface Vehicle {
  id: string;
  vehicle_type: string;
  brand: string;
  model: string;
  registration_number: string | null;
}

const vehicleTypeOptions = [
  { id: 'bike', name: 'Bike', icon: Bike },
  { id: 'car', name: 'Car', icon: Car },
  { id: 'auto_rickshaw', name: 'Auto Rickshaw', icon: Car },
  { id: 'truck', name: 'Truck', icon: Car },
  { id: 'other', name: 'Other', icon: Car },
];

const Vehicles = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [vehicleType, setVehicleType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [regNumber, setRegNumber] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchVehicles();
    }
  }, [profile]);

  const fetchVehicles = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVehicleType('');
    setBrand('');
    setModel('');
    setRegNumber('');
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleType || !brand.trim() || !model.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!profile) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('vehicles')
        .insert({
          profile_id: profile.id,
          vehicle_type: vehicleType as any,
          brand: brand.trim(),
          model: model.trim(),
          registration_number: regNumber.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Vehicle Added!',
        description: 'Your vehicle has been added successfully.',
      });

      resetForm();
      setIsDialogOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to add vehicle. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: 'Vehicle Removed',
        description: 'Your vehicle has been removed.',
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove vehicle.',
        variant: 'destructive',
      });
    }
  };

  const getVehicleIcon = (type: string) => {
    const option = vehicleTypeOptions.find(v => v.id === type);
    return option?.icon || Car;
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Car className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">My Vehicles</span>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Enter your vehicle details to add it to your profile.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="space-y-2">
                  <Label>Vehicle Type *</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypeOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Honda, Toyota"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Civic, Corolla"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input
                    id="regNumber"
                    placeholder="e.g., MH01AB1234"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Vehicle'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">My Vehicles</h1>
          <p className="text-muted-foreground">
            Manage your registered vehicles for quick service requests.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Vehicles Added</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add your vehicles to make service requests faster.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => {
              const VehicleIcon = getVehicleIcon(vehicle.vehicle_type);
              return (
                <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <VehicleIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.vehicle_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {vehicle.registration_number && ` • ${vehicle.registration_number}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Vehicles;
