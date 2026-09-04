import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ConversationList } from './components/ConversationList';
import { MainConversation } from './components/MainConversation';
import { ContactPanel } from './components/ContactPanel';
import { useToast } from './hooks/useToast';
import { useTooltip } from './hooks/useTooltip';
import { seedContacts, seedConversations, seedMessages, seedAccounts } from './data/seed';
import type { Channel } from './types';

export type NavFilter = {
  type: 'view' | 'channel' | 'team' | 'all';
  value?: string;
};

export default function App() {
  const { toast, showToast } = useToast();
  const { tip: tooltip } = useTooltip();
  const [activeNav, setActiveNav] = useState('Inbox');
  const [navFilter, setNavFilter] = useState<NavFilter>({ type: 'all' });
  const [selectedContactId, setSelectedContactId] = useState<string | null>('c-1');
  const [filter, setFilter] = useState<'all' | 'unread' | 'attention'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [activeAccountId, setActiveAccountId] = useState('acc-email-support');
  const [contacts] = useState(seedContacts);
  const [conversations, setConversations] = useState(seedConversations);
  const [composeReq, setComposeReq] = useState<{ id: number; channel: Channel } | null>(null);

  // Sidebar nav click → set filter
  const handleNavClick = useCallback((label: string) => {
    setActiveNav(label);
    // View filters
    const viewMap: Record<string, NavFilter> = {
      'Inbox': { type: 'all' },
      'Mentions': { type: 'view', value: 'mentions' },
      'All conversations': { type: 'all' },
      'Unassigned': { type: 'view', value: 'unassigned' },
      'My open': { type: 'view', value: 'my_open' },
      'Waiting on customer': { type: 'view', value: 'waiting' },
      'Needs attention': { type: 'view', value: 'attention' },
      'Resolved': { type: 'view', value: 'resolved' },
      'Snoozed': { type: 'view', value: 'snoozed' },
      'Email': { type: 'channel', value: 'email' },
      'Instagram': { type: 'channel', value: 'instagram' },
      'WhatsApp': { type: 'channel', value: 'whatsapp' },
      'Support': { type: 'team', value: 'support' },
      'Sales': { type: 'team', value: 'sales' },
      'Billing': { type: 'team', value: 'billing' },
    };
    setNavFilter(viewMap[label] || { type: 'all' });
  }, []);

  // Apply nav filter to conversations
  const navFilteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (navFilter.type === 'all') return true;
      if (navFilter.type === 'channel') {
        return conv.channels.includes(navFilter.value as any);
      }
      if (navFilter.type === 'view') {
        switch (navFilter.value) {
          case 'unassigned': return !conv.assignedTo || conv.assignedTo === '';
          case 'my_open': return conv.status === 'open' && conv.assignedTo === 'You';
          case 'waiting': return conv.status === 'open';
          case 'attention': return !!conv.needsAttention;
          case 'resolved': return conv.status === 'resolved';
          case 'snoozed': return !!conv.snoozed;
          case 'mentions': return conv.channels.includes('instagram');
          default: return true;
        }
      }
      if (navFilter.type === 'team') {
        // Simulate team assignments
        if (navFilter.value === 'support') return conv.assignedTo === 'You' || conv.assignedTo === 'Aman';
        if (navFilter.value === 'sales') return conv.channels.includes('email') && conv.status === 'open';
        if (navFilter.value === 'billing') return conv.needsAttention === 'reply_unavailable' || conv.needsAttention === 'message_failed';
        return true;
      }
      return true;
    });
  }, [conversations, navFilter]);

  const selectedContact = contacts.find((c) => c.id === selectedContactId);
  const selectedConversation = conversations.find((c) => c.contactId === selectedContactId);
  const conversationMessages = selectedConversation
    ? seedMessages.filter((m) => m.conversationId === selectedConversation.id)
    : [];

  const handleQuickCompose = useCallback((channel: Channel) => {
    setComposeReq((prev) => ({ id: (prev?.id || 0) + 1, channel }));
    showToast(`Compose opened — replying via ${channel}`);
  }, [showToast]);

  const handleStatusChange = useCallback((newStatus: string) => {
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, status: newStatus as any }
          : c
      )
    );
  }, [selectedConversation]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('.search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="panel sidebar">
        <div className="sidebar-inner">
          <Sidebar
            activeNav={activeNav}
            onNavClick={handleNavClick}
            showToast={showToast}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            accounts={seedAccounts}
            activeAccountId={activeAccountId}
            onAccountSwitch={setActiveAccountId}
          />
        </div>
      </aside>

      {/* Conversation List */}
      <section className="panel list-panel">
        <ConversationList
          contacts={contacts}
          conversations={navFilteredConversations}
          selectedId={selectedContactId}
          onSelect={setSelectedContactId}
          showToast={showToast}
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </section>

      {/* Main Conversation */}
      {selectedContact && selectedConversation ? (
        <main className="panel main">
          <MainConversation
            key={selectedContact.id}
            contact={selectedContact}
            conversation={selectedConversation}
            messages={conversationMessages}
            showToast={showToast}
            onStatusChange={handleStatusChange}
            activeAccountId={activeAccountId}
            accounts={seedAccounts}
            composeRequest={composeReq || undefined}
          />
        </main>
      ) : (
        <div className="panel main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Welcome to OmniDesk</div>
            <div style={{ fontSize: '13px' }}>Select a conversation from the list to view the unified cross-channel timeline.</div>
          </div>
        </div>
      )}

      {/* Contact Panel */}
      <aside className="panel details">
        {selectedContact ? (
          <ContactPanel
            key={selectedContact.id}
            contact={selectedContact}
            showToast={showToast}
            onQuickCompose={handleQuickCompose}
          />
        ) : (
          <div />
        )}
      </aside>

      {/* Toast */}
      <div className={`toast ${toast.visible ? 'show' : ''}`}>
        {toast.message}
      </div>

      {/* Hover tooltip layer */}
      {tooltip.visible && (
        <div style={{
          position: 'fixed', left: Math.min(tooltip.x, window.innerWidth - 270), top: tooltip.y,
          zIndex: 400, maxWidth: 260, pointerEvents: 'none',
          background: 'var(--toast-bg)', color: 'var(--text-primary)',
          border: '1px solid var(--border-hover)', borderRadius: '8px',
          padding: '7px 11px', fontSize: '11px', lineHeight: 1.45,
          boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
