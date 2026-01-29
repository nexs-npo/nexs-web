import type { APIRoute } from 'astro';

export const prerender = false;

const REPO = 'shinkkhs/nexs-web';

export const GET: APIRoute = async ({ url }) => {
  const path = url.searchParams.get('path');
  if (!path) {
    return new Response(JSON.stringify({ error: 'path parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate path to prevent traversal — only allow resolution content files
  if (!/^src\/content\/resolutions\/[\w-]+\.mdx$/.test(path)) {
    return new Response(JSON.stringify({ error: 'invalid path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'GITHUB_TOKEN is not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const apiUrl = `https://api.github.com/repos/${REPO}/commits?path=${encodeURIComponent(path)}`;

  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'nexs-web',
    },
  });

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: `GitHub API responded with ${res.status}` }),
      { status: res.status, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const data = await res.json();

  const commits = (data as any[]).map((item) => ({
    sha: item.sha,
    message: item.commit.message.split('\n')[0],
    date: item.commit.author.date,
    author: item.commit.author.name,
  }));

  return new Response(JSON.stringify(commits), {
    headers: { 'Content-Type': 'application/json' },
  });
};
