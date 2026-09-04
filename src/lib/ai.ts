import type { Channel } from '../types';

/**
 * ─────────────────────────────────────────────────────────────
 *  AI DRAFT GENERATOR
 *
 *  Architecture (secure by design):
 *   1. The frontend POSTs the conversation context to the
 *      serverless endpoint `/api/generate-draft` (see
 *      `api/generate-draft.ts`). The LLM API key lives ONLY
 *      there, in a server-side env var — never in this bundle.
 *   2. If the endpoint is unavailable (local dev) or reports
 *      no key / an upstream error, we fall back to the built-in
 *      smart mock below, so the demo never breaks.
 *
 *  To enable real AI in production, set these env vars in the
 *  Vercel dashboard (Settings → Environment Variables):
 *    OPENAI_API_KEY (required), OPENAI_MODEL (optional),
 *    OPENAI_BASE_URL (optional, OpenAI-compatible endpoint).
 * ─────────────────────────────────────────────────────────────
 */

export type AIContext = {
  channel: Channel;
  contactName: string;
  typedText?: string;
  lastIncoming?: string;
  subject?: string;
};

const DRAFT_ENDPOINT = '/api/generate-draft';

// ── Mock knowledge base ──────────────────────────────────────

type Tone = 'email' | 'instagram' | 'whatsapp';

const greetings: Record<Tone, string> = {
  email: 'Hi {name},',
  instagram: 'Hey {name}! 👋',
  whatsapp: 'Hi {name},',
};

const signoffs: Record<Tone, string> = {
  email: 'Best regards,\nAcme Support Team',
  instagram: '— Acme India 💙',
  whatsapp: '— Acme Support',
};

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/(invoice|billing|charge|payment|refund|receipt|price|cost|paid)/.test(t)) return 'billing';
  if (/(pricing|plan|upgrade|downgrade|enterprise|pro plan|trial|discount|quote|subscription)/.test(t)) return 'sales';
  if (/(login|log in|password|access|403|forgot|account locked|admin access)/.test(t)) return 'account';
  if (/(api|webhook|rate limit|integration|sso|slack|zapier|endpoint|error|bug)/.test(t)) return 'technical';
  if (/(where is|status|track|order|delivery|shipped)/.test(t)) return 'shipping';
  if (/(referral|refer a friend|invite)/.test(t)) return 'referral';
  if (/(story|photo|instagram|follow)/.test(t)) return 'social';
  if (/(cancel|refund|unsubscribe|delete my account)/.test(t)) return 'retention';
  if (/(spec|feature|does it support|custom date|dashboard|analytics|report)/.test(t)) return 'feature';
  return 'general';
}

const intents: Record<string, { email: string[]; instagram: string[]; whatsapp: string[] }> = {
  billing: {
    email: [
      'Thank you for flagging this — I can absolutely help sort out the billing.',
      'I have pulled up the account and I can see the charges you mentioned. The duplicate entry has been flagged for an immediate refund (3–5 business days back to your original payment method).',
      'I am also attaching an updated invoice that reflects the correction, so you have it for your records.',
      'Is there anything else on the statement you would like me to walk through?',
    ],
    instagram: [
      'Totally understand! I checked your account and found the duplicate charge — the refund is already initiated 🎉',
      'It usually lands back within 3–5 business days.',
      'Want me to DM you the corrected invoice?',
    ],
    whatsapp: [
      'I checked your account — the extra charge was a processing error and I have initiated a refund ✅',
      'You will see it back within 3–5 business days.',
      'I can send the corrected invoice here on WhatsApp if you like.',
    ],
  },
  sales: {
    email: [
      'Thanks for your interest in Acme — happy to talk plans.',
      'Based on what you described, the Pro plan would fit best, and if you are evaluating for a team, Enterprise adds unlimited seats, custom SSO and a dedicated account manager.',
      'I have attached our pricing guide and a comparison sheet. Would a quick 15-minute call this week help you decide?',
    ],
    instagram: [
      'Great question! For your use case I would go with Pro 🙌',
      'I can send you the pricing guide + a 30-day trial link right here if you want.',
    ],
    whatsapp: [
      'Happy to help with plans! Pro fits most teams — Enterprise adds unlimited seats + SSO.',
      'Want me to send the pricing PDF here?',
    ],
  },
  account: {
    email: [
      'Sorry for the trouble logging in — let me get you back in.',
      'I have reset the access on your account. You should be able to sign in now; if you still see an error, please hard-refresh and clear the cache.',
      'Would you also like me to enable two-factor authentication while we are here?',
    ],
    instagram: [
      'Fixed it! Your access has been reset 🔓',
      'Try logging in again — should work now. Let me know if it still errors!',
    ],
    whatsapp: [
      'I have reset your access — you should be able to log in now 🔓',
      'If it still shows the error, try a hard refresh once.',
    ],
  },
  technical: {
    email: [
      'Thanks for the detailed report — I have escalated this to our engineering team.',
      'In the meantime, could you confirm the API key prefix and the exact endpoint you are hitting? That will help us isolate whether this is rate-limit or config related.',
      'We will keep this ticket updated as soon as we have findings.',
    ],
    instagram: [
      'Got your report — the team is on it 🛠️',
      'Could you tell me which endpoint is failing? That will speed things up a lot.',
    ],
    whatsapp: [
      'I have escalated this to engineering — they are investigating now 🛠️',
      'Quick one: which endpoint/endpoint key are you using?',
    ],
  },
  shipping: {
    email: [
      'I have checked on your order and can see the current status for you.',
      'Your package is on track and the latest scan shows it is with the courier partner — the tracking link below has live updates.',
      'If it has not arrived within the promised window, reply here and I will open an investigation right away.',
    ],
    instagram: [
      'Just checked your order — it is on its way and tracking is live 🚚',
      'I will DM you the link so you can follow it!',
    ],
    whatsapp: [
      'Your order is on track — the courier has it and it should reach you in the next 2 days 🚚',
      'Want me to share the live tracking link here?',
    ],
  },
  referral: {
    email: [
      'Love that you are spreading the word — and yes, we do have a referral program!',
      'For every friend who signs up with your link you both get one month free, and there is no cap on referrals.',
      'I have included your personal referral link below. Happy sharing!',
    ],
    instagram: [
      'Yes we do! You and your friend both get 1 month free 🎁',
      'Your personal referral link is on its way to your DMs.',
    ],
    whatsapp: [
      'Yes! Refer a friend and you BOTH get a free month 🎁',
      'Sending your personal link right now.',
    ],
  },
  social: {
    instagram: [
      'Thanks for reaching out! That photo was from our Goa offsite — the team had a blast 💙',
      'We post behind-the-scenes content like this every week, so stay tuned!',
    ],
    email: [],
    whatsapp: [],
  },
  retention: {
    email: [
      'Sorry to hear you are considering leaving — I would love the chance to make it right.',
      'Could you share what is not meeting your needs? If it is pricing, I can look at options; if it is product gaps, I can make sure your feedback reaches the roadmap team.',
      'Either way, I will make sure you are taken care of.',
    ],
    instagram: [
      'Sorry to hear that! 😔 Could you tell me what went wrong?',
      'If it is pricing I can probably find something that works — just let me know.',
    ],
    whatsapp: [
      'Sorry to hear that — I want to make this right 🙏',
      'Quick question: is it pricing, or something about the product itself?',
    ],
  },
  feature: {
    email: [
      'Great question — and yes, that is supported.',
      'The dashboard supports fully custom date ranges, plus weekly/monthly presets, and you can save your views for the team.',
      'I have linked a short video walkthrough below. Happy to set up a demo too if that is easier.',
    ],
    instagram: [
      'Yes it does! ✅ Custom date ranges + weekly/monthly presets.',
      'I can send a quick demo video if you want to see it in action.',
    ],
    whatsapp: [
      'Yes, fully supported — custom date ranges + saved views ✅',
      'Want me to send a 1-minute demo video?',
    ],
  },
  general: {
    email: [
      'Thank you for reaching out to Acme Support.',
      'I have looked into your note and want to make sure we address it fully. Could you share a couple more details so I can give you a precise answer?',
      'In the meantime, I have included the most relevant resources below.',
    ],
    instagram: [
      'Thanks for the message! 😊 Happy to help.',
      'Can you tell me a little more about what you need?',
    ],
    whatsapp: [
      'Thanks for reaching out! Happy to help.',
      'Can you share a little more detail on what you need?',
    ],
  },
};

// ── Public API ───────────────────────────────────────────────

export async function generateAIDraft(ctx: AIContext): Promise<string> {
  const tone = ctx.channel === 'email' ? 'email' : ctx.channel; // email | instagram | whatsapp
  const instruction = (ctx.typedText || '').trim();
  const intent = detectIntent(instruction || ctx.lastIncoming || '');

  // 1) Try the serverless endpoint (production). Any failure —
  //    404 in local dev, no key configured, upstream error —
  //    falls through to the smart mock below.
  const serverDraft = await callServerDraft(ctx);
  if (serverDraft) return serverDraft;

  // ── Mock: assemble a plausible reply from the knowledge base ──
  await new Promise((r) => setTimeout(r, 450)); // simulated thinking
  const lines: string[] = [];
  lines.push(greetings[tone].replace('{name}', ctx.contactName.split(' ')[0]));
  if (ctx.contactName && !instruction && !ctx.lastIncoming) {
    // nothing typed and nothing to reply to — still give a starter
    lines.push(`I saw we have an open conversation — how can I help you today?`);
  }
  const body = (intents[intent][tone] || intents.general[tone]).join('\n\n');
  lines.push(body);
  lines.push(signoffs[tone]);
  return lines.join('\n\n');
}

/**
 * Calls the serverless draft endpoint. Returns the draft string,
 * or null when the endpoint is unreachable / reports no key.
 */
async function callServerDraft(ctx: AIContext): Promise<string | null> {
  try {
    const res = await fetch(DRAFT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: ctx }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; draft?: string };
    return data.ok && data.draft ? data.draft : null;
  } catch {
    return null;
  }
}
