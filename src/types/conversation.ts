import type { AttentionReason, Channel } from './message';

export type ConversationStatus = 'open' | 'pending' | 'resolved';

export type Conversation = {
  id: string;
  contactId: string;
  status: ConversationStatus;
  unread: boolean;
  priority: 'normal' | 'high';
  assignedTo?: string;
  snoozed?: boolean;
  lastMessageAt: string;
  channels: Channel[];
  needsAttention?: AttentionReason;
};
