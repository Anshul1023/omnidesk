# OmniDesk — Omnichannel Inbox

A high-fidelity, desktop-first SaaS web prototype for an omnichannel customer support inbox. The core concept: **the contact is the primary entity, not the channel** — open Rahul once and see his Email, Instagram, and WhatsApp conversations in one coherent timeline.

Built with **React 19 + TypeScript + Vite + Tailwind CSS 4** (lucide-react icons). All data is demo/mock — no real integrations, no backend, no auth. It's a fully functional prototype with 95+ seeded contacts and every button wired to something testable.

## Features

- 🧑‍🤝‍🧑 **Unified contact timeline** — Email, Instagram & WhatsApp messages merged chronologically, with channel tabs to filter
- 📥 **Conversation list** — 95+ seeded contacts, search (⌘K), Unread / Needs-attention filters, advanced filters, sort (Newest/Oldest), paging
- 🧭 **Sidebar views** — Inbox, Mentions, All conversations, Unassigned, My open, Waiting on customer, Needs attention, Resolved, Snoozed, per-channel and per-team views — all filter the real data with live counts
- ✍️ **Floating composer (FAB)** — compose via Email / Instagram / WhatsApp with per-channel tone; inline "Reply" on any message sends through that message's own channel
- ✨ **AI Write** — drafts a context-aware reply (Gmail-style) with a live typing effect; powered by a serverless function so your API key never touches the browser
- 🌗 **Dark / light theme toggle**
- 🔔 **Hover tooltips on every control**, toast notifications, demo photos on avatars, mark-as-resolved, snooze, assign agents, notes & tags, connected accounts, tickets

## Run locally

```bash
npm install
npm run dev        # Vite dev server with HMR
# or
npm run build && node preview-serve.cjs   # serve the production build on :5173
```

## Deploy to Vercel

```bash
npm i -g vercel   # or: npx vercel
vercel --prod
```

The `api/generate-draft.ts` serverless function is picked up automatically. For real AI drafts, set these **server-side** environment variables in the Vercel dashboard (Project → Settings → Environment Variables) — never prefix them with `VITE_`, or they'll be embedded in the public bundle:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | for real AI | — | Without it, the app falls back to its built-in smart mock |
| `OPENAI_MODEL` | no | `gpt-4o-mini` | Any model name |
| `OPENAI_BASE_URL` | no | `https://api.openai.com/v1` | Any OpenAI-compatible endpoint (OpenRouter, Groq, …) |

## Project structure

```
src/
  data/seed.ts          # all demo data: contacts, conversations, messages, accounts
  components/           # Sidebar, ConversationList, MainConversation, ContactPanel, Avatar…
  lib/ai.ts             # AI draft: calls /api/generate-draft, falls back to smart mock
  hooks/                # useToast, useTooltip
api/generate-draft.ts   # Vercel serverless function (LLM call, key stays server-side)
vercel.json             # Vite framework config + function settings
```