import { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { ConversationListItem } from './ConversationListItem';
import { getContactById } from '../../data/mockRepository';
import type { Conversation } from '../../types';
import type { InboxFilter, InboxView } from '../../hooks/useInbox';

type ConversationListProps = {
  conversations: Conversation[];
  selectedId: string | null;
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sidebarView: InboxView;
  onSelect: (id: string) => void;
};

export function ConversationList({
  conversations,
  selectedId,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onSelect,
}: ConversationListProps) {
  const [showSort, setShowSort] = useState(false);
  return (
    <div className="w-[330px] h-full bg-[#24272B] border-r border-border flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[14px] font-semibold text-text-primary">Conversations</h2>
            <p className="text-[10.5px] text-text-muted mt-0.5">{conversations.length} total</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts or messages..."
            className="w-full pl-8 pr-14 py-[7px] bg-input border border-border rounded-md text-[11.5px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-navy-bright transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <span className="text-[9px] text-text-muted bg-[#30343A] px-1.5 py-0.5 rounded font-mono border border-border-subtle">⌘K</span>
            <button className="p-0.5 text-text-muted hover:text-text-secondary transition-colors">
              <Filter className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Sort bar */}
      <div className="px-4 py-1.5 flex items-center justify-between border-b border-border-subtle">
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Newest
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSort && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-[#30343A] border border-border rounded-md shadow-lg z-20 py-1">
              {['Newest', 'Oldest', 'Most active'].map((s) => (
                <button
                  key={s}
                  onClick={() => setShowSort(false)}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-text-secondary hover:bg-hover transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-text-muted">
          Showing 1-{conversations.length} of {conversations.length}
        </span>
      </div>

      {/* Quick filter chips */}
      <div className="px-4 py-2 flex items-center gap-1.5 border-b border-border-subtle">
        {['All', 'Unread', 'Needs attention'].map((label) => {
          const isActive = label === 'All' && !filter.unreadOnly && !filter.needsAttention;
          return (
            <button
              key={label}
              onClick={() => {
                if (label === 'All') onFilterChange({ unreadOnly: false, needsAttention: false, channels: [] });
                else if (label === 'Unread') onFilterChange({ ...filter, unreadOnly: true, needsAttention: false });
                else if (label === 'Needs attention') onFilterChange({ ...filter, needsAttention: true, unreadOnly: false });
              }}
              className={`px-2.5 py-1 rounded text-[10.5px] font-medium transition-all border ${
                isActive
                  ? 'bg-[#303844] text-text-primary border-[#314D82]'
                  : 'text-text-secondary hover:bg-hover border-transparent'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-text-muted" />
            </div>
            <p className="text-[12px] font-medium text-text-secondary mb-1">No conversations found</p>
            <p className="text-[10.5px] text-text-muted mb-3">
              {searchQuery
                ? `No results for "${searchQuery}". Try another name, email, phone, or message.`
                : 'Try removing one or more filters.'}
            </p>
            <button
              onClick={() => onFilterChange({ unreadOnly: false, needsAttention: false, channels: [] })}
              className="text-[11px] text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const contact = getContactById(conv.contactId);
            if (!contact) return null;
            return (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                contact={contact}
                isSelected={conv.id === selectedId}
                onSelect={onSelect}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
