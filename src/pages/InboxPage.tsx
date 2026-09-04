import { useCallback } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { FilterPanel } from '../components/filters/FilterPanel';
import { ConversationList } from '../components/inbox/ConversationList';
import { ConversationHeader } from '../components/conversation/ConversationHeader';
import { UnifiedTimeline } from '../components/conversation/UnifiedTimeline';
import { Composer } from '../components/composer/Composer';
import { ContactPanel } from '../components/contact/ContactPanel';
import { AttentionBanner } from '../components/shared/AttentionBanner';
import { ToastContainer, showToast } from '../components/shared/Toast';
import { useInbox } from '../hooks/useInbox';
import { useConversation } from '../hooks/useConversation';
import { MessageSquare } from 'lucide-react';

export function InboxPage() {
  const {
    conversations,
    selectedConversationId,
    sidebarView,
    setSidebarView,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectConversation,
  } = useInbox();

  const {
    conversation,
    contact,
    messages,
    selectedChannel,
    selectedAccountId,
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
  } = useConversation(selectedConversationId);

  const handleSendWithToast = useCallback(() => {
    const msg = handleSend();
    if (msg) {
      showToast(`Message sent via ${selectedChannel}`, 'success');
    }
  }, [handleSend, selectedChannel]);

  const handleSwitchToEmail = useCallback(() => {
    handleChannelSwitch('email');
    showToast('Switched to Email', 'info');
  }, [handleChannelSwitch]);

  return (
    <div className="h-screen flex bg-bg overflow-hidden">
      {/* Left navigation */}
      <Sidebar currentView={sidebarView} onViewChange={setSidebarView} />

      {/* Filter panel */}
      <FilterPanel filter={filter} onFilterChange={setFilter} />

      {/* Conversation list */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversationId}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sidebarView={sidebarView}
        onSelect={selectConversation}
      />

      {/* Main conversation area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#2B2F34]">
        {selectedConversationId && conversation && contact ? (
          <>
            <ConversationHeader
              conversation={conversation}
              contact={contact}
              onStatusChange={handleStatusChange}
              onAssigneeChange={handleAssigneeChange}
              onMarkUnread={handleMarkUnread}
            />
            {conversation.needsAttention && (
              <AttentionBanner
                reason={conversation.needsAttention}
                onSwitchToEmail={handleSwitchToEmail}
                onReconnect={() => showToast('Account reconnected!', 'success')}
                onCreateContact={() => showToast('Contact created!', 'success')}
              />
            )}
            <UnifiedTimeline messages={messages} onRetry={handleRetry} />
            <Composer
              selectedChannel={selectedChannel}
              selectedAccountId={selectedAccountId}
              availableAccounts={availableAccounts}
              composerText={composerText}
              onTextChange={setComposerText}
              onSend={handleSendWithToast}
              onChannelSwitch={handleChannelSwitch}
              onAccountSwitch={setSelectedAccountId}
              contact={contact}
              replyUnavailable={conversation.needsAttention === 'reply_unavailable' && selectedChannel === 'whatsapp'}
              onSwitchToEmail={handleSwitchToEmail}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3 border border-border-subtle">
                <MessageSquare className="w-7 h-7 text-text-muted" />
              </div>
              <h3 className="text-[14px] font-semibold text-text-secondary mb-1">
                Welcome to OmniDesk
              </h3>
              <p className="text-[11.5px] text-text-muted max-w-xs">
                Select a conversation from the list to view the unified cross-channel timeline.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contact panel */}
      {selectedConversationId && contact && conversation && (
        <ContactPanel contact={contact} conversation={conversation} />
      )}

      <ToastContainer />
    </div>
  );
}
