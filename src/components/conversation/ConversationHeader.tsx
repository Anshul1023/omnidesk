import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  MoreHorizontal,
  Star,
  CheckCircle2,
  Clock,
  EyeOff,
} from 'lucide-react';
import type { Conversation, ConversationStatus } from '../../types';
import type { Contact } from '../../types';
import { Avatar } from '../shared/Avatar';

type ConversationHeaderProps = {
  conversation: Conversation;
  contact: Contact;
  onStatusChange: (status: ConversationStatus) => void;
  onAssigneeChange: (assignee: string) => void;
  onMarkUnread: () => void;
};

const statusConfig: Record<
  ConversationStatus,
  { color: string; bg: string; border: string; text: string }
> = {
  open: { color: 'text-[#34D399]', bg: 'bg-[#1A3020]', border: 'border-[#34D399]/30', text: 'Open' },
  pending: { color: 'text-[#FBBF24]', bg: 'bg-[#3A3020]', border: 'border-[#FBBF24]/30', text: 'Pending' },
  resolved: { color: 'text-[#34D399]', bg: 'bg-[#1A3020]', border: 'border-[#34D399]/30', text: 'Resolved' },
};

export function ConversationHeader({
  conversation,
  contact,
  onStatusChange,

  onMarkUnread,
}: ConversationHeaderProps) {
  const [showStatus, setShowStatus] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatus(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const sConfig = statusConfig[conversation.status];

  return (
    <div className="px-5 py-3 border-b border-[#3A3F46] bg-[#2B2F34]">
      <div className="flex items-center gap-3">
        {/* Avatar + Info */}
        <Avatar name={contact.name} size="lg" dark />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#F3F4F6]">{contact.name}</h3>
            <button className="text-[#FBBF24] hover:text-[#FCD34D] transition-colors">
              <Star className="w-4 h-4 fill-current" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {contact.email && (
              <span className="text-[11px] text-[#737982]">{contact.email}</span>
            )}
            {contact.phone && (
              <>
                <span className="text-[#737982]">·</span>
                <span className="text-[11px] text-[#737982]">{contact.phone}</span>
              </>
            )}
            {contact.instagramHandle && (
              <>
                <span className="text-[#737982]">·</span>
                <span className="text-[11px] text-[#737982]">{contact.instagramHandle}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Status badge */}
          <div ref={statusRef} className="relative">
            <button
              onClick={() => setShowStatus(!showStatus)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11.5px] font-semibold border transition-colors ${sConfig.bg} ${sConfig.color} ${sConfig.border}`}
            >
              {sConfig.text}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showStatus && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-[#30343A] border border-[#3A3F46] rounded-md shadow-lg z-30 py-1">
                {(['open', 'pending', 'resolved'] as ConversationStatus[]).map((s) => {
                  const cfg = statusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => { onStatusChange(s); setShowStatus(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                        conversation.status === s ? 'bg-[#363B42] text-[#F3F4F6]' : 'text-[#A8ADB5] hover:bg-[#363B42]'
                      }`}
                    >
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* More actions */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="p-1.5 rounded text-[#737982] hover:text-[#A8ADB5] hover:bg-[#363B42] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMore && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-[#30343A] border border-[#3A3F46] rounded-md shadow-lg z-30 py-1">
                <button
                  onClick={() => { onMarkUnread(); setShowMore(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-[#A8ADB5] hover:bg-[#363B42] transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Mark as unread
                </button>
              </div>
            )}
          </div>

          <button className="p-1.5 rounded text-[#737982] hover:text-[#A8ADB5] hover:bg-[#363B42] transition-colors">
            <Clock className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-[#A8ADB5] border border-[#3A3F46] hover:border-[#4B515A] hover:bg-[#363B42] transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark as resolved
          </button>
        </div>
      </div>
    </div>
  );
}
