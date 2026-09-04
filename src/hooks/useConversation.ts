import { useState, useCallback, useMemo } from 'react';
import type { Channel, ConversationStatus } from '../types';
import {
  getMessagesByConversationId,
  getContactByConversationId,
  getConversationById,
  sendMessage,
  updateMessageStatus,
  updateConversationStatus,
  updateAssignee,
  markConversationUnread,
  getAccountsByChannel,
} from '../data/mockRepository';

export function useConversation(conversationId: string | null) {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const conversation = useMemo(
    () => (conversationId ? getConversationById(conversationId) : undefined),
    [conversationId],
  );

  const contact = useMemo(
    () => (conversationId ? getContactByConversationId(conversationId) : undefined),
    [conversationId],
  );

  const messages = useMemo(
    () => (conversationId ? getMessagesByConversationId(conversationId) : []),
    [conversationId],
  );

  const [selectedChannel, setSelectedChannel] = useState<Channel>('whatsapp');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-wa-primary');
  const [composerText, setComposerText] = useState('');

  const availableAccounts = useMemo(() => {
    return getAccountsByChannel(selectedChannel).filter((a) => a.status === 'connected');
  }, [selectedChannel]);

  const selectedAccount = useMemo(() => {
    return availableAccounts.find((a) => a.id === selectedAccountId);
  }, [availableAccounts, selectedAccountId]);

  const handleSend = useCallback(() => {
    if (!conversationId || !composerText.trim()) return;

    const msg = sendMessage(
      conversationId,
      selectedChannel,
      composerText.trim(),
      selectedAccountId,
      selectedAccount?.displayName || 'Agent',
      selectedAccount?.identifier || '',
    );

    setComposerText('');
    refresh();

    // Simulate delivery
    setTimeout(() => {
      updateMessageStatus(msg.id, 'sent');
      refresh();
    }, 800);

    setTimeout(() => {
      updateMessageStatus(msg.id, 'delivered');
      refresh();
    }, 2000);

    setTimeout(() => {
      updateMessageStatus(msg.id, 'read');
      refresh();
    }, 4000);

    return msg;
  }, [conversationId, composerText, selectedChannel, selectedAccountId, selectedAccount, refresh]);

  const handleRetry = useCallback(
    (messageId: string) => {
      updateMessageStatus(messageId, 'sending');
      refresh();
      setTimeout(() => {
        updateMessageStatus(messageId, 'sent');
        refresh();
      }, 1000);
      setTimeout(() => {
        updateMessageStatus(messageId, 'delivered');
        refresh();
      }, 2500);
      setTimeout(() => {
        updateMessageStatus(messageId, 'read');
        refresh();
      }, 4000);
    },
    [refresh],
  );

  const handleStatusChange = useCallback(
    (status: ConversationStatus) => {
      if (!conversationId) return;
      updateConversationStatus(conversationId, status);
      refresh();
    },
    [conversationId, refresh],
  );

  const handleAssigneeChange = useCallback(
    (assignee: string) => {
      if (!conversationId) return;
      updateAssignee(conversationId, assignee);
      refresh();
    },
    [conversationId, refresh],
  );

  const handleMarkUnread = useCallback(() => {
    if (!conversationId) return;
    markConversationUnread(conversationId);
    refresh();
  }, [conversationId, refresh]);

  const handleChannelSwitch = useCallback(
    (channel: Channel) => {
      setSelectedChannel(channel);
      const accounts = getAccountsByChannel(channel).filter((a) => a.status === 'connected');
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
      setComposerText('');
    },
    [],
  );

  return {
    conversation,
    contact,
    messages,
    selectedChannel,
    selectedAccountId,
    selectedAccount,
    composerText,
    setComposerText,
    availableAccounts,
    handleSend,
    handleRetry,
    handleStatusChange,
    handleAssigneeChange,
    handleMarkUnread,
    handleChannelSwitch,
    setSelectedAccountId,
    refresh,
  };
}
