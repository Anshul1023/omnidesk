import { useState, useCallback, useMemo } from 'react';
import type { ConversationStatus, Channel } from '../types';
import {
  getConversations,
  markConversationRead,
  searchContacts,
} from '../data/mockRepository';

export type InboxFilter = {
  status?: ConversationStatus;
  unreadOnly: boolean;
  needsAttention: boolean;
  channels: Channel[];
  assignee?: string;
  recency?: 'today' | '7days' | '30days';
};

const defaultFilter: InboxFilter = {
  unreadOnly: false,
  needsAttention: false,
  channels: [],
};

export type InboxView = 'all' | 'unread' | 'open' | 'pending' | 'resolved';

export function useInbox() {
  const [sidebarView, setSidebarView] = useState<InboxView>('all');
  const [filter, setFilter] = useState<InboxFilter>(defaultFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const conversations = useMemo(() => {
    let convs = getConversations();

    // Sidebar view
    switch (sidebarView) {
      case 'unread':
        convs = convs.filter((c) => c.unread);
        break;
      case 'open':
        convs = convs.filter((c) => c.status === 'open');
        break;
      case 'pending':
        convs = convs.filter((c) => c.status === 'pending');
        break;
      case 'resolved':
        convs = convs.filter((c) => c.status === 'resolved');
        break;
    }

    // Filter
    if (filter.unreadOnly) convs = convs.filter((c) => c.unread);
    if (filter.needsAttention) convs = convs.filter((c) => !!c.needsAttention);
    if (filter.channels.length > 0)
      convs = convs.filter((c) => filter.channels.some((ch) => c.channels.includes(ch)));
    if (filter.status) convs = convs.filter((c) => c.status === filter.status);
    if (filter.assignee) convs = convs.filter((c) => c.assignedTo === filter.assignee);

    if (filter.recency) {
      const now = Date.now();
      const ms =
        filter.recency === 'today'
          ? 86400000
          : filter.recency === '7days'
            ? 7 * 86400000
            : 30 * 86400000;
      convs = convs.filter((c) => now - new Date(c.lastMessageAt).getTime() < ms);
    }

    // Search
    if (searchQuery.trim()) {
      const matchingContactIds = searchContacts(searchQuery.trim());
      convs = convs.filter((c) => matchingContactIds.includes(c.contactId));
    }

    return convs;
  }, [sidebarView, filter, searchQuery]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter.unreadOnly) count++;
    if (filter.needsAttention) count++;
    if (filter.channels.length > 0) count += filter.channels.length;
    if (filter.status) count++;
    if (filter.assignee) count++;
    if (filter.recency) count++;
    return count;
  }, [filter]);

  const toggleChannel = useCallback((channel: Channel) => {
    setFilter((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter(defaultFilter);
    setSearchQuery('');
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilter((prev) => {
      const next = { ...prev };
      if (key === 'unreadOnly') next.unreadOnly = false;
      if (key === 'needsAttention') next.needsAttention = false;
      if (key === 'status') next.status = undefined;
      if (key === 'assignee') next.assignee = undefined;
      if (key === 'recency') next.recency = undefined;
      if (key.startsWith('channel:')) {
        next.channels = next.channels.filter((c) => c !== key.replace('channel:', ''));
      }
      return next;
    });
  }, []);

  return {
    conversations,
    selectedConversationId,
    setSelectedConversationId: useCallback(
      (id: string | null) => {
        setSelectedConversationId(id);
        if (id) {
          markConversationRead(id);
        }
      },
      [],
    ),
    sidebarView,
    setSidebarView: useCallback((view: InboxView) => {
      setSidebarView(view);
      setFilter(defaultFilter);
      setSearchQuery('');
    }, []),
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    activeFilterCount,
    toggleChannel,
    clearFilters,
    removeFilter,
    refresh,
    selectConversation: useCallback(
      (id: string) => {
        setSelectedConversationId(id);
        markConversationRead(id);
        refresh();
      },
      [refresh],
    ),
  };
}
