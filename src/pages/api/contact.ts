export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'メール送信サービスが設定されていません。' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return new Response(
      JSON.stringify({ error: 'リクエストの形式が正しくありません。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const name = body.get('name')?.toString().trim();
  const email = body.get('email')?.toString().trim();
  const org = body.get('org')?.toString().trim() || '(未記入)';
  const category = body.get('category')?.toString().trim();
  const message = body.get('message')?.toString().trim();

  if (!name || !email || !category || !message) {
    return new Response(
      JSON.stringify({ error: '必須項目をすべて入力してください。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ error: 'メールアドレスの形式が正しくありません。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const categoryLabels: Record<string, string> = {
    collaboration: '協働・パートナーシップについて',
    project: 'プロジェクトへの参加（プロボノ等）',
    media: '取材・講演のご依頼',
    other: 'その他',
  };

  const htmlBody = `
<h2>nexs.or.jp お問い合わせ</h2>
<table>
  <tr><td><strong>お名前</strong></td><td>${escapeHtml(name)}</td></tr>
  <tr><td><strong>所属・組織名</strong></td><td>${escapeHtml(org)}</td></tr>
  <tr><td><strong>メールアドレス</strong></td><td>${escapeHtml(email)}</td></tr>
  <tr><td><strong>種別</strong></td><td>${escapeHtml(categoryLabels[category] || category)}</td></tr>
</table>
<h3>メッセージ</h3>
<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'nexs Contact <noreply@nexs.or.jp>',
        to: ['info@nexs.or.jp'],
        reply_to: email,
        subject: `[nexs お問い合わせ] ${categoryLabels[category] || category} - ${name}`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error('Resend API error:', res.status, errorData);
      return new Response(
        JSON.stringify({
          error: 'メール送信に失敗しました。しばらく後に再度お試しください。',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({
        error: 'メール送信に失敗しました。しばらく後に再度お試しください。',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
