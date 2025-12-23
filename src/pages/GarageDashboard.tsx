import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, 
  LogOut,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Star,
  AlertCircle,
  Navigation,
  Settings
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  service_type: string;
  status: string;
  address: string;
  latitude: number;
  longitude: number;
  problem_description: string;
  created_at: string;
  customer_id: string;
  profiles?: {
    full_name: string;
    phone: string | null;
  };
}

const GarageDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, garage, loading: profileLoading, refetch } = useProfile();
  const { toast } = useToast();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile?.user_type === 'customer') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (garage) {
      setIsAvailable(garage.is_available);
      fetchRequests();
      fetchMyRequests();
    }
  }, [garage]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          profiles!service_requests_customer_id_fkey (
            full_name,
            phone
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchMyRequests = async () => {
    if (!garage) return;

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          profiles!service_requests_customer_id_fkey (
            full_name,
            phone
          )
        `)
        .eq('garage_id', garage.id)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error) {
      console.error('Error fetching my requests:', error);
    }
  };

  const toggleAvailability = async (value: boolean) => {
    if (!garage) return;

    try {
      const { error } = await supabase
        .from('garages')
        .update({ is_available: value })
        .eq('id', garage.id);

      if (error) throw error;
      
      setIsAvailable(value);
      toast({
        title: value ? 'You are now available' : 'You are now offline',
        description: value ? 'You will receive new service requests.' : 'You will not receive new requests.',
      });
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!garage) return;

    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          garage_id: garage.id,
          status: 'accepted' 
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request Accepted!',
        description: 'Contact the customer and head to their location.',
      });

      fetchRequests();
      fetchMyRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Request marked as ${status.replace(/_/g, ' ')}.`,
      });

      fetchMyRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatServiceType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning';
      case 'accepted': return 'bg-primary/20 text-primary';
      case 'on_the_way': return 'bg-primary/20 text-primary';
      case 'in_progress': return 'bg-primary/20 text-primary';
      case 'completed': return 'bg-success/20 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show setup screen if garage not configured
  if (profile?.user_type === 'garage' && !garage) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">RoadAssist</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Complete Your Garage Profile</CardTitle>
              <CardDescription>
                Set up your garage details to start receiving service requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/garage/setup">
                <Button className="w-full" size="lg">
                  <Settings className="w-4 h-4 mr-2" />
                  Set Up Garage
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">RoadAssist</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {isAvailable ? 'Available' : 'Offline'}
              </span>
              <Switch
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Garage Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{garage?.garage_name}</h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {garage?.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning" />
                    {garage?.rating || 0} ({garage?.total_reviews || 0} reviews)
                  </span>
                </div>
              </div>
              <Link to="/garage/settings">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* My Active Jobs */}
        {myRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Active Jobs ({myRequests.length})
            </h2>
            
            <div className="space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id} className="border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground text-lg">
                            {formatServiceType(request.service_type)}
                          </h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            Customer: {request.profiles?.full_name}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {request.address || 'Location shared'}
                          </div>
                          {request.problem_description && (
                            <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded">
                              "{request.problem_description}"
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {request.profiles?.phone && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`tel:${request.profiles.phone}`}>
                              <Phone className="w-4 h-4 mr-2" />
                              Call Customer
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`https://www.google.com/maps?q=${request.latitude},${request.longitude}`, '_blank')}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Navigate
                        </Button>
                        
                        {request.status === 'accepted' && (
                          <Button 
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, 'on_the_way')}
                          >
                            On My Way
                          </Button>
                        )}
                        {request.status === 'on_the_way' && (
                          <Button 
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, 'in_progress')}
                          >
                            Start Service
                          </Button>
                        )}
                        {request.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, 'completed')}
                            className="bg-success text-success-foreground hover:bg-success/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* New Requests */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            New Requests ({requests.length})
          </h2>
          
          {loadingRequests ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No New Requests</h3>
                <p className="text-muted-foreground text-sm">
                  New service requests from nearby customers will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-foreground">
                          {formatServiceType(request.service_type)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.profiles?.full_name}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      {request.address || 'Location shared'}
                    </div>
                    
                    {request.problem_description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        "{request.problem_description}"
                      </p>
                    )}
                    
                    <Button 
                      className="w-full" 
                      onClick={() => acceptRequest(request.id)}
                      disabled={!isAvailable}
                    >
                      Accept Request
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GarageDashboard;
