import { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import type { Channel, ConversationStatus } from '../../types';
import type { InboxFilter } from '../../hooks/useInbox';
import { getStatusCounts, getUnreadCount, getTotalCount } from '../../data/mockRepository';

type FilterPanelProps = {
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
};

const channels: { id: Channel; icon: string; color: string }[] = [
  { id: 'email', icon: '✉', color: 'text-channel-email' },
  { id: 'instagram', icon: '📸', color: 'text-channel-instagram' },
  { id: 'whatsapp', icon: '💬', color: 'text-channel-whatsapp' },
];

const statuses: { id: ConversationStatus; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'pending', label: 'Pending' },
  { id: 'resolved', label: 'Resolved' },
];

const priorities = [
  { label: 'High', color: '#F87171', count: 5 },
  { label: 'Normal', color: '#FBBF24', count: 10 },
];

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border-subtle">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted hover:bg-hover transition-colors"
      >
        {title}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

export function FilterPanel({ filter, onFilterChange }: FilterPanelProps) {
  const total = getTotalCount();
  const unreadCount = getUnreadCount();
  const statusCounts = getStatusCounts();

  const quickFilters = [
    { label: 'All', count: total, active: !filter.unreadOnly && !filter.needsAttention && filter.channels.length === 0 && !filter.status },
    { label: 'Unread', count: unreadCount, active: filter.unreadOnly },
    { label: 'Open', count: statusCounts.open, active: filter.status === 'open' },
    { label: 'Snoozed', count: statusCounts.pending, active: filter.status === 'pending' },
  ];

  return (
    <div className="w-[220px] h-full bg-[#24272B] border-r border-border flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-text-primary">Quick filters</span>
          <Filter className="w-3.5 h-3.5 text-text-muted" />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="px-2 pb-2 space-y-px">
        {quickFilters.map((qf) => (
          <button
            key={qf.label}
            onClick={() => {
              if (qf.label === 'All') onFilterChange({ unreadOnly: false, needsAttention: false, channels: [], status: undefined });
              else if (qf.label === 'Unread') onFilterChange({ ...filter, unreadOnly: !filter.unreadOnly, status: undefined });
              else if (qf.label === 'Open') onFilterChange({ ...filter, status: filter.status === 'open' ? undefined : 'open', unreadOnly: false });
              else if (qf.label === 'Snoozed') onFilterChange({ ...filter, status: filter.status === 'pending' ? undefined : 'pending', unreadOnly: false });
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-[11.5px] font-medium transition-all ${
              qf.active
                ? 'bg-[#303844] text-text-primary border border-[#314D82]'
                : 'text-text-secondary hover:bg-hover border border-transparent'
            }`}
          >
            <span>{qf.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded min-w-[20px] text-center tabular-nums ${
              qf.active ? 'bg-[#314D82]/30 text-[#8BACD8]' : 'bg-[#30343A] text-text-muted'
            }`}>
              {qf.count}
            </span>
          </button>
        ))}
      </div>

      {/* Channels */}
      <Section title="Channels">
        <div className="space-y-px px-2">
          {channels.map((ch) => {
            const isActive = filter.channels.includes(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => {
                  const next = isActive
                    ? filter.channels.filter((c) => c !== ch.id)
                    : [...filter.channels, ch.id];
                  onFilterChange({ ...filter, channels: next });
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-[11.5px] transition-all ${
                  isActive
                    ? 'bg-[#303844] text-text-primary border border-[#314D82]'
                    : 'text-text-secondary hover:bg-hover border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs">{ch.icon}</span>
                  {ch.id.charAt(0).toUpperCase() + ch.id.slice(1)}
                </span>
                <span className="text-[10px] text-text-muted tabular-nums">
                  {[12, 8, 12][channels.indexOf(ch)]}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Accounts */}
      <Section title="Accounts">
        <div className="px-3">
          <div className="flex items-center justify-between px-3 py-1.5 bg-input border border-border rounded text-[11px] text-text-secondary cursor-pointer hover:border-border-hover transition-colors">
            <span>All accounts</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </Section>

      {/* Status */}
      <Section title="Status">
        <div className="space-y-px px-2">
          {statuses.map((s) => {
            const isActive = filter.status === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onFilterChange({ ...filter, status: isActive ? undefined : s.id, unreadOnly: false })}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-[11.5px] transition-all ${
                  isActive
                    ? 'bg-[#303844] text-text-primary border border-[#314D82]'
                    : 'text-text-secondary hover:bg-hover border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded border ${isActive ? 'bg-accent border-accent' : 'border-border-hover'} flex items-center justify-center`}>
                    {isActive && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </span>
                  {s.label}
                </span>
                <span className="text-[10px] text-text-muted tabular-nums">{statusCounts[s.id]}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Priority */}
      <Section title="Priority">
        <div className="space-y-px px-2">
          {priorities.map((p) => (
            <div key={p.label} className="flex items-center justify-between px-3 py-1.5 text-[11.5px] text-text-secondary">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                {p.label}
              </span>
              <span className="text-[10px] text-text-muted tabular-nums">{p.count}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Date */}
      <Section title="Date">
        <div className="px-3">
          <div className="flex items-center justify-between px-3 py-1.5 bg-input border border-border rounded text-[11px] text-text-secondary cursor-pointer hover:border-border-hover transition-colors">
            <span>Any time</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </Section>

      {/* Save as view */}
      <div className="p-3 mt-auto border-t border-border-subtle">
        <button className="w-full py-2 bg-[#243B68] hover:bg-[#314D82] text-text-primary text-[11.5px] font-semibold rounded-md transition-colors border border-[#314D82]">
          Save as view
        </button>
      </div>
    </div>
  );
}
