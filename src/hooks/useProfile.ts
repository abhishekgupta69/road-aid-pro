import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface Profile {
  id: string;
  user_id: string;
  user_type: 'customer' | 'garage';
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface Garage {
  id: string;
  profile_id: string;
  garage_name: string;
  description: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  services_offered: string[];
  vehicle_types_serviced: string[];
  is_available: boolean;
  rating: number;
  total_reviews: number;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setGarage(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      setProfile(profileData as Profile | null);

      if (profileData?.user_type === 'garage') {
        const { data: garageData, error: garageError } = await supabase
          .from('garages')
          .select('*')
          .eq('profile_id', profileData.id)
          .maybeSingle();

        if (garageError) throw garageError;
        setGarage(garageData as Garage | null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return { profile, garage, loading, refetch: fetchProfile };
}
