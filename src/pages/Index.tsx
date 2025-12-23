import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Wrench, 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  ArrowRight,
  Phone,
  CheckCircle,
  Users,
  Building2
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Matching',
      description: 'Find nearby garages instantly based on your current location.',
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Get help within minutes with our real-time request system.',
    },
    {
      icon: Shield,
      title: 'Verified Garages',
      description: 'All service centers are verified for quality and reliability.',
    },
    {
      icon: Star,
      title: 'Ratings & Reviews',
      description: 'Choose the best service provider based on customer feedback.',
    },
  ];

  const services = [
    { name: 'Puncture Repair', icon: '🔧' },
    { name: 'Engine Issues', icon: '⚙️' },
    { name: 'Battery Jump', icon: '🔋' },
    { name: 'Towing Service', icon: '🚗' },
    { name: 'Oil Change', icon: '🛢️' },
    { name: 'Brake Repair', icon: '🛑' },
  ];

  const stats = [
    { value: '500+', label: 'Service Centers' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '15min', label: 'Avg Response Time' },
    { value: '4.8', label: 'Average Rating' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">RoadAssist</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Link to={profile?.user_type === 'garage' ? '/garage/dashboard' : '/dashboard'}>
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full text-sm mb-6 animate-slide-up">
              <Phone className="w-4 h-4" />
              <span>24/7 Roadside Assistance Available</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Vehicle Breakdown?
              <span className="block text-accent mt-2">We've Got You Covered</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Connect instantly with nearby verified garages and service centers. 
              Get professional help at your location within minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/auth?tab=signup&type=customer">
                <Button size="xl" variant="accent" className="w-full sm:w-auto">
                  <Users className="w-5 h-5" />
                  I Need Help
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth?tab=signup&type=garage">
                <Button size="xl" variant="heroOutline" className="w-full sm:w-auto">
                  <Building2 className="w-5 h-5" />
                  Register as Garage
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center p-6 rounded-2xl bg-card shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting roadside assistance has never been easier. Follow these simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Request Help', desc: 'Share your location and describe your vehicle problem.' },
              { step: '02', title: 'Garage Accepts', desc: 'Nearby garages receive your request and one accepts to help.' },
              { step: '03', title: 'Get Service', desc: 'Mechanic arrives at your location and fixes the issue.' },
            ].map((item, index) => (
              <div 
                key={item.step}
                className="relative p-8 rounded-2xl bg-card shadow-lg border border-border hover:shadow-xl transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="text-6xl font-bold text-primary/10 absolute top-4 right-4">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Services We Cover
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From minor fixes to major breakdowns, our network covers all your vehicle needs.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <div 
                key={service.name}
                className="p-6 rounded-2xl bg-card shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <div className="font-semibold text-foreground text-sm">{service.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose RoadAssist?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the most reliable and fastest roadside assistance service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl bg-card shadow-lg border border-border hover:border-primary/30 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of vehicle owners and service providers on our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup&type=customer">
              <Button size="xl" variant="accent">
                <Car className="w-5 h-5" />
                Sign Up as User
              </Button>
            </Link>
            <Link to="/auth?tab=signup&type=garage">
              <Button size="xl" variant="heroOutline">
                <Wrench className="w-5 h-5" />
                Register Your Garage
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">RoadAssist</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 RoadAssist. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
