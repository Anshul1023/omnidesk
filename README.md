<div align="center">

# 📬 OmniDesk — Omnichannel Inbox

**One contact. Every channel. One conversation.**

A high-fidelity, desktop-first SaaS prototype for a unified customer support inbox.
The contact is the primary entity — not the channel. Open *Rahul* once and see his
**Email**, **Instagram**, and **WhatsApp** conversations woven into a single coherent timeline.

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=fff)
![Vercel](https://img.shields.io/badge/Vercel_Deployed-000000?style=for-the-badge&logo=vercel&logoColor=fff)

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-omnidesk--phi.vercel.app-22c55e?style=for-the-badge&logo=vercel&logoColor=fff)](https://omnidesk-phi.vercel.app)
[![GitHub stars](https://img.shields.io/github/stars/Anshul1023/omnidesk?style=for-the-badge&logo=github&logoColor=fff&color=3b82f6)](https://github.com/Anshul1023/omnidesk/stargazers)

</div>

---

## ✨ Highlights

- 🧑‍🤝‍🧑 **Unified contact timeline** — Email, Instagram & WhatsApp messages merged chronologically; channel tabs filter the thread, inline *Reply* routes through the message's own channel
- 📥 **Conversation list** — 95+ seeded contacts, ⌘K search, Unread / Needs-attention chips, advanced filters, Newest/Oldest sort, paging
- 🧭 **Sidebar views that actually filter** — Inbox, Mentions, Unassigned, My open, Waiting on customer, Needs attention, Resolved, Snoozed + per-channel and per-team views, all with live counts
- ✍️ **Floating composer (FAB)** — compose via Email / Instagram / WhatsApp; per-channel tone and account identity
- ✨ **AI Write** — Gmail-style context-aware draft generation with a live typing effect; the API key lives in a serverless function, never in the browser
- 🌗 **Dark / light theme**, hover tooltips on every control, toast notifications, demo photos on avatars
- 🎛️ **Every button is real** — resolve/reopen, snooze, assign agents, notes & tags, connected accounts, tickets, activity feed — all backed by demo data

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Icons | lucide-react |
| AI drafts | Vercel serverless function (`api/generate-draft.ts`) → OpenAI-compatible API |
| Deploy | Vercel (static frontend + serverless function) |

## 🚀 Quick Start

```bash
npm install
npm run dev        # Vite dev server with HMR → http://localhost:5173
```

Production build:

```bash
npm run build
node preview-serve.cjs    # serves dist/ on :5173
```

> **Demo data** — everything is seeded in `src/data/seed.ts` (95+ contacts, hundreds of
> messages, accounts, teams). No backend, no database, no real integrations — by design.

## ☁️ Deploy to Vercel

```bash
npm i -g vercel   # or: npx vercel
vercel --prod
```

The `api/generate-draft.ts` serverless function is picked up automatically.

### AI environment variables (optional)

Set these in the Vercel dashboard → **Project → Settings → Environment Variables**.
Never prefix them with `VITE_` — Vite env vars are baked into the public bundle, and your key would be visible to anyone.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | for real AI | — | Without it, the app silently falls back to its built-in smart mock |
| `OPENAI_MODEL` | no | `gpt-4o-mini` | Any model name |
| `OPENAI_BASE_URL` | no | `https://api.openai.com/v1` | Any OpenAI-compatible endpoint (OpenRouter, Groq, Together, …) |

## 🔌 API

### `POST /api/generate-draft`

Generates a channel-appropriate reply draft.

```jsonc
// request body
{
  "context": {
    "channel": "email",            // "email" | "instagram" | "whatsapp"
    "contactName": "Rahul Sharma",
    "typedText": "send me the invoice",   // optional — your own instructions
    "lastIncoming": "…",            // optional — last customer message
    "subject": "Re: Subscription"   // optional
  }
}

// response (no API key configured)
{ "ok": false, "code": "NO_KEY" }

// response (success)
{ "ok": true, "draft": "Hi Rahul,\n\n…" }
```

## 📁 Project Structure

```
omnidesk/
├── api/
│   └── generate-draft.ts     # Vercel serverless function — secure LLM call
├── src/
│   ├── components/           # Sidebar, ConversationList, MainConversation, ContactPanel, Avatar…
│   ├── data/seed.ts          # all demo data (contacts, conversations, messages, accounts)
│   ├── hooks/                # useToast, useTooltip
│   ├── lib/ai.ts             # AI draft client (endpoint first, smart mock fallback)
│   └── types/                # shared TypeScript models
├── vercel.json               # Vite framework config
└── preview-serve.cjs         # tiny static server for local preview
```

## 📄 License

[MIT](LICENSE) © 2026 [Anshul Rawat](https://github.com/Anshul1023)