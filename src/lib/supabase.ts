import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 公開データの読み取り用クライアント（anonキー）
// RLSが有効なため、SELECT のみ可能
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバーサイド専用クライアント（service_roleキー）
// RLSをバイパスして書き込み可能。APIルート・Webhookハンドラのみで使用すること。
// フロントエンドコンポーネントからは絶対に呼ばないこと。
export function createServiceClient() {
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// ============================================================
// Type Definitions
// ============================================================

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
        Insert: Omit<
          Database['public']['Tables']['public_profiles']['Row'],
          'created_at'
        >;
        Update: Partial<
          Database['public']['Tables']['public_profiles']['Insert']
        >;
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
        Insert: Omit<
          Database['public']['Tables']['projects']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
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
        Insert: Omit<
          Database['public']['Tables']['discussions']['Row'],
          'id' | 'created_at' | 'likes_count'
        >;
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
        Insert: Omit<
          Database['public']['Tables']['signals']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['signals']['Insert']>;
      };
      // --------------------------------------------------------
      // 署名システム（feat/digital-signature-flow で追加）
      // PIIなし: Clerk userId（不透明ID）のみ保存
      // --------------------------------------------------------
      signature_requests: {
        Row: {
          id: string;
          document_type:
            | 'board_resolution'
            | 'general_resolution'
            | 'membership'
            | 'employment'
            | 'volunteer';
          title: string;
          reference_id: string | null;
          reference_slug: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'expired';
          required_signers: number;
          docuseal_submission_id: number | null;
          content_hash: string | null;
          created_by: string; // Clerk userId
          created_at: string;
          completed_at: string | null;
          expires_at: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['signature_requests']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<
          Database['public']['Tables']['signature_requests']['Insert']
        >;
      };
      signatures: {
        Row: {
          id: string;
          request_id: string;
          signer_clerk_id: string; // Clerk userId（PIIではない）
          status: 'pending' | 'signed' | 'declined';
          docuseal_submitter_id: number | null;
          content_hash: string | null;
          signed_at: string | null;
          google_drive_file_id: string | null;
          metadata: Record<string, unknown> | null; // DocuSeal監査情報等
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['signatures']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['signatures']['Insert']>;
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
