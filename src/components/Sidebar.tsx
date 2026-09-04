import { useState } from 'react';
import {
  Inbox, AtSign, LayoutGrid, User, Clock, MessageCircle, AlertTriangle,
  CheckCircle, Moon, Mail, Camera, MessageSquare, Sun, ChevronDown, Users, LogOut,
} from 'lucide-react';
import type { ConnectedAccount } from '../types';
import { Avatar } from './Avatar';

interface NavItemDef {
  icon: typeof Inbox;
  label: string;
  badge?: number;
  colorClass?: string;
}

const topNav: NavItemDef[] = [
  { icon: Inbox, label: 'Inbox', badge: 24 },
  { icon: AtSign, label: 'Mentions' },
  { icon: LayoutGrid, label: 'All conversations' },
];

const viewsNav: NavItemDef[] = [
  { icon: User, label: 'Unassigned', badge: 8 },
  { icon: Clock, label: 'My open', badge: 16 },
  { icon: MessageCircle, label: 'Waiting on customer', badge: 5 },
  { icon: AlertTriangle, label: 'Needs attention', badge: 4 },
  { icon: CheckCircle, label: 'Resolved', badge: 24 },
  { icon: Moon, label: 'Snoozed', badge: 7 },
];

const channelsNav: NavItemDef[] = [
  { icon: Mail, label: 'Email', badge: 12, colorClass: 'text-red' },
  { icon: Camera, label: 'Instagram', badge: 8, colorClass: 'text-pink' },
  { icon: MessageSquare, label: 'WhatsApp', badge: 12, colorClass: 'text-green' },
];

const teams = [
  { color: 'p', label: 'Support', badge: 12 },
  { color: 'g', label: 'Sales', badge: 6 },
  { color: 'a', label: 'Billing', badge: 4 },
];

const navTips: Record<string, string> = {
  'Inbox': 'All your conversations, newest first',
  'Mentions': 'Messages where you were mentioned',
  'All conversations': 'Every conversation across all channels',
  'Unassigned': 'Conversations nobody has claimed yet',
  'My open': 'Conversations assigned to you',
  'Waiting on customer': 'You replied — now waiting on the customer',
  'Needs attention': 'SLA risk — reply as soon as possible',
  'Resolved': 'Closed conversations',
  'Snoozed': 'Set aside and scheduled to come back',
  'Email': 'Only email conversations',
  'Instagram': 'Only Instagram DM / story conversations',
  'WhatsApp': 'Only WhatsApp conversations',
};

interface SidebarProps {
  activeNav: string;
  onNavClick: (label: string) => void;
  showToast: (msg: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  accounts: ConnectedAccount[];
  activeAccountId: string;
  onAccountSwitch: (accountId: string) => void;
}

function getChannelIcon(ch: string) {
  if (ch === 'email') return <Mail size={13} />;
  if (ch === 'instagram') return <Camera size={13} />;
  return <MessageSquare size={13} />;
}

function getChannelColor(ch: string) {
  if (ch === 'email') return '#e27676';
  if (ch === 'instagram') return '#d489b1';
  return '#65d394';
}

export function Sidebar({ activeNav, onNavClick, showToast, isDark, onToggleTheme, accounts, activeAccountId, onAccountSwitch }: SidebarProps) {
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const activeAccount = accounts.find(a => a.id === activeAccountId);

  const renderNavItems = (items: NavItemDef[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = activeNav === item.label;
      return (
        <div
          key={item.label}
          data-tip={navTips[item.label] || item.label}
          onClick={() => { onNavClick(item.label); }}
          className={`nav-item ${isActive ? 'active' : ''}`}
        >
          <span className={`nav-icon ${item.colorClass || ''}`}><Icon size={16} /></span>
          <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
          {item.badge !== undefined && <span className="badge">{item.badge}</span>}
        </div>
      );
    });

  return (
    <>
      {/* Brand */}
      <div className="brand">
        <div className="logo" data-tip="OmniDesk workspace">G</div>
        <div>
          <div className="brand-name">OmniDesk</div>
          <div className="brand-caption">CUSTOMER WORKSPACE</div>
        </div>
      </div>

      {/* Top nav */}
      <nav className="nav">{renderNavItems(topNav)}</nav>

      {/* Views */}
      <div className="nav-section">VIEWS</div>
      <nav className="nav">{renderNavItems(viewsNav)}</nav>

      {/* Channels */}
      <div className="nav-section">CHANNELS</div>
      <nav className="nav">{renderNavItems(channelsNav)}</nav>

      {/* Teams */}
      <div className="nav-section">TEAMS</div>
      {teams.map((t) => (
        <div
          key={t.label}
          data-tip={`Filter to the ${t.label} team's conversations`}
          onClick={() => { onNavClick(t.label); }}
          className="team"
          style={{ cursor: 'pointer', borderRadius: '7px', transition: '0.12s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <span className={`dot ${t.color}`} />
          {t.label}
          <span className="badge">{t.badge}</span>
        </div>
      ))}

      {/* Theme Toggle */}
      <div className="theme-toggle" data-tip={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={onToggleTheme}>
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
        <span style={{ flex: 1, textAlign: 'left' }}>{isDark ? 'Dark mode' : 'Light mode'}</span>
        <div className="theme-toggle-track"><div className="theme-toggle-thumb" /></div>
      </div>

      {/* Workspace + Account Switcher */}
      <div className="workspace">
        <div className="workspace-title">
          <span data-tip="Acme Support workspace">Acme Support</span>
          <span data-tip={workspaceOpen ? 'Collapse workspace' : 'Who is online?'} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }} onClick={() => setWorkspaceOpen(!workspaceOpen)}>
            <ChevronDown size={12} style={{ transform: workspaceOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </span>
        </div>
        <div className="workspace-sub">3 members online</div>

        {workspaceOpen ? (
          <div style={{ marginTop: '8px', display: 'grid', gap: '6px', animation: 'fabSlideUp 0.14s ease-out' }}>
            {[
              { name: 'Arjun Mehta', role: 'Support Agent', online: true },
              { name: 'Meera Shah', role: 'Support Agent', online: true },
              { name: 'Priya Nair', role: 'Billing Agent', online: false },
            ].map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Avatar name={m.name} size={22} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{m.role}</div>
                </div>
                <span data-tip={m.online ? 'Online' : 'Away'} style={{ width: '7px', height: '7px', borderRadius: '50%', background: m.online ? '#63d595' : '#69727b' }} />
              </div>
            ))}
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>2 more offline…</div>
          </div>
        ) : (
          <div className="avatar-stack" data-tip="3 agents online — click ⌃ for details">
            {['Arjun Mehta', 'Meera Shah', 'Priya Nair'].map((n) => (
              <Avatar key={n} name={n} size={26} border="2px solid var(--surface-2)" />
            ))}
            <span className="tiny-avatar">+2</span>
          </div>
        )}

        {/* Account Switcher */}
        <div style={{ marginTop: '10px', position: 'relative' }}>
          <div
            data-tip="Switch the account you send from"
            className="nav-item"
            style={{
              height: '36px', padding: '0 8px', cursor: 'pointer', fontSize: '11px',
              border: '1px solid var(--border-accent)', borderRadius: '7px', background: 'var(--surface-2)',
            }}
            onClick={() => setAccountsOpen(!accountsOpen)}
          >
            <span style={{ color: getChannelColor(activeAccount?.channel || 'email'), display: 'flex' }}>{getChannelIcon(activeAccount?.channel || 'email')}</span>
            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeAccount?.identifier || 'Select account'}</span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)', transform: accountsOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </div>

          {accountsOpen && (
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 42, zIndex: 90,
              border: '1px solid var(--border-accent)', borderRadius: '8px', background: 'var(--surface-3)',
              overflow: 'hidden', boxShadow: '0 -8px 30px rgba(0,0,0,0.35)',
            }}>
              <div style={{ padding: '7px 10px 4px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Send from</div>
              {accounts.filter(a => a.status === 'connected').map((acc) => (
                <div
                  key={acc.id}
                  data-tip={`Reply as ${acc.identifier}`}
                  onClick={() => { onAccountSwitch(acc.id); setAccountsOpen(false); showToast('Switched to ' + acc.identifier); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', cursor: 'pointer', fontSize: '10px',
                    background: acc.id === activeAccountId ? 'var(--navy-bg)' : 'transparent',
                    borderBottom: '1px solid var(--line-soft)',
                    color: acc.id === activeAccountId ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: '0.1s',
                  }}
                  onMouseEnter={(e) => { if (acc.id !== activeAccountId) e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                  onMouseLeave={(e) => { if (acc.id !== activeAccountId) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ color: getChannelColor(acc.channel), display: 'flex' }}>{getChannelIcon(acc.channel)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.displayName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.identifier}</div>
                  </div>
                  {acc.id === activeAccountId && <CheckCircle size={12} style={{ color: '#63d595' }} />}
                </div>
              ))}
              <div
                data-tip="Connect a new channel (demo)"
                onClick={() => { showToast('Add account — connect Email / Instagram / WhatsApp'); setAccountsOpen(false); }}
                style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '10.5px', color: 'var(--border-hover)', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              ><Users size={11} /> + Add account</div>
            </div>
          )}
        </div>

        {/* Agent */}
        <div className="agent" style={{ cursor: 'pointer', position: 'relative' }}>
          <Avatar name="Arjun Mehta" size={34} backgroundColor="linear-gradient(145deg, #6d4f43, #252d35)" dot="online" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="agent-name">Arjun Mehta</div>
            <div className="agent-role" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Support Agent</div>
          </div>
          <span data-tip={agentOpen ? 'Close menu' : 'Agent options'} style={{ marginLeft: 'auto', color: 'var(--text-muted)', display: 'flex', cursor: 'pointer' }} onClick={() => setAgentOpen(!agentOpen)}>
            <ChevronDown size={12} style={{ transform: agentOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </span>
          {agentOpen && (
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 44, zIndex: 90,
              border: '1px solid var(--border-accent)', borderRadius: '8px', background: 'var(--surface-3)',
              overflow: 'hidden', boxShadow: '0 -8px 30px rgba(0,0,0,0.35)',
            }}>
              {[
                { label: 'My profile', act: () => showToast('Profile opened') },
                { label: 'Availability: Online', act: () => showToast('Availability toggled (demo)') },
                { label: 'Settings', act: () => showToast('Settings opened') },
              ].map((o) => (
                <div key={o.label} onClick={() => { o.act(); setAgentOpen(false); }} style={{ padding: '8px 11px', fontSize: '10.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >{o.label}</div>
              ))}
              <div onClick={() => { showToast('Signed out (demo)'); setAgentOpen(false); }} style={{ padding: '8px 11px', fontSize: '10.5px', color: '#df7777', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--line-soft)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              ><LogOut size={11} /> Sign out</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
