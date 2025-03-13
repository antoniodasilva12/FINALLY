import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xvqehnzepfjruquiozvs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cWVobnplcGZqcnVxdWlvenZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NTc4OTcsImV4cCI6MjA1NzQzMzg5N30.vy6daT-Gf1CaamK8r2saqdQfQH1Zgkat2_KLSORxK_U';

export type UserRole = 'admin' | 'student';

export interface UserProfile {
  id: string;
  full_name: string;
  national_id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
});

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return { user, profile };
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}; 