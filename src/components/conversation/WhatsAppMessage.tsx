import type { Message, WhatsAppMetadata } from '../../types';
import { formatTimestamp } from '../../utils/formatting';
import { MessageCircle, Check, CheckCheck, AlertTriangle, RotateCcw, Paperclip } from 'lucide-react';

type WhatsAppMessageProps = {
  message: Message;
  onRetry: (messageId: string) => void;
};

function DeliveryIcon({ status }: { status?: string }) {
  if (status === 'failed') {
    return <AlertTriangle className="w-3 h-3 text-error" />;
  }
  if (status === 'read') {
    return <CheckCheck className="w-3 h-3 text-blue-500" />;
  }
  if (status === 'delivered') {
    return <CheckCheck className="w-3 h-3 text-text-tertiary" />;
  }
  if (status === 'sent') {
    return <Check className="w-3 h-3 text-text-tertiary" />;
  }
  return null;
}

export function WhatsAppMessage({ message, onRetry }: WhatsAppMessageProps) {
  const meta = message.metadata as WhatsAppMetadata | undefined;
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div className="rounded-lg border border-border-light bg-white overflow-hidden">
      <div className="px-4 py-3">
        {/* Sender info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-[#25d366]" />
            <span className="text-[11px] font-medium text-text-primary">
              {message.senderName}
            </span>
            <span className="text-[10px] text-text-tertiary">
              {meta?.phoneNumber || message.senderIdentifier}
            </span>
          </div>
          <span className="text-[10px] text-text-tertiary tabular-nums">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* Message body */}
        <p className="text-[12.5px] text-text-primary leading-relaxed">{message.body}</p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1.5">
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

      {/* WhatsApp delivery status */}
      {isOutgoing && (
        <div className="px-4 py-2 border-t border-border-light flex items-center gap-1.5">
          <MessageCircle className="w-3 h-3 text-[#25d366]" />
          <span className="text-[10px] text-text-tertiary">{message.senderIdentifier}</span>
          <div className="ml-auto flex items-center gap-1.5">
            {message.status === 'failed' ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-error font-medium">Failed to send</span>
                <button
                  onClick={() => onRetry(message.id)}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-accent hover:bg-accent-light rounded transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            ) : (
              <>
                <DeliveryIcon status={meta?.deliveryStatus || message.status} />
                <span className="text-[10px] text-text-tertiary capitalize">
                  {meta?.deliveryStatus || message.status}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
