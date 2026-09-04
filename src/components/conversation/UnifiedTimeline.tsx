import { useRef, useEffect, useState } from 'react';
import type { Message, Channel } from '../../types';
import { isSameDay } from '../../utils/formatting';
import { Mail, Camera, MessageCircle, MoreHorizontal, Paperclip } from 'lucide-react';

type UnifiedTimelineProps = {
  messages: Message[];
  onRetry: (messageId: string) => void;
};

const channelConfig: Record<Channel, { icon: typeof Mail; color: string; bg: string; label: string; iconBg: string }> = {
  email: { icon: Mail, color: 'text-[#F87171]', bg: 'bg-[#3A2020]', label: 'Email', iconBg: 'bg-[#3A2020]' },
  instagram: { icon: Camera, color: 'text-[#E879A8]', bg: 'bg-[#3A2030]', label: 'Instagram', iconBg: 'bg-[#3A2030]' },
  whatsapp: { icon: MessageCircle, color: 'text-[#4ADE80]', bg: 'bg-[#1A3020]', label: 'WhatsApp', iconBg: 'bg-[#1A3020]' },
};

const tabs: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'email', label: 'Email' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

function DeliveryStatusIcon({ status }: { status?: string }) {
  if (status === 'read') return <span className="text-accent text-[11px] font-medium">✓✓</span>;
  if (status === 'delivered') return <span className="text-[#737982] text-[11px]">✓✓</span>;
  if (status === 'sent') return <span className="text-[#737982] text-[11px]">✓</span>;
  return null;
}

export function UnifiedTimeline({ messages, onRetry }: UnifiedTimelineProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const filteredMessages = activeTab === 'all'
    ? messages
    : messages.filter((m) => m.channel === activeTab);

  const grouped: { date: string; messages: Message[] }[] = [];
  let currentGroup: { date: string; messages: Message[] } | null = null;

  for (const msg of filteredMessages) {
    if (!currentGroup || !isSameDay(currentGroup.messages[0].timestamp, msg.timestamp)) {
      currentGroup = { date: msg.timestamp, messages: [msg] };
      grouped.push(currentGroup);
    } else {
      currentGroup.messages.push(msg);
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#2B2F34]">
      {/* Channel tabs */}
      <div className="sticky top-0 bg-[#2B2F34] z-10 border-b border-[#3A3F46]">
        <div className="px-5 flex items-center gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[12px] font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#4169A8] text-[#F3F4F6]'
                  : 'border-transparent text-[#737982] hover:text-[#A8ADB5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button className="ml-auto text-[11px] text-[#737982] hover:text-[#4169A8] font-medium transition-colors">
            + Add note
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="px-5 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {grouped.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4 first:mt-0">
                <span className="text-[11px] font-medium text-[#737982]">
                  {formatDateLabel(group.date)}
                </span>
                <div className="flex-1 h-px bg-[#3A3F46]" />
              </div>

              {/* Messages */}
              {group.messages.map((msg) => {
                const config = channelConfig[msg.channel];
                const Icon = config.icon;
                const isIncoming = msg.direction === 'incoming';

                return (
                  <div key={msg.id} className="mb-2">
                    <div className="flex items-start gap-3 bg-[#30343A] rounded-lg p-3 border border-[#3A3F46]">
                      {/* Channel icon circle */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>

                      {/* Message content */}
                      <div className="flex-1 min-w-0">
                        {/* Sender info row */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-semibold text-[#F3F4F6]">{config.label}</span>
                            <span className="text-[10px] text-[#737982]">·</span>
                            <span className="text-[11px] text-[#737982]">{msg.senderIdentifier}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#737982] tabular-nums">{formatTime(msg.timestamp)}</span>
                            <button className="p-0.5 text-[#737982] hover:text-[#A8ADB5] rounded transition-colors">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Email subject */}
                        {msg.channel === 'email' && msg.metadata && 'subject' in msg.metadata && (
                          <p className="text-[12px] font-medium text-[#F3F4F6] mb-0.5">
                            {(msg.metadata as { subject: string }).subject}
                          </p>
                        )}

                        {/* Instagram story reply label */}
                        {msg.channel === 'instagram' && msg.metadata && 'storyReply' in msg.metadata && (msg.metadata as { storyReply?: boolean }).storyReply && (
                          <p className="text-[11px] font-medium text-[#E879A8] mb-0.5">Story reply</p>
                        )}

                        {/* Message body */}
                        <p className="text-[12.5px] text-[#A8ADB5] leading-relaxed">
                          {msg.body}
                        </p>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((att) => (
                              <div key={att.id} className="inline-flex items-center gap-2 px-3 py-2 bg-[#272B30] rounded-md border border-[#3A3F46] text-[11px] text-[#A8ADB5]">
                                <Paperclip className="w-3.5 h-3.5 text-[#737982]" />
                                <span className="font-medium">{att.name}</span>
                                <span className="text-[#737982]">·</span>
                                <span className="text-[#737982]">{att.size}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Instagram reaction */}
                        {msg.channel === 'instagram' && msg.metadata && 'reaction' in msg.metadata && (msg.metadata as { reaction?: string }).reaction && (
                          <span className="text-[12px] mt-1 inline-block">{(msg.metadata as { reaction: string }).reaction}</span>
                        )}

                        {/* Delivery status */}
                        {isIncoming === false && msg.channel === 'whatsapp' && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-[#737982] italic">Sent by You</span>
                          </div>
                        )}

                        {isIncoming === false && msg.status === 'failed' && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-[#F87171] font-medium">⚠ Failed to send</span>
                            <button
                              onClick={() => onRetry(msg.id)}
                              className="text-[10px] font-medium text-[#4169A8] hover:text-[#5580C0] transition-colors"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        {/* WhatsApp delivery */}
                        {isIncoming === false && msg.channel === 'whatsapp' && msg.status && msg.status !== 'failed' && (
                          <div className="flex items-center gap-1 mt-1">
                            <DeliveryStatusIcon status={msg.status} />
                            <span className="text-[10px] text-[#737982] capitalize">{msg.status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
