/**
 * Vercel serverless function — secure AI draft generation.
 *
 * The LLM API key lives ONLY on the server (process.env.OPENAI_API_KEY),
 * never in the client bundle. The frontend POSTs a conversation context
 * to /api/generate-draft and receives a finished draft back.
 *
 * Env vars to set in the Vercel dashboard (Settings → Environment Variables):
 *   OPENAI_API_KEY  — required for real AI; without it the app silently
 *                     falls back to the built-in smart mock
 *   OPENAI_MODEL    — optional, defaults to gpt-4o-mini
 *   OPENAI_BASE_URL — optional, any OpenAI-compatible endpoint
 */

type AIContext = {
  channel: 'email' | 'instagram' | 'whatsapp';
  contactName: string;
  typedText?: string;
  lastIncoming?: string;
  subject?: string;
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 });
  }

  let ctx: AIContext;
  try {
    const body = (await req.json()) as { context?: AIContext };
    ctx = body.context ?? ({} as AIContext);
  } catch {
    return Response.json({ ok: false, error: 'BAD_REQUEST' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // No key configured — frontend falls back to its built-in mock.
    return Response.json({ ok: false, code: 'NO_KEY' }, { status: 200 });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const channel = ctx.channel || 'email';

  const system =
    `You are a warm, concise customer-support agent at Acme (a SaaS company). ` +
    `Write a ${channel} reply to the customer ${ctx.contactName || 'the customer'}. ` +
    (channel === 'email'
      ? `Email → formal, with a greeting and a sign-off.`
      : `Instagram/WhatsApp → short and friendly, no sign-off needed.`) +
    (ctx.subject ? ` Email subject line: "${ctx.subject}".` : '');

  const user = (ctx.typedText || '').trim()
    ? `Draft the reply for this request: "${ctx.typedText}".`
    : `Draft a reply to their last message: "${ctx.lastIncoming || ''}".`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return Response.json(
        { ok: false, code: 'UPSTREAM_ERROR', detail: detail.slice(0, 300) },
        { status: 200 }
      );
    }

    const data = await res.json();
    const draft = (data.choices?.[0]?.message?.content as string) || '';
    return Response.json({ ok: true, draft });
  } catch (err) {
    return Response.json(
      { ok: false, code: 'UPSTREAM_ERROR', detail: String(err) },
      { status: 200 }
    );
  }
}