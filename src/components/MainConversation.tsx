import { useState, useRef, useEffect, useMemo } from 'react';
import {
  MoreHorizontal, Clock, Check, Mail, Camera, MessageSquare, Pencil, X, Reply,
  Sparkles, Send, Copy, Flag, VolumeX, Volume2,
} from 'lucide-react';
import type { Contact, Conversation, Message, ConnectedAccount, Channel } from '../types';
import { generateAIDraft } from '../lib/ai';
import { Avatar } from './Avatar';

interface MainConversationProps {
  contact: Contact;
  conversation: Conversation;
  messages: Message[];
  showToast: (msg: string) => void;
  onStatusChange: (status: string) => void;
  activeAccountId: string;
  accounts: ConnectedAccount[];
  composeRequest?: { id: number; channel: Channel };
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';
  return that.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

const channelColors: Record<Channel, string> = { email: '#e27676', instagram: '#d489b1', whatsapp: '#65d394' };
const channelBg: Record<Channel, string> = { email: 'rgba(226,118,118,0.14)', instagram: 'rgba(212,137,177,0.16)', whatsapp: 'rgba(101,211,148,0.14)' };
const channelNames: Record<Channel, string> = { email: 'Email', instagram: 'Instagram', whatsapp: 'WhatsApp' };
const channelIcons: Record<Channel, typeof Mail> = { email: Mail, instagram: Camera, whatsapp: MessageSquare };

export function MainConversation({
  contact, conversation, messages, showToast, onStatusChange,
  activeAccountId, accounts, composeRequest,
}: MainConversationProps) {
  const [activeChannel, setActiveChannel] = useState<'all' | Channel>('all');
  const [status, setStatus] = useState(conversation.status);
  const [thread, setThread] = useState<Message[]>(messages);

  // FAB
  const [fabOpen, setFabOpen] = useState(false);
  const [fabChannel, setFabChannel] = useState<Channel>('email');
  const [fabAccountId, setFabAccountId] = useState(activeAccountId);
  const [fabText, setFabText] = useState('');
  const fabEditorRef = useRef<HTMLDivElement>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Inline reply
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replySenderId, setReplySenderId] = useState(activeAccountId);
  const replyEditorRef = useRef<HTMLDivElement>(null);

  // Header menus
  const [moreOpen, setMoreOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [assignee, setAssignee] = useState<string | undefined>(conversation.assignedTo === 'You' ? 'You (Arjun Mehta)' : conversation.assignedTo);
  const [muted, setMuted] = useState(false);
  const [snoozed, setSnoozed] = useState<string | null>(null);
  // Per-message ⋮ menu
  const [msgMenuFor, setMsgMenuFor] = useState<string | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const snoozeRef = useRef<HTMLDivElement>(null);
  const msgMenuRef = useRef<HTMLDivElement>(null);

  // ── Derived ────────────────────────────────────────────────
  const filteredMessages = useMemo(
    () => activeChannel === 'all' ? thread : thread.filter((m) => m.channel === activeChannel),
    [thread, activeChannel],
  );

  const channelAccounts = useMemo(
    () => accounts.filter((a) => a.channel === fabChannel && a.status === 'connected'),
    [accounts, fabChannel],
  );
  const fabAccount = channelAccounts.find((a) => a.id === fabAccountId) || channelAccounts[0];
  useEffect(() => {
    if (!channelAccounts.some((a) => a.id === fabAccountId)) setFabAccountId(channelAccounts[0]?.id || activeAccountId);
  }, [channelAccounts, fabAccountId, activeAccountId]);

  const replyChannel = replyingTo ? thread.find((m) => m.id === replyingTo)?.channel : null;
  const replyAccounts = useMemo(
    () => replyChannel ? accounts.filter((a) => a.channel === replyChannel && a.status === 'connected') : [],
    [accounts, replyChannel],
  );
  const replyAccount = replyAccounts.find((a) => a.id === replySenderId) || replyAccounts[0];

  const lastIncoming = useMemo(
    () => [...thread].reverse().find((m) => m.direction === 'incoming'),
    [thread],
  );

  // Auto-scroll to newest message
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [filteredMessages.length, activeChannel, replyingTo]);

  // Focus editors
  useEffect(() => {
    if (replyingTo && replyEditorRef.current) setTimeout(() => replyEditorRef.current?.focus(), 80);
  }, [replyingTo]);
  useEffect(() => {
    if (fabOpen && fabEditorRef.current) setTimeout(() => fabEditorRef.current?.focus(), 80);
  }, [fabOpen]);

  // Contact-panel quick compose → open FAB on the requested channel
  useEffect(() => {
    if (composeRequest) {
      setFabChannel(composeRequest.channel);
      setFabOpen(true);
      setActiveChannel('all');
    }
  }, [composeRequest]);

  // Click-away for open menus
  useEffect(() => {
    if (!moreOpen && !snoozeOpen && !msgMenuFor) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!moreRef.current?.contains(t) && !t.closest('[data-more-btn]')) setMoreOpen(false);
      if (!snoozeRef.current?.contains(t) && !t.closest('[data-snooze-btn]')) setSnoozeOpen(false);
      if (!msgMenuRef.current?.contains(t) && !t.closest('[data-msg-menu-btn]')) setMsgMenuFor(null);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [moreOpen, snoozeOpen, msgMenuFor]);

  // ── Actions ────────────────────────────────────────────────
  const appendOutgoing = (channel: Channel, body: string, viaAccount: ConnectedAccount | undefined) => {
    const id = `local-${Date.now()}`;
    const newMsg: Message = {
      id, conversationId: conversation.id, channel, direction: 'outgoing',
      senderName: 'You', senderIdentifier: viaAccount?.identifier || contact.email || 'You',
      recipientIdentifier: contact.email || contact.phone || contact.instagramHandle,
      connectedAccountId: viaAccount?.id || 'acc-email-support',
      timestamp: new Date().toISOString(),
      body, status: 'sent',
    };
    setThread((prev) => [...prev, newMsg]);
    // Simulate delivery ticks for realism
    setTimeout(() => {
      setThread((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m)));
    }, 900);
    return id;
  };

  const handleResolve = () => {
    const s = status === 'resolved' ? 'open' : 'resolved';
    setStatus(s);
    onStatusChange(s);
    showToast(s === 'resolved' ? '✓ Conversation resolved' : 'Conversation reopened');
  };

  const handleSendReply = () => {
    if (!replyText()) { showToast('Write a message first'); return; }
    const ch = replyChannel || 'email';
    appendOutgoing(ch, replyText()!, replyAccount);
    showToast(`${channelNames[ch]} reply sent to ${contact.name}`);
    setReplyTextValue('');
    if (replyEditorRef.current) replyEditorRef.current.textContent = '';
    setReplyingTo(null);
  };

  const handleSendFab = () => {
    if (!fabText.trim()) { showToast('Write a message first'); return; }
    appendOutgoing(fabChannel, fabText.trim(), fabAccount);
    showToast(`${channelNames[fabChannel]} sent to ${contact.name}`);
    setFabText('');
    setAiGenerated(false);
    setFabOpen(false);
    if (fabEditorRef.current) fabEditorRef.current.textContent = '';
  };

  const replyText = () => replyEditorRef.current?.innerText || '';
  const setReplyTextValue = (v: string) => { if (replyEditorRef.current) replyEditorRef.current.innerText = v; };

  // ✨ AI Write — FAB
  const runAI = async () => {
    if (aiBusy) return;
    setAiBusy(true);
    const draft = await generateAIDraft({
      channel: fabChannel,
      contactName: contact.name,
      typedText: fabText.trim(),
      lastIncoming: lastIncoming?.body,
      subject: (lastIncoming?.metadata as any)?.subject,
    });
    const el = fabEditorRef.current;
    if (!el) { setAiBusy(false); return; }
    el.textContent = '';
    el.dataset.placeholder = '';
    // Typewriter effect
    const step = draft.length > 260 ? 7 : 3;
    let i = 0;
    await new Promise<void>((resolve) => {
      const iv = window.setInterval(() => {
        i = Math.min(draft.length, i + step);
        el!.innerText = draft.slice(0, i);
        setFabText(draft.slice(0, i));
        if (i >= draft.length) { window.clearInterval(iv); resolve(); }
      }, 14);
    });
    setAiGenerated(true);
    setAiBusy(false);
    showToast('✨ AI draft ready — review and send');
  };

  const channelCounts = {
    all: thread.length,
    email: thread.filter((m) => m.channel === 'email').length,
    instagram: thread.filter((m) => m.channel === 'instagram').length,
    whatsapp: thread.filter((m) => m.channel === 'whatsapp').length,
  };

  const tabs: { key: 'all' | Channel; label: string; icon: typeof Mail | null }[] = [
    { key: 'all', label: 'All', icon: null },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'instagram', label: 'Instagram', icon: Camera },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  ];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, background: 'var(--main-bg)' }}>

      {/* ═══ HEADER ═══ */}
      <header style={{ borderBottom: '1px solid var(--border-accent)', flexShrink: 0, background: 'var(--main-bg)', position: 'relative' }}>
        {/* Row 1: avatar · name/status · actions */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px 0', gap: '12px' }}>
          <Avatar name={contact.name} size={44} dot="online" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{contact.name}</span>
              <span data-tip="VIP customer" style={{ color: '#e1a64d', fontSize: '13px', cursor: 'default' }}>★</span>
              {snoozed && (
                <button data-tip={`Click to unsnooze`} onClick={() => { setSnoozed(null); showToast('Conversation unsnoozed'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '20px', padding: '0 7px', borderRadius: '5px', border: '1px solid #6b5a2e', background: '#3a3223', color: '#e0a45a', fontSize: '9.5px', fontWeight: 600, cursor: 'pointer' }}>
                  <Clock size={9} /> Snoozed · {snoozed}
                </button>
              )}
              {muted && <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>🔕 Muted</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              <button data-tip={status === 'resolved' ? 'Status: resolved — click to reopen' : 'Status: open — click to resolve'} onClick={handleResolve} style={{
                height: '20px', padding: '0 7px', borderRadius: '5px',
                border: `1px solid ${status === 'resolved' ? '#4b5550' : '#386249'}`,
                background: status === 'resolved' ? '#29302d' : '#22382b',
                color: status === 'resolved' ? '#a8cbb4' : '#73d698',
                fontSize: '9.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />
                {status === 'resolved' ? 'Resolved' : 'Open'}
              </button>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {thread.length} messages · {conversation.channels.length} channels
                {assignee ? ` · Assigned: ${assignee}` : ''}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0, position: 'relative' }}>
            {/* More */}
            <div ref={moreRef}>
              <button data-more-btn data-tip="More actions — assign, mute, transcript" onClick={() => { setMoreOpen(!moreOpen); setSnoozeOpen(false); }} style={{
                width: '32px', height: '32px', borderRadius: '7px',
                border: '1px solid var(--border-accent)', background: 'var(--filter-bg)',
                color: 'var(--text-muted)', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: '0.12s',
              }}>
                <MoreHorizontal size={15} />
              </button>
              {moreOpen && (
                <div style={{
                  position: 'absolute', right: 130, top: 40, width: 190, borderRadius: '9px',
                  border: '1px solid var(--border-accent)', background: 'var(--surface)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.35)', overflow: 'hidden', zIndex: 80,
                  animation: 'fabSlideUp 0.12s ease-out',
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, padding: '8px 12px 4px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assign to</div>
                  {['Arjun Mehta', 'Meera Shah', 'Priya Nair'].map((a) => (
                    <div key={a} onClick={() => { setAssignee(a); setMoreOpen(false); showToast(`Assigned to ${a}`); }} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '11.5px',
                      color: assignee === a ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: assignee === a ? 700 : 500,
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Avatar name={a} size={20} />
                      <span style={{ flex: 1 }}>{a}</span>
                      {assignee === a && <Check size={12} style={{ color: '#63d595' }} />}
                    </div>
                  ))}
                  <div style={{ height: '1px', background: 'var(--line-soft)', margin: '4px 0' }} />
                  <div onClick={() => { setMuted(!muted); setMoreOpen(false); showToast(muted ? 'Unmuted' : '🔕 Conversation muted'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >{muted ? <Volume2 size={13} /> : <VolumeX size={13} />} {muted ? 'Unmute' : 'Mute'}</div>
                  <div onClick={() => { setMoreOpen(false); showToast('Transcript emailed to you'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  ><Mail size={13} /> Email transcript</div>
                </div>
              )}
            </div>

            {/* Snooze */}
            <div ref={snoozeRef}>
              <button data-snooze-btn data-tip="Snooze — bring this back later" onClick={() => { setSnoozeOpen(!snoozeOpen); setMoreOpen(false); }} style={{
                width: '32px', height: '32px', borderRadius: '7px',
                border: '1px solid var(--border-accent)', background: 'var(--filter-bg)',
                color: 'var(--text-muted)', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: '0.12s',
              }}>
                <Clock size={15} />
              </button>
              {snoozeOpen && (
                <div style={{
                  position: 'absolute', right: 96, top: 40, width: 160, borderRadius: '9px',
                  border: '1px solid var(--border-accent)', background: 'var(--surface)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.35)', overflow: 'hidden', zIndex: 80,
                  animation: 'fabSlideUp 0.12s ease-out',
                }}>
                  {(['1 hour', 'Later today', 'Tomorrow', 'Next week']).map((s) => (
                    <div key={s} onClick={() => { setSnoozed(s); setSnoozeOpen(false); showToast(`Snoozed for ${s.toLowerCase()}`); }} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '11.5px', color: snoozed === s ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: snoozed === s ? 700 : 500 }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >{s}</div>
                  ))}
                  {snoozed && <div onClick={() => { setSnoozed(null); setSnoozeOpen(false); showToast('Unsnoozed'); }} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '11.5px', color: '#df7777' }}>Unsnooze</div>}
                </div>
              )}
            </div>

            <button data-tip={status === 'resolved' ? 'Reopen this conversation' : 'Mark as resolved'} onClick={handleResolve} style={{
              height: '32px', padding: '0 12px', borderRadius: '7px',
              border: `1px solid ${status === 'resolved' ? '#386249' : 'var(--border-accent)'}`,
              background: status === 'resolved' ? '#22382b' : 'var(--filter-bg)',
              color: status === 'resolved' ? '#73d698' : 'var(--text-secondary)',
              fontSize: '10.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px',
              cursor: 'pointer', transition: '0.12s',
            }}>
              <Check size={12} /> {status === 'resolved' ? 'Reopen' : 'Resolve'}
            </button>
          </div>
        </div>

        {/* Row 2: contact chips */}
        <div style={{ display: 'flex', gap: '5px', padding: '8px 20px 0 76px', flexWrap: 'wrap' }}>
          {contact.email && <span data-tip={`Email — ${contact.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 7px', borderRadius: '5px', background: 'var(--surface-2)', border: '1px solid var(--line-soft)', fontSize: '10.5px', color: 'var(--text-secondary)' }}><Mail size={10} style={{ color: channelColors.email }} /> {contact.email}</span>}
          {contact.phone && <span data-tip={`WhatsApp — ${contact.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 7px', borderRadius: '5px', background: 'var(--surface-2)', border: '1px solid var(--line-soft)', fontSize: '10.5px', color: 'var(--text-secondary)' }}><MessageSquare size={10} style={{ color: channelColors.whatsapp }} /> {contact.phone}</span>}
          {contact.instagramHandle && <span data-tip={`Instagram — ${contact.instagramHandle}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 7px', borderRadius: '5px', background: 'var(--surface-2)', border: '1px solid var(--line-soft)', fontSize: '10.5px', color: 'var(--text-secondary)' }}><Camera size={10} style={{ color: channelColors.instagram }} /> {contact.instagramHandle}</span>}
        </div>

        {/* Row 3: channel tabs */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px 0', gap: '2px' }}>
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeChannel === key;
            const count = channelCounts[key];
            return (
              <button key={key} data-tip={`${label} messages — ${count} total`} onClick={() => setActiveChannel(key)} style={{
                position: 'relative', height: '34px', padding: '0 12px', border: 'none',
                background: active ? 'var(--surface-2)' : 'none',
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '11.5px', fontWeight: active ? 700 : 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px 6px 0 0', transition: '0.1s',
              }}>
                {Icon && <Icon size={11} style={{ color: key !== 'all' ? channelColors[key as Channel] : 'inherit' }} />}
                {label}
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '6px', background: active ? 'var(--navy-bg)' : 'var(--surface-3)', color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{count}</span>
                {active && <div style={{ position: 'absolute', bottom: 0, left: '10px', right: '10px', height: '2px', background: 'var(--border-hover)', borderRadius: '2px 2px 0 0' }} />}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button data-tip="Write an internal note about this customer" onClick={() => showToast('Note composer opened')} style={{
            height: '26px', padding: '0 8px', borderRadius: '5px', border: '1px solid var(--border-accent)',
            background: 'transparent', color: 'var(--border-hover)', fontSize: '10px', fontWeight: 600,
            cursor: 'pointer', marginBottom: '4px', transition: '0.12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.background = 'transparent'; }}
          >+ Add note</button>
        </div>
      </header>

      {/* Edge banner */}
      {conversation.needsAttention === 'reply_unavailable' && (
        <div className="edge show">WhatsApp replies are currently unavailable for this conversation. Use another channel or resolve the block.</div>
      )}

      {/* ═══ TIMELINE ═══ */}
      <section ref={timelineRef} className="timeline" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {filteredMessages.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={26} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontSize: '13px', fontWeight: 600 }}>No {activeChannel !== 'all' ? channelNames[activeChannel].toLowerCase() + ' ' : ''}messages yet</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Use the compose button below to start the conversation.</div>
          </div>
        )}

        {filteredMessages.map((msg, idx) => {
          const Icon = channelIcons[msg.channel];
          const isReplying = replyingTo === msg.id;
          const showDay = idx === 0 || dayLabel(msg.timestamp) !== dayLabel(filteredMessages[idx - 1].timestamp);
          const menuOpen = msgMenuFor === msg.id;

          return (
            <div key={msg.id}>
              {showDay && <div className="day">{dayLabel(msg.timestamp)}</div>}
              <article className="message" data-channel={msg.channel} style={{ position: 'relative' }}>
                {/* Message top */}
                <div className="message-top">
                  <span data-tip={channelNames[msg.channel]} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: channelBg[msg.channel], flexShrink: 0 }}>
                    <Icon size={11} style={{ color: channelColors[msg.channel] }} />
                  </span>
                  <span className="message-channel" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{channelNames[msg.channel]}</span>
                  <span style={{ color: 'var(--line)' }}>·</span>
                  <span data-tip={msg.direction === 'incoming' ? `${contact.name} (customer)` : `${msg.senderIdentifier} (you)`} style={{ fontWeight: msg.direction === 'outgoing' ? 600 : 400 }}>{msg.senderIdentifier || msg.senderName}</span>
                  <span className="message-time" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {formatTime(msg.timestamp)}
                    <span style={{ position: 'relative' }}>
                      <button data-msg-menu-btn data-tip="Message options" onClick={() => { setMsgMenuFor(menuOpen ? null : msg.id); }} className="more" style={{ display: 'flex', padding: '3px', marginLeft: '2px' }}>
                        <MoreHorizontal size={12} />
                      </button>
                      {menuOpen && (
                        <div ref={msgMenuRef} style={{
                          position: 'absolute', right: 0, top: 18, width: 170, borderRadius: '9px',
                          border: '1px solid var(--border-accent)', background: 'var(--surface)',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.35)', overflow: 'hidden', zIndex: 60,
                          animation: 'fabSlideUp 0.1s ease-out',
                        }}>
                          {[
                            { icon: Copy, label: 'Copy text', act: () => showToast('Message copied to clipboard') },
                            { icon: Reply, label: 'Reply', act: () => { setReplyingTo(msg.id); setMsgMenuFor(null); } },
                            { icon: Flag, label: 'Flag for review', act: () => showToast('Flagged for team review') },
                            { icon: VolumeX, label: 'Mark as spam', act: () => showToast('Reported as spam') },
                          ].map(({ icon: MI, label, act }) => (
                            <div key={label} onClick={() => { act(); setMsgMenuFor(null); }} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 12px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text-secondary)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                            ><MI size={12} /> {label}</div>
                          ))}
                        </div>
                      )}
                    </span>
                  </span>
                </div>

                {/* Email subject / story label */}
                {msg.channel === 'email' && msg.metadata && 'subject' in msg.metadata && (
                  <div className="message-subject">{(msg.metadata as any).subject}</div>
                )}
                {msg.channel === 'instagram' && msg.metadata && 'storyReply' in msg.metadata && (msg.metadata as any).storyReply && (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: channelColors.instagram, marginTop: '3px' }}>Story reply</div>
                )}

                <div className="message-body" style={{ whiteSpace: 'pre-line' }}>{msg.body}</div>

                {msg.attachments?.map((att) => (
                  <div key={att.id} className="attachment" data-tip={`Download ${att.name}`}>
                    <div className="file">▧</div>
                    <div>
                      <div className="file-name">{att.name}</div>
                      <div className="file-meta">{att.type.toUpperCase()} · {att.size}</div>
                    </div>
                    <span style={{ marginLeft: '14px' }}>↓</span>
                  </div>
                ))}

                {/* Delivery + reply */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '7px' }}>
                  <div style={{ flex: 1 }}>
                    {msg.direction === 'outgoing' && msg.status && (
                      <div className="delivery" data-tip={msg.status === 'sent' ? 'Sent' : 'Delivered & read'} style={{ textAlign: 'right' }}>
                        {msg.status === 'failed'
                          ? <><span style={{ color: '#df7777' }}>● Failed</span><button className="retry" data-tip="Retry sending" onClick={() => showToast('Message queued for retry')}> · Retry</button></>
                          : (msg.status === 'sent' ? '✓' : '✓✓')}
                      </div>
                    )}
                  </div>
                  {msg.direction === 'incoming' && (
                    <button
                      data-tip={isReplying ? 'Cancel reply' : `Reply on ${channelNames[msg.channel]}`}
                      onClick={() => {
                        if (isReplying) { setReplyingTo(null); setReplyTextValue(''); }
                        else { setReplyingTo(msg.id); setReplyTextValue(''); setMsgMenuFor(null); }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: '6px',
                        border: `1px solid ${isReplying ? channelColors[msg.channel] : 'var(--border-accent)'}`,
                        background: isReplying ? channelBg[msg.channel] : 'transparent',
                        color: isReplying ? channelColors[msg.channel] : 'var(--text-muted)',
                        fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: '0.12s', marginLeft: 'auto',
                      }}
                      onMouseEnter={e => { if (!isReplying) { e.currentTarget.style.borderColor = channelColors[msg.channel]; e.currentTarget.style.color = channelColors[msg.channel]; } }}
                      onMouseLeave={e => { if (!isReplying) { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                    >
                      <Reply size={11} /> {isReplying ? 'Cancel' : 'Reply'}
                    </button>
                  )}
                </div>

                {/* ═══ INLINE REPLY ═══ */}
                {isReplying && (
                  <div style={{
                    marginTop: '9px', padding: '10px', borderRadius: '9px',
                    border: `1px solid ${channelColors[msg.channel]}55`,
                    background: 'var(--surface-2)', animation: 'fabSlideUp 0.15s ease-out',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '4px', background: channelBg[msg.channel], fontSize: '10px', fontWeight: 700, color: channelColors[msg.channel] }}>
                        <Icon size={10} /> {channelNames[msg.channel]}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Replying as {replyAccount?.identifier || '—'}</span>
                      <button data-tip="Close" onClick={() => { setReplyingTo(null); setReplyTextValue(''); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={13} /></button>
                    </div>
                    <div
                      ref={replyEditorRef}
                      contentEditable
                      data-placeholder={`Write a reply on ${channelNames[msg.channel]}...`}
                      style={{
                        minHeight: '42px', padding: '8px', fontSize: '11.5px', color: 'var(--text-primary)',
                        lineHeight: 1.5, outline: 0, borderRadius: '7px', border: '1px solid var(--border-accent)',
                        background: 'var(--input-bg)',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <select
                        className="identity"
                        data-tip="Which account replies"
                        value={replyAccount?.id}
                        onChange={(e) => { setReplySenderId(e.target.value); showToast('Reply as ' + e.target.value); }}
                        style={{ height: '26px', fontSize: '9.5px', padding: '0 6px' }}
                      >
                        {replyAccounts.map((a) => <option key={a.id} value={a.id}>{a.identifier}</option>)}
                      </select>
                      <button data-tip={`Send via ${channelNames[msg.channel]}`} onClick={handleSendReply} style={{
                        height: '29px', padding: '0 15px', borderRadius: '7px',
                        border: `1px solid ${channelColors[msg.channel]}`, background: channelColors[msg.channel],
                        color: '#fff', fontSize: '10px', fontWeight: 700, cursor: 'pointer', transition: '0.12s', display: 'flex', alignItems: 'center', gap: '5px',
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                      ><Send size={10} /> Send via {channelNames[msg.channel]}</button>
                    </div>
                  </div>
                )}
              </article>
            </div>
          );
        })}
      </section>

      {/* ═══ FAB ═══ */}
      <div className="fab">
        {fabOpen && (
          <div className="fab-popup" style={{ borderColor: 'var(--border-hover)', position: 'absolute', bottom: 68, right: 0, width: 440, maxHeight: '76vh' }}>
            {/* Head */}
            <div className="compose-head">
              <span className="reply-label">Reply via</span>
              {(['email', 'instagram', 'whatsapp'] as const).map((ch) => {
                const Icon = channelIcons[ch];
                return (
                  <button key={ch} data-tip={`Compose via ${channelNames[ch]}`} onClick={() => { setFabChannel(ch); setAiGenerated(false); }} className={`compose-tab ${fabChannel === ch ? 'active' : ''}`}>
                    <span style={{ marginRight: '3px', display: 'inline-flex', verticalAlign: 'middle' }}><Icon size={11} /></span>
                    {channelNames[ch]}
                  </button>
                );
              })}
              <button data-tip="Close composer" onClick={() => { setFabOpen(false); setFabText(''); setAiGenerated(false); }} style={{ marginLeft: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>

            {/* Email fields */}
            {fabChannel === 'email' && (
              <div className="fields" style={{ flexWrap: 'wrap' }}>
                <span>To: <b>{contact.email || '—'}</b></span>
                <span style={{ color: 'var(--text-muted)' }}>CC</span>
                <span>Subject: <b>{lastIncoming && 'subject' in (lastIncoming.metadata || {}) ? 'Re: ' + (lastIncoming.metadata as any).subject : 'Re: Conversation'}</b></span>
              </div>
            )}

            {/* Toolbar + AI */}
            <div className="toolbar" style={{ display: 'flex', alignItems: 'center' }}>
              <button className="tool" data-tip="Bold"><b>B</b></button>
              <button className="tool" data-tip="Italic"><i>I</i></button>
              <button className="tool" data-tip="Underline"><u>U</u></button>
              <button className="tool" data-tip="Insert list">☰</button>
              <button className="tool" data-tip="Insert emoji">☺</button>
              <div style={{ flex: 1 }} />
              <button
                data-tip={fabText.trim() ? '✨ Write this request as a polished draft' : '✨ Draft a reply from the conversation context'}
                onClick={runAI}
                disabled={aiBusy}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px', height: '28px', padding: '0 11px',
                  borderRadius: '7px', border: `1px solid ${aiBusy ? 'var(--line)' : '#7c68e8'}`,
                  background: aiBusy ? 'var(--surface-3)' : 'rgba(124,104,232,0.14)',
                  color: aiBusy ? 'var(--text-muted)' : '#a99cec', fontSize: '10.5px', fontWeight: 700,
                  cursor: aiBusy ? 'wait' : 'pointer', transition: '0.12s',
                }}
                onMouseEnter={(e) => { if (!aiBusy) { e.currentTarget.style.background = 'rgba(124,104,232,0.24)'; e.currentTarget.style.borderColor = '#7c68e8'; } }}
                onMouseLeave={(e) => { if (!aiBusy) { e.currentTarget.style.background = 'rgba(124,104,232,0.14)'; e.currentTarget.style.borderColor = '#7c68e8'; } }}
              >
                <Sparkles size={12} /> {aiBusy ? 'Writing…' : aiGenerated ? 'Rewrite' : 'AI Write'}
              </button>
            </div>

            {/* Editor */}
            <div
              ref={fabEditorRef}
              className="editor"
              contentEditable
              data-placeholder={`Write a ${channelNames[fabChannel].toLowerCase()} message — or hit ✨ AI Write…`}
              onInput={(e) => { setFabText((e.target as HTMLDivElement).innerText); setAiGenerated(false); }}
              style={{ minHeight: '110px', maxHeight: '260px', overflowY: 'auto' }}
            />

            {/* Bottom */}
            <div className="compose-bottom">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="tool" data-tip="Attach a file">▧</button>
                <button className="tool" data-tip="Insert link">↗</button>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
                <select
                  className="identity"
                  data-tip="Send from this account"
                  value={fabAccount?.id}
                  onChange={(e) => { setFabAccountId(e.target.value); showToast('Sending as ' + e.target.value); }}
                >
                  {channelAccounts.map((a) => <option key={a.id} value={a.id}>{a.identifier}</option>)}
                </select>
              </div>
              <button data-tip={`Send via ${channelNames[fabChannel]}`} onClick={handleSendFab} style={{
                height: '32px', padding: '0 16px', borderRadius: '7px',
                border: `1px solid ${channelColors[fabChannel]}`, background: channelColors[fabChannel],
                color: '#fff', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
              ><Send size={11} /> Send {channelNames[fabChannel]}</button>
            </div>
          </div>
        )}

        <button className="fab-trigger" data-tip={fabOpen ? 'Close composer' : 'Compose a reply — Email, Instagram or WhatsApp'} onClick={() => { setFabOpen(!fabOpen); if (!fabOpen) setAiGenerated(false); }} title="Compose reply">
          {fabOpen ? <X size={22} /> : <Pencil size={20} />}
        </button>
      </div>
    </div>
  );
}
