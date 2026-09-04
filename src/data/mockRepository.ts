import type {
  Contact,
  ConnectedAccount,
  Conversation,
  Message,
  ConversationStatus,
  Channel,
} from '../types';
import { seedContacts, seedAccounts, seedConversations, seedMessages } from './seed';

// ─── In-memory data store ───

let contacts: Contact[] = [...seedContacts];
let accounts: ConnectedAccount[] = [...seedAccounts];
let conversations: Conversation[] = [...seedConversations];
let messages: Message[] = [...seedMessages];

let nextMessageId = 100;

// ─── Contacts ───

export function getContacts(): Contact[] {
  return contacts;
}

export function getContactById(id: string): Contact | undefined {
  return contacts.find((c) => c.id === id);
}

export function getContactByConversationId(conversationId: string): Contact | undefined {
  const conv = conversations.find((c) => c.id === conversationId);
  if (!conv) return undefined;
  return contacts.find((c) => c.id === conv.contactId);
}

// ─── Conversations ───

export function getConversations(): Conversation[] {
  return [...conversations].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

export function getConversationById(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id);
}

export function getConversationsByContactId(contactId: string): Conversation[] {
  return conversations.filter((c) => c.contactId === contactId);
}

export function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
): Conversation | undefined {
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.status = status;
  }
  return conv;
}

export function updateAssignee(conversationId: string, assignee: string): Conversation | undefined {
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.assignedTo = assignee;
  }
  return conv;
}

export function markConversationRead(conversationId: string): Conversation | undefined {
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.unread = false;
  }
  return conv;
}

export function markConversationUnread(conversationId: string): Conversation | undefined {
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.unread = true;
  }
  return conv;
}

// ─── Messages ───

export function getMessagesByConversationId(conversationId: string): Message[] {
  return messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function sendMessage(
  conversationId: string,
  channel: Channel,
  body: string,
  connectedAccountId: string,
  senderName: string,
  senderIdentifier: string,
  metadata?: Message['metadata'],
): Message {
  const newMsg: Message = {
    id: `msg-${++nextMessageId}`,
    conversationId,
    channel,
    direction: 'outgoing',
    senderName,
    senderIdentifier,
    connectedAccountId,
    timestamp: new Date().toISOString(),
    body,
    status: 'sending',
    metadata,
  };
  messages.push(newMsg);

  // Update conversation lastMessageAt
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessageAt = newMsg.timestamp;
    if (!conv.channels.includes(channel)) {
      conv.channels.push(channel);
    }
  }

  return newMsg;
}

export function updateMessageStatus(
  messageId: string,
  status: Message['status'],
): Message | undefined {
  const msg = messages.find((m) => m.id === messageId);
  if (msg) {
    msg.status = status;
  }
  return msg;
}

// ─── Connected Accounts ───

export function getConnectedAccounts(): ConnectedAccount[] {
  return accounts;
}

export function getAccountsByChannel(channel: Channel): ConnectedAccount[] {
  return accounts.filter((a) => a.channel === channel);
}

export function toggleAccountStatus(accountId: string): ConnectedAccount | undefined {
  const acc = accounts.find((a) => a.id === accountId);
  if (acc) {
    acc.status = acc.status === 'connected' ? 'disconnected' : 'connected';
  }
  return acc;
}

// ─── Search ───

export function searchContacts(query: string): string[] {
  const lower = query.toLowerCase();
  return contacts
    .filter((c) => {
      if (c.name.toLowerCase().includes(lower)) return true;
      if (c.email?.toLowerCase().includes(lower)) return true;
      if (c.phone?.includes(lower)) return true;
      if (c.instagramHandle?.toLowerCase().includes(lower)) return true;
      // Search in messages
      const convs = conversations.filter((cv) => cv.contactId === c.id);
      for (const conv of convs) {
        const msgs = messages.filter(
          (m) =>
            m.conversationId === conv.id &&
            m.body.toLowerCase().includes(lower),
        );
        if (msgs.length > 0) return true;
        // Search email subjects
        const emailMeta = msgs.find(
          (m) =>
            m.channel === 'email' &&
            (m.metadata as { subject?: string })?.subject?.toLowerCase().includes(lower),
        );
        if (emailMeta) return true;
      }
      return false;
    })
    .map((c) => c.id);
}

// ─── Stats ───

export function getUnreadCount(): number {
  return conversations.filter((c) => c.unread).length;
}

export function getStatusCounts(): Record<ConversationStatus, number> {
  const counts: Record<ConversationStatus, number> = { open: 0, pending: 0, resolved: 0 };
  for (const c of conversations) {
    counts[c.status]++;
  }
  return counts;
}

export function getTotalCount(): number {
  return conversations.length;
}
