-- Create enum for user roles
CREATE TYPE public.user_type AS ENUM ('customer', 'garage');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled');

-- Create enum for vehicle type
CREATE TYPE public.vehicle_type AS ENUM ('bike', 'car', 'truck', 'auto_rickshaw', 'other');

-- Create enum for service type
CREATE TYPE public.service_type AS ENUM ('puncture', 'engine_issue', 'battery', 'towing', 'oil_change', 'brake_issue', 'other');

-- Create profiles table for all users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_type user_type NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create garages table for garage-specific info
CREATE TABLE public.garages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  garage_name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  services_offered service_type[] DEFAULT ARRAY['puncture', 'engine_issue', 'battery']::service_type[],
  vehicle_types_serviced vehicle_type[] DEFAULT ARRAY['bike', 'car']::vehicle_type[],
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table for customer vehicles
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  registration_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_requests table
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  garage_id UUID REFERENCES public.garages(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  problem_description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  estimated_arrival TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  garage_id UUID REFERENCES public.garages(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Garages policies
CREATE POLICY "Anyone can view garages" ON public.garages FOR SELECT USING (true);
CREATE POLICY "Garage owners can update their garage" ON public.garages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = garages.profile_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Users can create garage for themselves" ON public.garages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = profile_id AND profiles.user_id = auth.uid())
);

-- Vehicles policies
CREATE POLICY "Users can view their vehicles" ON public.vehicles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = vehicles.profile_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Users can insert their vehicles" ON public.vehicles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = profile_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Users can update their vehicles" ON public.vehicles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = vehicles.profile_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Users can delete their vehicles" ON public.vehicles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = vehicles.profile_id AND profiles.user_id = auth.uid())
);

-- Service requests policies
CREATE POLICY "Customers can view their requests" ON public.service_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = service_requests.customer_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Garages can view pending and their accepted requests" ON public.service_requests FOR SELECT USING (
  status = 'pending' OR 
  EXISTS (SELECT 1 FROM public.garages g JOIN public.profiles p ON g.profile_id = p.id WHERE g.id = service_requests.garage_id AND p.user_id = auth.uid())
);
CREATE POLICY "Customers can create requests" ON public.service_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = customer_id AND profiles.user_id = auth.uid())
);
CREATE POLICY "Customers and assigned garages can update requests" ON public.service_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = service_requests.customer_id AND profiles.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.garages g JOIN public.profiles p ON g.profile_id = p.id WHERE g.id = service_requests.garage_id AND p.user_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews for their requests" ON public.reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = customer_id AND profiles.user_id = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_garages_updated_at BEFORE UPDATE ON public.garages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update garage rating
CREATE OR REPLACE FUNCTION public.update_garage_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.garages 
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM public.reviews WHERE garage_id = NEW.garage_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE garage_id = NEW.garage_id)
  WHERE id = NEW.garage_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_garage_rating_on_review AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_garage_rating();