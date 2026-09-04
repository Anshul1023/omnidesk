import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { InboxFilter, InboxView } from '../../hooks/useInbox';
import type { Channel } from '../../types';
import { FilterPopover } from './FilterPopover';
import { channelLabel } from '../../utils/formatting';

type FilterBarProps = {
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  sidebarView: InboxView;
};

export function FilterBar({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  totalResults,
  sidebarView,
}: FilterBarProps) {
  const [showPopover, setShowPopover] = useState(false);

  const activeChips: { key: string; label: string }[] = [];
  if (filter.unreadOnly) activeChips.push({ key: 'unreadOnly', label: 'Unread' });
  if (filter.needsAttention) activeChips.push({ key: 'needsAttention', label: 'Needs attention' });
  if (filter.status) activeChips.push({ key: 'status', label: filter.status.charAt(0).toUpperCase() + filter.status.slice(1) });
  filter.channels.forEach((ch) =>
    activeChips.push({ key: `channel:${ch}`, label: channelLabel(ch) }),
  );
  if (filter.assignee) activeChips.push({ key: 'assignee', label: filter.assignee });
  if (filter.recency) {
    const labels = { today: 'Today', '7days': 'Last 7 days', '30days': 'Last 30 days' };
    activeChips.push({ key: 'recency', label: labels[filter.recency] });
  }

  const removeChip = (key: string) => {
    if (key === 'unreadOnly') onFilterChange({ ...filter, unreadOnly: false });
    else if (key === 'needsAttention') onFilterChange({ ...filter, needsAttention: false });
    else if (key === 'status') onFilterChange({ ...filter, status: undefined });
    else if (key === 'assignee') onFilterChange({ ...filter, assignee: undefined });
    else if (key === 'recency') onFilterChange({ ...filter, recency: undefined });
    else if (key.startsWith('channel:')) {
      const ch = key.replace('channel:', '') as Channel;
      onFilterChange({ ...filter, channels: filter.channels.filter((c) => c !== ch) });
    }
  };

  const viewLabels: Record<InboxView, string> = {
    all: 'Conversations',
    unread: 'Unread conversations',
    open: 'Open conversations',
    pending: 'Pending conversations',
    resolved: 'Resolved conversations',
  };

  return (
    <div className="border-b border-border bg-white">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-[14px] font-semibold text-text-primary">{viewLabels[sidebarView]}</h2>
            <p className="text-[11px] text-text-tertiary">{totalResults} conversations</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts or messages..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-border-light rounded-lg text-[12px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/30 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick filters */}
      <div className="px-4 pb-2 flex items-center gap-1.5 relative">
        <button
          onClick={() =>
            onFilterChange({
              ...filter,
              needsAttention: false,
              channels: [],
              status: undefined,
              assignee: undefined,
              recency: undefined,
              unreadOnly: !filter.unreadOnly,
            })
          }
          className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors border ${
            filter.unreadOnly && !filter.needsAttention && filter.channels.length === 0
              ? 'bg-accent-light text-accent border-accent/20'
              : 'bg-white text-text-secondary border-border hover:border-gray-300'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() =>
            onFilterChange({
              ...filter,
              unreadOnly: false,
              channels: [],
              status: undefined,
              assignee: undefined,
              recency: undefined,
              needsAttention: !filter.needsAttention,
            })
          }
          className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors border ${
            filter.needsAttention && !filter.unreadOnly && filter.channels.length === 0
              ? 'bg-warning-bg text-warning border-warning/20'
              : 'bg-white text-text-secondary border-border hover:border-gray-300'
          }`}
        >
          Needs attention
        </button>
        <div className="relative ml-auto">
          <button
            onClick={() => setShowPopover(!showPopover)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors border ${
              showPopover
                ? 'bg-accent-light text-accent border-accent/20'
                : 'bg-white text-text-secondary border-border hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Filter
          </button>
          {showPopover && (
            <FilterPopover
              filter={filter}
              onFilterChange={(f) => {
                onFilterChange(f);
              }}
              onClose={() => setShowPopover(false)}
            />
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-light text-accent text-[10.5px] font-medium rounded-full"
            >
              {chip.label}
              <button
                onClick={() => removeChip(chip.key)}
                className="hover:text-accent-hover transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() =>
              onFilterChange({
                unreadOnly: false,
                needsAttention: false,
                channels: [],
                status: undefined,
                assignee: undefined,
                recency: undefined,
              })
            }
            className="text-[10.5px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
