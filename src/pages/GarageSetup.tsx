import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, 
  ArrowLeft, 
  MapPin, 
  Building2,
  Loader2,
  Car,
  Bike
} from 'lucide-react';

const serviceOptions = [
  { id: 'puncture', name: 'Puncture Repair' },
  { id: 'engine_issue', name: 'Engine Repair' },
  { id: 'battery', name: 'Battery Service' },
  { id: 'towing', name: 'Towing' },
  { id: 'oil_change', name: 'Oil Change' },
  { id: 'brake_issue', name: 'Brake Service' },
];

const vehicleOptions = [
  { id: 'bike', name: 'Bike', icon: Bike },
  { id: 'car', name: 'Car', icon: Car },
  { id: 'auto_rickshaw', name: 'Auto Rickshaw', icon: Car },
  { id: 'truck', name: 'Truck', icon: Car },
];

const GarageSetup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, garage, loading: profileLoading, refetch } = useProfile();
  const { toast } = useToast();

  const [garageName, setGarageName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(['puncture', 'engine_issue', 'battery']);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(['bike', 'car']);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (garage) {
      navigate('/garage/dashboard');
    }
  }, [garage, navigate]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive',
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: 'Location Found',
          description: 'Your garage location has been captured.',
        });
        setIsGettingLocation(false);
      },
      () => {
        toast({
          title: 'Location Error',
          description: 'Unable to get location. You can still enter address manually.',
          variant: 'destructive',
        });
        setIsGettingLocation(false);
      }
    );
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(v => v !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!garageName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your garage name.',
        variant: 'destructive',
      });
      return;
    }

    if (!address.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your garage address.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one service.',
        variant: 'destructive',
      });
      return;
    }

    if (!profile) {
      toast({
        title: 'Error',
        description: 'Profile not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('garages')
        .insert({
          profile_id: profile.id,
          garage_name: garageName,
          description: description,
          address: address,
          latitude: location?.lat,
          longitude: location?.lng,
          services_offered: selectedServices as any,
          vehicle_types_serviced: selectedVehicles as any,
          is_available: true,
        });

      if (error) throw error;

      toast({
        title: 'Garage Created!',
        description: 'Your garage is now set up and ready to receive requests.',
      });

      await refetch();
      navigate('/garage/dashboard');
    } catch (error) {
      console.error('Error creating garage:', error);
      toast({
        title: 'Error',
        description: 'Failed to create garage. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/garage/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Garage Setup</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Set Up Your Garage</h1>
          <p className="text-muted-foreground">
            Complete your garage profile to start receiving service requests from customers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" />
                Garage Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="garageName">Garage Name *</Label>
                <Input
                  id="garageName"
                  placeholder="e.g., Quick Fix Auto Service"
                  value={garageName}
                  onChange={(e) => setGarageName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your garage and services..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
              <CardDescription>
                Your location helps customers find you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Use Current Location
                  </>
                )}
              </Button>
              
              {location && (
                <div className="p-3 rounded-lg bg-success/10 text-success text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location captured successfully
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Enter your full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="w-5 h-5 text-primary" />
                Services Offered
              </CardTitle>
              <CardDescription>
                Select all services your garage provides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {serviceOptions.map((service) => (
                  <div
                    key={service.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedServices.includes(service.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="w-5 h-5 text-primary" />
                Vehicle Types
              </CardTitle>
              <CardDescription>
                Select vehicle types you can service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {vehicleOptions.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedVehicles.includes(vehicle.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleVehicle(vehicle.id)}
                  >
                    <Checkbox
                      checked={selectedVehicles.includes(vehicle.id)}
                      onCheckedChange={() => toggleVehicle(vehicle.id)}
                    />
                    <vehicle.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{vehicle.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Garage...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Create Garage
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default GarageSetup;
