import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, 
  ArrowLeft, 
  MapPin, 
  Car,
  Loader2,
  AlertTriangle,
  Battery,
  Settings,
  Truck,
  Droplet,
  CircleDot
} from 'lucide-react';

const serviceTypes = [
  { id: 'puncture', name: 'Puncture Repair', icon: CircleDot, description: 'Flat tire or puncture' },
  { id: 'engine_issue', name: 'Engine Issue', icon: Settings, description: 'Engine problems' },
  { id: 'battery', name: 'Battery Jump', icon: Battery, description: 'Dead battery' },
  { id: 'towing', name: 'Towing Service', icon: Truck, description: 'Vehicle towing' },
  { id: 'oil_change', name: 'Oil Change', icon: Droplet, description: 'Oil replacement' },
  { id: 'brake_issue', name: 'Brake Issue', icon: AlertTriangle, description: 'Brake problems' },
];

const NewRequest = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  const [selectedService, setSelectedService] = useState<string>('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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
        setAddress(`Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`);
        toast({
          title: 'Location Found',
          description: 'Your current location has been captured.',
        });
        setIsGettingLocation(false);
      },
      (error) => {
        toast({
          title: 'Location Error',
          description: 'Unable to get your location. Please enter address manually.',
          variant: 'destructive',
        });
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      toast({
        title: 'Error',
        description: 'Please select a service type.',
        variant: 'destructive',
      });
      return;
    }

    if (!location && !address) {
      toast({
        title: 'Error',
        description: 'Please provide your location or address.',
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
        .from('service_requests')
        .insert({
          customer_id: profile.id,
          service_type: selectedService as any,
          problem_description: description,
          latitude: location?.lat || 0,
          longitude: location?.lng || 0,
          address: address,
          status: 'pending' as any,
        });

      if (error) throw error;

      toast({
        title: 'Request Submitted!',
        description: 'Your service request has been sent to nearby garages.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create request. Please try again.',
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
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">New Request</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Request Assistance</h1>
          <p className="text-muted-foreground">
            Tell us about your vehicle problem and we'll connect you with nearby service providers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">What service do you need?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {serviceTypes.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedService === service.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <service.icon className={`w-6 h-6 mb-2 ${
                    selectedService === service.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className={`font-medium text-sm ${
                    selectedService === service.id ? 'text-primary' : 'text-foreground'
                  }`}>
                    {service.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {service.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-primary" />
                Your Location
              </CardTitle>
              <CardDescription>
                Share your current location or enter address manually
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
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Enter Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your location address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {location && (
                <div className="p-3 rounded-lg bg-success/10 text-success text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location captured successfully
                </div>
              )}
            </CardContent>
          </Card>

          {/* Problem Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Problem Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your vehicle problem in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isSubmitting || !selectedService}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default NewRequest;
