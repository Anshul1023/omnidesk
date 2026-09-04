import type { Message, EmailMetadata } from '../../types';
import { formatTimestamp } from '../../utils/formatting';
import { Mail, Paperclip } from 'lucide-react';

type EmailMessageProps = {
  message: Message;
};

export function EmailMessage({ message }: EmailMessageProps) {
  const meta = message.metadata as EmailMetadata | undefined;
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isOutgoing
          ? 'bg-white border-border-light'
          : 'bg-white border-border-light'
      }`}
    >
      {/* Email header */}
      <div className="px-4 py-3 border-b border-border-light">
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <p className="text-[12px] font-semibold text-text-primary">
              {meta?.subject || 'No subject'}
            </p>
          </div>
          <span className="text-[10px] text-text-tertiary tabular-nums shrink-0 ml-3">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-[11px] text-text-secondary">
            <span className="text-text-tertiary">From: </span>
            {message.senderName} &lt;{message.senderIdentifier}&gt;
          </p>
          {meta?.to && (
            <p className="text-[11px] text-text-secondary">
              <span className="text-text-tertiary">To: </span>
              {meta.to.join(', ')}
            </p>
          )}
          {meta?.cc && meta.cc.length > 0 && (
            <p className="text-[11px] text-text-secondary">
              <span className="text-text-tertiary">CC: </span>
              {meta.cc.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Email body */}
      <div className="px-4 py-3">
        <div className="text-[12px] text-text-primary leading-relaxed whitespace-pre-wrap">
          {message.body}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-border-light"
              >
                <Paperclip className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-[11px] text-text-secondary">{att.name}</span>
                <span className="text-[10px] text-text-tertiary">{att.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email actions */}
      {isOutgoing && (
        <div className="px-4 py-2 border-t border-border-light flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-text-tertiary" />
            <span className="text-[10px] text-text-tertiary">{message.senderIdentifier}</span>
          </div>
          {message.status && (
            <span className="text-[10px] text-text-tertiary capitalize">{message.status}</span>
          )}
        </div>
      )}
    </div>
  );
}
