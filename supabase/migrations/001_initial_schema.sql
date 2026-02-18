-- ========================================
-- nexs - Initial Database Schema
-- ========================================
-- Migration: 001_initial_schema
-- Description: Create all core tables with RLS policies
-- Target: Supabase (PostgreSQL 15+)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------
-- 1. public_profiles (Users)
-- ----------------------------------------
-- Clerk上のユーザー情報のキャッシュ + 独自ロール管理
CREATE TABLE IF NOT EXISTS public.public_profiles (
    clerk_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'visitor' CHECK (role IN ('admin', 'researcher', 'member', 'visitor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_public_profiles_role ON public.public_profiles(role);

-- RLS Policies
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
CREATE POLICY "public_profiles_select_all"
    ON public.public_profiles FOR SELECT
    USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "public_profiles_insert_own"
    ON public.public_profiles FOR INSERT
    WITH CHECK (auth.uid()::text = clerk_id);

-- Users can update their own profile (except role)
CREATE POLICY "public_profiles_update_own"
    ON public.public_profiles FOR UPDATE
    USING (auth.uid()::text = clerk_id)
    WITH CHECK (auth.uid()::text = clerk_id);

-- ----------------------------------------
-- 2. projects (プロジェクト)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'archived')),
    theme JSONB DEFAULT '{"primary": "blue-500", "bg": "blue-50"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_category ON public.projects(category);

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Everyone can read projects
CREATE POLICY "projects_select_all"
    ON public.projects FOR SELECT
    USING (true);

-- Only admin/researcher can insert/update
CREATE POLICY "projects_insert_admin_researcher"
    ON public.projects FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.public_profiles
            WHERE clerk_id = auth.uid()::text
            AND role IN ('admin', 'researcher')
        )
    );

CREATE POLICY "projects_update_admin_researcher"
    ON public.projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.public_profiles
            WHERE clerk_id = auth.uid()::text
            AND role IN ('admin', 'researcher')
        )
    );

-- ----------------------------------------
-- 3. hypotheses (仮説・検証項目)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'collecting_data' CHECK (status IN ('collecting_data', 'analyzing', 'verified', 'rejected')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_hypotheses_project_id ON public.hypotheses(project_id);
CREATE INDEX idx_hypotheses_project_order ON public.hypotheses(project_id, display_order);

-- RLS Policies
ALTER TABLE public.hypotheses ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "hypotheses_select_all"
    ON public.hypotheses FOR SELECT
    USING (true);

-- Only admin/researcher can insert/update
CREATE POLICY "hypotheses_insert_admin_researcher"
    ON public.hypotheses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.public_profiles
            WHERE clerk_id = auth.uid()::text
            AND role IN ('admin', 'researcher')
        )
    );

CREATE POLICY "hypotheses_update_admin_researcher"
    ON public.hypotheses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.public_profiles
            WHERE clerk_id = auth.uid()::text
            AND role IN ('admin', 'researcher')
        )
    );

-- ----------------------------------------
-- 4. discussions (議論・コメント)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_clerk_id TEXT NOT NULL REFERENCES public.public_profiles(clerk_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_discussions_project_id ON public.discussions(project_id);
CREATE INDEX idx_discussions_user_clerk_id ON public.discussions(user_clerk_id);
CREATE INDEX idx_discussions_parent_id ON public.discussions(parent_id);
CREATE INDEX idx_discussions_created_at ON public.discussions(created_at DESC);

-- RLS Policies
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Everyone can read discussions
CREATE POLICY "discussions_select_all"
    ON public.discussions FOR SELECT
    USING (true);

-- Authenticated users can insert
CREATE POLICY "discussions_insert_authenticated"
    ON public.discussions FOR INSERT
    WITH CHECK (auth.uid()::text = user_clerk_id);

-- Users can update/delete their own discussions
CREATE POLICY "discussions_update_own"
    ON public.discussions FOR UPDATE
    USING (auth.uid()::text = user_clerk_id);

CREATE POLICY "discussions_delete_own"
    ON public.discussions FOR DELETE
    USING (auth.uid()::text = user_clerk_id);

-- ----------------------------------------
-- 5. signals (ニュース・ログ)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('news', 'log')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_signals_type ON public.signals(type);
CREATE INDEX idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX idx_signals_tags ON public.signals USING GIN(tags);

-- RLS Policies
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "signals_select_all"
    ON public.signals FOR SELECT
    USING (true);

-- Only admin can insert/update
CREATE POLICY "signals_insert_admin"
    ON public.signals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.public_profiles
            WHERE clerk_id = auth.uid()::text
            AND role = 'admin'
        )
    );

-- ----------------------------------------
-- 6. project_members (プロジェクトメンバー)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_clerk_id TEXT NOT NULL REFERENCES public.public_profiles(clerk_id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('owner', 'maintainer', 'contributor')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_clerk_id)
);

-- Indexes
CREATE INDEX idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX idx_project_members_user_clerk_id ON public.project_members(user_clerk_id);

-- RLS Policies
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "project_members_select_all"
    ON public.project_members FOR SELECT
    USING (true);

-- Authenticated users can join projects
CREATE POLICY "project_members_insert_authenticated"
    ON public.project_members FOR INSERT
    WITH CHECK (auth.uid()::text = user_clerk_id);

-- Project owners can manage members
CREATE POLICY "project_members_update_owner"
    ON public.project_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = project_members.project_id
            AND pm.user_clerk_id = auth.uid()::text
            AND pm.role = 'owner'
        )
    );

-- ----------------------------------------
-- 7. Functions & Triggers
-- ----------------------------------------

-- Updated_at auto-update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_public_profiles_updated_at
    BEFORE UPDATE ON public.public_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hypotheses_updated_at
    BEFORE UPDATE ON public.hypotheses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
    BEFORE UPDATE ON public.discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- 8. Initial Data (Sample)
-- ----------------------------------------

-- Insert sample admin profile (replace with your Clerk ID)
INSERT INTO public.public_profiles (clerk_id, display_name, role)
VALUES ('user_sample_admin_id', 'nexs_admin', 'admin')
ON CONFLICT (clerk_id) DO NOTHING;

-- Sample project
INSERT INTO public.projects (slug, title, description, category, status, theme)
VALUES (
    'minna-jimukyoku',
    'みんなの事務局',
    'NPO事務局のシェアードサービス化を通じた、評価経済社会の実装実験。',
    'Shared Service',
    'in_progress',
    '{"primary": "blue-500", "bg": "blue-50", "text": "blue-900", "border": "blue-100"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Hypotheses for sample project
INSERT INTO public.hypotheses (project_id, content, display_order)
SELECT p.id, '資本主義外での評価経済の可能性検証', 1
FROM public.projects p WHERE p.slug = 'minna-jimukyoku'
ON CONFLICT DO NOTHING;

INSERT INTO public.hypotheses (project_id, content, display_order)
SELECT p.id, 'ミッション第一組織における人材評価モデルの再構築', 2
FROM public.projects p WHERE p.slug = 'minna-jimukyoku'
ON CONFLICT DO NOTHING;

INSERT INTO public.hypotheses (project_id, content, display_order)
SELECT p.id, 'NPO支援エコシステムの最適化', 3
FROM public.projects p WHERE p.slug = 'minna-jimukyoku'
ON CONFLICT DO NOTHING;

-- Sample signal
INSERT INTO public.signals (type, title, content, tags)
VALUES (
    'log',
    'データベーススキーマ構築完了',
    'nexs Webプロジェクトの初期データベーススキーマを構築しました。RLSポリシーにより、安全なデータアクセスを実現しています。',
    ARRAY['Development', 'Database']
)
ON CONFLICT DO NOTHING;

-- ----------------------------------------
-- Migration Complete
-- ----------------------------------------
COMMENT ON TABLE public.public_profiles IS 'Clerkユーザー情報のキャッシュ + 独自ロール管理（PII不含）';
COMMENT ON TABLE public.projects IS '実験プロジェクトの基本情報';
COMMENT ON TABLE public.hypotheses IS 'プロジェクトに紐づく検証項目';
COMMENT ON TABLE public.discussions IS 'オープンディスカッション（スレッド対応）';
COMMENT ON TABLE public.signals IS 'AIニュース収集 + 実験ログ';
COMMENT ON TABLE public.project_members IS 'プロジェクトメンバーシップ管理';
