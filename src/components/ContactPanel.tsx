import { useState } from 'react';
import { Mail, Phone, Camera, MessageSquare, Plus, X, Check, MoreVertical, Star } from 'lucide-react';
import type { Contact, Channel } from '../types';
import { Avatar } from './Avatar';

interface ContactPanelProps {
  contact: Contact;
  showToast: (msg: string) => void;
  onQuickCompose: (channel: Channel) => void;
}

function accountIcon(ch: Channel) {
  if (ch === 'email') return <Mail size={14} />;
  if (ch === 'instagram') return <Camera size={14} />;
  return <MessageSquare size={14} />;
}
function accountClass(ch: Channel) {
  return ch === 'email' ? 'email' : ch === 'instagram' ? 'insta' : 'wa';
}
function channelDisplay(ch: Channel) {
  return ch === 'email' ? 'Email' : ch === 'instagram' ? 'Instagram' : 'WhatsApp';
}

export function ContactPanel({ contact, showToast, onQuickCompose }: ContactPanelProps) {
  const [activeTab, setActiveTab] = useState<'contact' | 'activity'>('contact');

  // Notes / tags / accounts / tickets are local, demo-mutable state
  const [notes, setNotes] = useState<{ text: string; meta: string }[]>(
    contact.agentNote ? [{ text: contact.agentNote, meta: 'May 20 · Arjun Mehta' }] : [],
  );
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [tags, setTags] = useState<string[]>(contact.tags);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [accounts, setAccounts] = useState<Channel[]>(
    [contact.email ? 'email' : null, contact.instagramHandle ? 'instagram' : null, contact.phone ? 'whatsapp' : null].filter(Boolean) as Channel[],
  );
  const [accountMenu, setAccountMenu] = useState<Channel | null>(null);
  const [ticketsExpanded, setTicketsExpanded] = useState(false);

  const channels: { ch: Channel; value: string }[] = [
    contact.email ? { ch: 'email', value: contact.email } : null,
    contact.instagramHandle ? { ch: 'instagram', value: contact.instagramHandle } : null,
    contact.phone ? { ch: 'whatsapp', value: contact.phone } : null,
  ].filter(Boolean) as { ch: Channel; value: string }[];

  const activity = [
    { ch: 'whatsapp' as Channel, text: `${contact.name.split(' ')[0]} messaged you`, time: 'Just now' },
    { ch: 'email' as Channel, text: 'Your reply was delivered', time: '18m ago' },
    { ch: 'instagram' as Channel, text: `${contact.name.split(' ')[0]} replied to your story`, time: '1h ago' },
    { ch: 'whatsapp' as Channel, text: 'Attachment opened by customer', time: '3h ago' },
    { ch: 'email' as Channel, text: 'Status changed to Open', time: 'Yesterday' },
  ];

  const addNote = () => {
    const text = noteDraft.trim();
    if (!text) { showToast('Write something first'); return; }
    setNotes((n) => [...n, { text, meta: 'Just now · You' }]);
    setNoteDraft('');
    setNoteOpen(false);
    showToast('Note added');
  };

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) { showToast('Type a tag name'); return; }
    setTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setTagDraft('');
    setTagOpen(false);
    showToast(`Tag "${t}" added`);
  };

  const addAccount = () => {
    const missing: Channel[] = (['email', 'instagram', 'whatsapp'] as Channel[]).filter((c) => !accounts.includes(c));
    if (missing.length === 0) { showToast('All channels already connected'); return; }
    setAccounts((prev) => [...prev, missing[0]]);
    showToast(`Demo: ${channelDisplay(missing[0])} channel connected`);
  };

  return (
    <>
      {/* Tabs */}
      <div className="detail-tabs">
        {(['contact', 'activity'] as const).map((tab) => (
          <button key={tab} data-tip={tab === 'contact' ? 'Contact profile & linked channels' : 'Recent activity timeline'} onClick={() => { setActiveTab(tab); }} className={`detail-tab ${activeTab === tab ? 'active' : ''}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="detail-scroll">
        {/* Head */}
        <div className="detail-head">
          <Avatar name={contact.name} size={48} dot="online" />
          <div style={{ minWidth: 0 }}>
            <div className="detail-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</div>
            <span className="vip"><Star size={9} style={{ verticalAlign: '-1px', marginRight: '3px' }} />VIP Customer</span>
          </div>
        </div>

        {activeTab === 'activity' ? (
          /* ─── ACTIVITY TAB ─── */
          <>
            <section className="section">
              <div className="section-title"><span>RECENT ACTIVITY</span></div>
              {activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0,
                    background: a.ch === 'email' ? 'rgba(226,118,118,0.14)' : a.ch === 'instagram' ? 'rgba(212,137,177,0.16)' : 'rgba(101,211,148,0.14)',
                    color: a.ch === 'email' ? '#e27676' : a.ch === 'instagram' ? '#d489b1' : '#65d394',
                  }}>
                    {accountIcon(a.ch)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>{a.text}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{channelDisplay(a.ch)} · {a.time}</div>
                  </div>
                </div>
              ))}
            </section>
            <section className="section" style={{ borderBottom: 'none' }}>
              <div className="section-title"><span>QUICK ACTIONS</span></div>
              <div style={{ display: 'grid', gap: '6px' }}>
                <button data-tip="Start a new email to this customer" onClick={() => { onQuickCompose('email'); }} style={{ height: '34px', borderRadius: '8px', border: '1px solid var(--border-accent)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', justifyContent: 'center' }}>
                  <Mail size={12} style={{ color: '#e27676' }} /> Compose email
                </button>
                <button data-tip="Call this customer" onClick={() => showToast(`Calling ${contact.phone || '—'}… (demo)`)} style={{ height: '34px', borderRadius: '8px', border: '1px solid var(--border-accent)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', justifyContent: 'center' }}>
                  <Phone size={12} style={{ color: '#65d394' }} /> Call customer
                </button>
              </div>
            </section>
          </>
        ) : (
          /* ─── CONTACT TAB ─── */
          <>
            {/* Quick contact actions */}
            <div className="contact-actions">
              <button data-tip="Compose an email" onClick={() => onQuickCompose('email')} style={{ color: '#e27676' }}><Mail size={16} /></button>
              <button data-tip="Send a WhatsApp message" onClick={() => onQuickCompose('whatsapp')} style={{ color: '#65d394' }}><MessageSquare size={16} /></button>
              <button data-tip="Reply on Instagram" onClick={() => onQuickCompose('instagram')} style={{ color: '#d489b1' }}><Camera size={16} /></button>
              <button data-tip="More contact options" onClick={() => showToast('Contact options opened')}><MoreVertical size={16} /></button>
            </div>

            {/* About */}
            <section className="section">
              <div className="section-title"><span>ABOUT</span></div>
              <div className="stats">
                <span>Customer since</span><span>{contact.customerSince}</span>
                <span>Total conversations</span><span>{contact.tags.includes('VIP') ? 8 : 3 + (contact.name.length % 5)}</span>
                <span>Last activity</span><span>Just now</span>
                <span>Priority</span><span className="high">{contact.priority === 'high' ? 'High' : 'Normal'}</span>
              </div>
            </section>

            {/* Connected accounts */}
            <section className="section">
              <div className="section-title">
                <span>CONNECTED ACCOUNTS</span>
                <span className="link" data-tip="Connect another channel (demo)" onClick={addAccount}>＋ Add</span>
              </div>
              {channels.filter((c) => accounts.includes(c.ch)).map(({ ch, value }) => (
                <div key={ch} className="account">
                  <div className={`account-icon ${accountClass(ch)}`}>{accountIcon(ch)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="account-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                    <div className="account-type">{channelDisplay(ch)}</div>
                  </div>
                  <span className="ok" data-tip="Connected"><Check size={13} /></span>
                  <span style={{ position: 'relative' }}>
                    <button data-tip="Account options" onClick={() => setAccountMenu(accountMenu === ch ? null : ch)} className="account-more" style={{ display: 'flex', padding: '4px' }}><MoreVertical size={13} /></button>
                    {accountMenu === ch && (
                      <div style={{
                        position: 'absolute', right: 0, top: 24, width: 150, zIndex: 60, borderRadius: '8px',
                        border: '1px solid var(--border-accent)', background: 'var(--surface)',
                        boxShadow: '0 10px 28px rgba(0,0,0,0.35)', overflow: 'hidden',
                      }}>
                        <div onClick={() => { showToast(`${channelDisplay(ch)} set as primary`); setAccountMenu(null); }} style={{ padding: '8px 11px', fontSize: '11px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >Set as primary</div>
                        <div onClick={() => { setAccounts((prev) => prev.filter((a) => a !== ch)); setAccountMenu(null); showToast(`${channelDisplay(ch)} disconnected (demo)`); }} style={{ padding: '8px 11px', fontSize: '11px', cursor: 'pointer', color: '#df7777' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >Disconnect</div>
                      </div>
                    )}
                  </span>
                </div>
              ))}
            </section>

            {/* Notes */}
            <section className="section">
              <div className="section-title">
                <span>NOTES</span>
                <span className="link" data-tip="Write an internal note" onClick={() => setNoteOpen(!noteOpen)}>{noteOpen ? <X size={11} /> : '＋ Add note'}</span>
              </div>
              {notes.map((n, i) => (
                <div key={i} className="note" style={{ marginBottom: '7px' }}>
                  {n.text}
                  <div className="note-meta">{n.meta}</div>
                </div>
              ))}
              {notes.length === 0 && !noteOpen && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No notes yet.</div>
              )}
              {noteOpen && (
                <div style={{ animation: 'fabSlideUp 0.14s ease-out' }}>
                  <textarea
                    autoFocus
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder={`Note about ${contact.name.split(' ')[0]}…`}
                    rows={2}
                    style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: '52px', borderRadius: '7px', border: '1px solid var(--border-accent)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '11px', padding: '8px', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button data-tip="Save this note" onClick={addNote} style={{ height: '27px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--navy-border)', background: 'var(--navy-bg)', color: 'var(--text-primary)', fontSize: '10.5px', fontWeight: 600, cursor: 'pointer' }}>Save note</button>
                    <button data-tip="Discard" onClick={() => { setNoteOpen(false); setNoteDraft(''); }} style={{ height: '27px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-accent)', background: 'transparent', color: 'var(--text-muted)', fontSize: '10.5px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
            </section>

            {/* Tags */}
            <section className="section">
              <div className="section-title">
                <span>TAGS</span>
                <span className="link" data-tip="Add a tag" onClick={() => setTagOpen(!tagOpen)}>{tagOpen ? <X size={11} /> : '＋ Add tag'}</span>
              </div>
              <div className="tags">
                {tags.map((tag) => (
                  <span key={tag} className="tag" data-tip={`Remove "${tag}" tag`} style={{ cursor: 'pointer' }}
                    onClick={() => { setTags((prev) => prev.filter((t) => t !== tag)); showToast(`Tag "${tag}" removed`); }}
                  >{tag} ✕</span>
                ))}
              </div>
              {tags.length === 0 && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No tags yet.</div>}
              {tagOpen && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', animation: 'fabSlideUp 0.14s ease-out' }}>
                  <input
                    autoFocus value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTag(); }}
                    placeholder="e.g. Enterprise, Refund…"
                    style={{ flex: 1, height: '30px', borderRadius: '7px', border: '1px solid var(--border-accent)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '11px', padding: '0 9px', outline: 'none' }}
                  />
                  <button data-tip="Add tag" onClick={addTag} style={{ height: '30px', width: '30px', borderRadius: '7px', border: '1px solid var(--navy-border)', background: 'var(--navy-bg)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
                </div>
              )}
            </section>

            {/* Tickets */}
            <section className="section" style={{ borderBottom: 'none' }}>
              <div className="section-title">
                <span>PREVIOUS TICKETS</span>
                <span className="link" data-tip="Show all tickets" onClick={() => { setTicketsExpanded(!ticketsExpanded); showToast(ticketsExpanded ? 'Collapsed ticket list' : 'Showing all tickets'); }}>{ticketsExpanded ? 'Collapse ⌃' : 'View all ⌃'}</span>
              </div>
              <div className="ticket">
                <div className="ticket-top"><span>#TK-2456</span><span className="resolved">Resolved</span></div>
                <div className="ticket-title">Payment failed during checkout</div>
                <div className="ticket-date">Apr 30, 2024</div>
              </div>
              {ticketsExpanded && (
                <>
                  <div className="ticket" style={{ marginTop: '8px' }}>
                    <div className="ticket-top"><span>#TK-2384</span><span className="resolved">Resolved</span></div>
                    <div className="ticket-title">Plan downgrade request</div>
                    <div className="ticket-date">Dec 12, 2023</div>
                  </div>
                  <div className="ticket" style={{ marginTop: '8px' }}>
                    <div className="ticket-top"><span>#TK-2210</span><span style={{ color: '#e0a45a' }}>Waiting</span></div>
                    <div className="ticket-title">Refund not received on card</div>
                    <div className="ticket-date">Nov 2, 2023</div>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
