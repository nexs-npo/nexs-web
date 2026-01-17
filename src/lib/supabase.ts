import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe helpers
export type Database = {
  public: {
    Tables: {
      public_profiles: {
        Row: {
          clerk_id: string;
          display_name: string;
          avatar_url: string | null;
          role: 'admin' | 'researcher' | 'member' | 'visitor';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['public_profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['public_profiles']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          status: 'planning' | 'in_progress' | 'completed';
          theme: {
            primary: string;
            bg: string;
          } | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      hypotheses: {
        Row: {
          id: string;
          project_id: string;
          content: string;
          status: 'collecting_data' | 'analyzing' | 'verified';
          display_order: number;
        };
        Insert: Omit<Database['public']['Tables']['hypotheses']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['hypotheses']['Insert']>;
      };
      discussions: {
        Row: {
          id: string;
          project_id: string;
          user_clerk_id: string;
          content: string;
          parent_id: string | null;
          likes_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['discussions']['Row'], 'id' | 'created_at' | 'likes_count'>;
        Update: Partial<Database['public']['Tables']['discussions']['Insert']>;
      };
      signals: {
        Row: {
          id: string;
          type: 'news' | 'log';
          title: string;
          content: string;
          tags: string[];
          source_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['signals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['signals']['Insert']>;
      };
    };
  };
};

// Fetch helpers with error handling
export async function fetchProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { data: [], error: 'Failed to fetch projects' };
  }
}

export async function fetchSignals(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching signals:', error);
    return { data: [], error: 'Failed to fetch signals' };
  }
}

export async function fetchProjectBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        hypotheses (*)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching project:', error);
    return { data: null, error: 'Failed to fetch project' };
  }
}

export async function fetchDiscussions(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        public_profiles (
          clerk_id,
          display_name,
          avatar_url,
          role
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return { data: [], error: 'Failed to fetch discussions' };
  }
}
