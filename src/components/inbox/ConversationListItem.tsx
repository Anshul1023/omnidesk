import type { Conversation, Contact } from '../../types';
import { Avatar } from '../shared/Avatar';
import { Mail, Camera, MessageCircle } from 'lucide-react';
import { formatTimeAgo, truncate } from '../../utils/formatting';
import { getMessagesByConversationId } from '../../data/mockRepository';

type ConversationListItemProps = {
  conversation: Conversation;
  contact: Contact;
  isSelected: boolean;
  lastMessage?: string;
  onSelect: (id: string) => void;
};

const channelIcons: Record<string, { icon: typeof Mail; color: string }> = {
  email: { icon: Mail, color: 'text-[#F87171]' },
  instagram: { icon: Camera, color: 'text-[#E879A8]' },
  whatsapp: { icon: MessageCircle, color: 'text-[#4ADE80]' },
};

export function ConversationListItem({
  conversation,
  contact,
  isSelected,
  lastMessage,
  onSelect,
}: ConversationListItemProps) {
  const preview =
    lastMessage ||
    (() => {
      const msgs = getMessagesByConversationId(conversation.id);
      const last = msgs[msgs.length - 1];
      return last ? truncate(last.body, 45) : 'No messages yet';
    })();

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-l-2 ${
        isSelected
          ? 'bg-[#303844] border-l-[#4169A8]'
          : 'bg-transparent border-l-transparent hover:bg-[#2A2E35]'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar name={contact.name} size="lg" dark />
        {conversation.unread && (
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full border-2 border-[#24272B]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[13px] truncate ${
                conversation.unread ? 'font-semibold text-[#F3F4F6]' : 'font-medium text-[#A8ADB5]'
              }`}
            >
              {contact.name}
            </span>
            {/* Inline channel icons */}
            <div className="flex items-center gap-0.5 shrink-0">
              {conversation.channels.map((ch) => {
                const cfg = channelIcons[ch];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return <Icon key={ch} className={`w-3 h-3 ${cfg.color}`} />;
              })}
            </div>
          </div>
          <span className="text-[10.5px] text-[#737982] shrink-0 tabular-nums ml-2">
            {formatTimeAgo(conversation.lastMessageAt)}
          </span>
        </div>

        {/* Message preview */}
        <p
          className={`text-[11.5px] truncate mb-1.5 ${
            conversation.unread ? 'text-[#A8ADB5] font-medium' : 'text-[#737982]'
          }`}
        >
          {preview}
        </p>

        {/* Bottom row: priority + unread badge */}
        <div className="flex items-center justify-between">
          {conversation.priority === 'high' ? (
            <span className="text-[9.5px] font-semibold text-[#F87171] bg-[#3A2020] px-1.5 py-0.5 rounded">
              High
            </span>
          ) : conversation.status === 'pending' ? (
            <span className="text-[9.5px] font-medium text-[#FBBF24] bg-[#3A3020] px-1.5 py-0.5 rounded">
              Pending
            </span>
          ) : (
            <span />
          )}
          {conversation.unread && (
            <span className="min-w-[20px] h-[20px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {Math.floor(Math.random() * 5) + 1}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
