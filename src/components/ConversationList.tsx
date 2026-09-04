import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Plus, Filter } from 'lucide-react';
import type { Contact, Conversation } from '../types';
import { Avatar } from './Avatar';

interface ConversationListProps {
  contacts: Contact[];
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (contactId: string) => void;
  showToast: (msg: string) => void;
  filter: 'all' | 'unread' | 'attention';
  onFilterChange: (f: 'all' | 'unread' | 'attention') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const PER_PAGE = 20;

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const previewTexts: Record<string, string> = {
  'c-1': 'Can you also send me the invoice for last month?',
  'c-2': "That's wonderful to hear, Priya!",
  'c-3': "I signed up but couldn't find the analytics...",
  'c-4': 'Hello? Is anyone there? This is urgent.',
  'c-5': "I've attached our enterprise brochure...",
  'c-6': 'Still waiting... any update?',
  'c-7': "We've reset your access. Please try logging in.",
  'c-8': "I've temporarily increased it to 500...",
  'c-9': 'Thank you Ananya! The full blog post is...',
  'c-10': 'Any update on the admin access? Getting critical.',
  'c-11': "Done! You're now on the Pro plan.",
  'c-12': 'Yes! We have iOS and Android apps.',
  'c-13': 'Here are the Pro plan specifications.',
  'c-14': "Hi Aditya! We've prepared a custom plan...",
  'c-15': 'Hello, I need help with my order.',
  'c-16': 'Can you set up rate limits for analytics?',
  'c-17': 'Here are the steps for Slack integration...',
  'c-18': "Just connected Zapier and it's working great!",
  'c-19': 'Can you set up the SSO integration for Okta?',
  'c-20': 'That fixed it. Thanks!',
  'c-21': 'Can you integrate with Salesforce?',
  'c-22': 'We offer 50% off for students...',
  'c-23': 'Would you like a free 30-day trial?',
  'c-24': "The export isn't working. I keep getting an error.",
  'c-25': 'Want me to set up a demo call?',
};

export function ConversationList({
  contacts, conversations, selectedId, onSelect, showToast,
  filter, onFilterChange, searchQuery, onSearchChange,
}: ConversationListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [advOpen, setAdvOpen] = useState(false);
  const [advChannels, setAdvChannels] = useState<Set<string>>(new Set());
  const [advHighOnly, setAdvHighOnly] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const contactOf = (id: string) => contacts.find((c) => c.id === id);

  // ── Filtering pipeline ─────────────────────────────────────
  const matched = useMemo(() => {
    return conversations.filter((conv) => {
      if (filter === 'unread' && !conv.unread) return false;
      if (filter === 'attention' && !conv.needsAttention) return false;
      if (advChannels.size > 0) {
        if (!conv.channels.some((ch) => advChannels.has(ch))) return false;
      }
      if (advHighOnly && conv.priority !== 'high') return false;
      if (searchQuery) {
        const contact = contactOf(conv.contactId);
        if (!contact) return false;
        const q = searchQuery.toLowerCase();
        const searchable = [
          contact.name, contact.email, contact.phone, contact.instagramHandle,
          ...conv.channels,
        ].filter(Boolean).join(' ').toLowerCase();
        return searchable.includes(q);
      }
      return true;
    }).sort((a, b) => {
      const diff = new Date(a.lastMessageAt).getTime() - new Date(b.lastMessageAt).getTime();
      return sortBy === 'newest' ? -diff : diff;
    });
  }, [conversations, filter, searchQuery, sortBy, advChannels, advHighOnly]);

  // Reset to page 1 if the current page becomes empty
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
    if (page > totalPages) setPage(totalPages);
  }, [matched.length, page]);

  const totalPages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const pageRows = matched.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const unreadCount = conversations.filter((c) => c.unread).length;
  const attentionCount = conversations.filter((c) => c.needsAttention).length;

  const activeFilterCount = advChannels.size + (advHighOnly ? 1 : 0);

  const candidates = conversations.filter((c) => c.contactId !== selectedId).slice(0, 8);

  return (
    <>
      {/* ─── Header ─── */}
      <header style={{
        padding: '20px 16px 0',
        flexShrink: 0,
        background: 'var(--surface-2)',
        position: 'relative',
        zIndex: 30,
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>Conversations</h1>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
              {matched.length} total
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <button
              data-tip="Start a new conversation"
              onClick={() => { setNewOpen(!newOpen); setAdvOpen(false); }}
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: '1px solid var(--border-accent)',
                background: 'var(--navy-bg)', color: 'var(--text-primary)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                fontSize: '16px', fontWeight: 600, transition: '0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
            >{newOpen ? <X size={16} /> : <Plus size={16} />}</button>

            {newOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 38, width: 250,
                border: '1px solid var(--border-accent)', borderRadius: '10px',
                background: 'var(--surface)', boxShadow: '0 12px 34px rgba(0,0,0,0.35)',
                overflow: 'hidden', animation: 'fabSlideUp 0.12s ease-out', zIndex: 40,
              }}>
                <div style={{ padding: '9px 12px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', borderBottom: '1px solid var(--line-soft)', textTransform: 'uppercase' }}>
                  Start a conversation
                </div>
                {candidates.map((conv) => {
                  const c = contactOf(conv.contactId);
                  if (!c) return null;
                  return (
                    <div key={conv.id} data-tip={`Open chat with ${c.name}`}
                      onClick={() => { onSelect(c.id); setNewOpen(false); showToast(`Chat opened with ${c.name}`); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 12px', cursor: 'pointer', transition: '0.1s', borderBottom: '1px solid var(--line-soft)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Avatar name={c.name} size={26} />
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>{getTimeAgo(conv.lastMessageAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div
          data-tip="Search contacts or messages — ⌘K"
          style={{
            height: '40px', border: '1px solid var(--border-accent)',
            background: 'var(--input-bg)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px',
            marginBottom: '12px', transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--border-hover)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--navy-glow)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border-accent)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            className="search-input"
            value={searchQuery}
            onChange={(e) => { onSearchChange(e.target.value); setPage(1); }}
            placeholder="Search contacts or messages..."
            style={{ border: '0', background: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '12.5px', outline: 'none' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <kbd style={{ fontSize: '10px', color: 'var(--text-muted)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 5px', lineHeight: '14px', fontFamily: 'inherit' }}>⌘</kbd>
            <kbd style={{ fontSize: '10px', color: 'var(--text-muted)', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 5px', lineHeight: '14px', fontFamily: 'inherit' }}>K</kbd>
          </span>
        </div>

        {/* Filter chips row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
            {[
              { key: 'all' as const, label: 'All', tip: 'Show every conversation' },
              { key: 'unread' as const, label: 'Unread', count: unreadCount, tip: 'Conversations with unread messages' },
              { key: 'attention' as const, label: 'Needs attention', count: attentionCount, tip: 'Conversations that need a response' },
            ].map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  data-tip={f.tip}
                  onClick={() => { onFilterChange(f.key); setPage(1); }}
                  style={{
                    height: '30px', padding: '0 11px', borderRadius: '8px',
                    border: `1px solid ${isActive ? 'var(--navy-border)' : 'var(--border-accent)'}`,
                    background: isActive ? 'var(--navy-bg)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    whiteSpace: 'nowrap', transition: '0.12s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                >
                  <span>{f.label}</span>
                  {f.count !== undefined && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      color: f.key === 'attention' ? '#df7777' : (isActive ? '#89a8d3' : 'var(--text-muted)'),
                    }}>{f.count}</span>
                  )}
                </button>
              );
            })}

            {/* Advanced filters toggle */}
            <div style={{ position: 'relative' }}>
              <button
                data-tip="Advanced filters — channel, priority"
                onClick={() => { setAdvOpen(!advOpen); setNewOpen(false); }}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  border: `1px solid ${advOpen || activeFilterCount ? 'var(--navy-border)' : 'var(--border-accent)'}`,
                  background: advOpen || activeFilterCount ? 'var(--navy-bg)' : 'transparent',
                  color: advOpen || activeFilterCount ? 'var(--text-primary)' : 'var(--text-muted)',
                  display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, transition: '0.12s', position: 'relative',
                }}
                onMouseEnter={e => { if (!advOpen) e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={e => { if (!advOpen) e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
              >
                {activeFilterCount > 0 && (
                  <span style={{ position: 'absolute', top: -5, right: -5, minWidth: '15px', height: '15px', borderRadius: '8px', background: '#5c4ce0', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 3px' }}>{activeFilterCount}</span>
                )}
                {advOpen ? <X size={13} /> : <SlidersHorizontal size={13} />}
              </button>

              {advOpen && (
                <div style={{
                  position: 'absolute', left: 0, top: 36, width: 240,
                  border: '1px solid var(--border-accent)', borderRadius: '10px',
                  background: 'var(--surface)', boxShadow: '0 12px 34px rgba(0,0,0,0.35)',
                  padding: '10px 12px', animation: 'fabSlideUp 0.12s ease-out', zIndex: 45,
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Channels</div>
                  {(['email', 'instagram', 'whatsapp'] as const).map((ch) => (
                    <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '11.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={advChannels.has(ch)}
                        onChange={(e) => {
                          setAdvChannels((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(ch); else next.delete(ch);
                            return next;
                          });
                          setPage(1);
                        }}
                        style={{ accentColor: '#4263eb', width: '14px', height: '14px' }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{ch}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>
                        {conversations.filter((c) => c.channels.includes(ch)).length}
                      </span>
                    </label>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0 8px', fontSize: '11.5px', color: 'var(--text-secondary)', cursor: 'pointer', borderTop: '1px solid var(--line-soft)', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      checked={advHighOnly}
                      onChange={(e) => { setAdvHighOnly(e.target.checked); setPage(1); }}
                      style={{ accentColor: '#4263eb', width: '14px', height: '14px' }}
                    />
                    High priority only
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      data-tip="Apply these filters"
                      onClick={() => { setAdvOpen(false); }}
                      style={{ flex: 1, height: '28px', borderRadius: '7px', border: '1px solid var(--navy-border)', background: 'var(--navy-bg)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >Done</button>
                    <button
                      data-tip="Clear all advanced filters"
                      onClick={() => { setAdvChannels(new Set()); setAdvHighOnly(false); setPage(1); setAdvOpen(false); }}
                      style={{ flex: 1, height: '28px', borderRadius: '7px', border: '1px solid var(--border-accent)', background: 'transparent', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}
                    >Reset</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sort strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', height: '36px',
          borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--border-accent)',
          padding: '0 16px', margin: '0 -16px', flexShrink: 0, background: 'var(--surface-2)',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Sort by</span>
          <button
            data-tip={sortBy === 'newest' ? 'Currently newest first — click for oldest first' : 'Currently oldest first — click for newest first'}
            onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700,
              padding: '4px 8px', borderRadius: '6px', transition: '0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
          >
            {sortBy === 'newest' ? 'Newest' : 'Oldest'}
            <ArrowUpDown size={12} style={{ transform: sortBy === 'oldest' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          {matched.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>
              Page {page}/{totalPages}
            </span>
          )}
        </div>
      </header>

      {/* ─── Rows ─── */}
      <div className="rows">
        {pageRows.length === 0 && (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Filter size={22} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>No conversations match</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Try clearing filters or the search box.</div>
          </div>
        )}
        {pageRows.map((conv) => {
          const contact = contactOf(conv.contactId);
          if (!contact) return null;
          const isSelected = selectedId === conv.contactId;
          const isUnread = !!conv.unread;

          return (
            <div
              key={conv.id}
              className={`row ${isSelected ? 'selected' : ''}`}
              data-tip={isUnread ? `Open unread conversation with ${contact.name}` : `Open conversation with ${contact.name}`}
              onClick={() => { onSelect(conv.contactId); }}
              style={isSelected ? {
                background: 'var(--row-selected-bg)', borderColor: 'var(--row-selected-border)',
                boxShadow: 'inset 3px 0 0 var(--border-hover)',
              } : undefined}
            >
              <Avatar name={contact.name} size={40} />
              <div style={{ minWidth: 0 }}>
                <div className="row-name" style={{ fontWeight: isUnread ? 800 : 600 }}>
                  {contact.name}
                  <span className="channels">
                    {conv.channels.includes('email') && <span className="channel-icon email" data-tip="Has email messages">✉</span>}
                    {conv.channels.includes('instagram') && <span className="channel-icon insta" data-tip="Has Instagram messages">◎</span>}
                    {conv.channels.includes('whatsapp') && <span className="channel-icon wa" data-tip="Has WhatsApp messages">◉</span>}
                  </span>
                </div>
                <div className="preview">{previewTexts[contact.id] || 'Conversation preview'}</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {conv.priority === 'high' && <div className="priority">High</div>}
                  {conv.status === 'pending' && <div className="priority" style={{ color: '#e0a45a' }}>Pending</div>}
                  {conv.status === 'resolved' && <div className="priority" style={{ color: '#69d596' }}>Resolved</div>}
                  {conv.needsAttention === 'message_failed' && <div className="priority" style={{ color: '#df7777' }}>Failed msg</div>}
                  {conv.needsAttention === 'reply_unavailable' && <div className="priority" style={{ color: '#df7777' }}>Reply blocked</div>}
                </div>
              </div>
              <div>
                <div className="row-time">{getTimeAgo(conv.lastMessageAt)}</div>
                {isUnread && (
                  <div className="unread" data-tip="Unread messages">{isUnread === true ? '1' : ''}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Footer / Pager ─── */}
      <div className="list-footer">
        <span>
          {matched.length === 0 ? 'No results' : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, matched.length)} of ${matched.length}`}
        </span>
        <span className="pager">
          <button
            data-tip="Previous page"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{ opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >‹</button>
          <button
            data-tip="Next page"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{ opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >›</button>
        </span>
      </div>
    </>
  );
}
