import type { Message, InstagramMetadata } from '../../types';
import { formatTimestamp } from '../../utils/formatting';
import { Camera, Image as ImageIcon } from 'lucide-react';

type InstagramMessageProps = {
  message: Message;
};

export function InstagramMessage({ message }: InstagramMessageProps) {
  const meta = message.metadata as InstagramMetadata | undefined;
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div className="rounded-lg border border-border-light bg-white overflow-hidden">
      {/* Instagram-specific header for story replies */}
      {meta?.storyReply && (
        <div className="px-3 py-1.5 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-border-light flex items-center gap-2">
          <span className="text-[10px] font-medium text-[#e1306c]">Story Reply</span>
          <div className="flex-1 h-px bg-pink-100" />
        </div>
      )}

      <div className="px-4 py-3">
        {/* Sender info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-[#e1306c]" />
            <span className="text-[11px] font-medium text-text-primary">
              {message.senderName}
            </span>
            <span className="text-[10px] text-text-tertiary">{meta?.handle || meta?.profileName}</span>
          </div>
          <span className="text-[10px] text-text-tertiary tabular-nums">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* Story thumbnail for story replies */}
        {meta?.storyReply && message.attachments && (
          <div className="mb-3">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="w-32 h-44 bg-gradient-to-b from-purple-100 via-pink-100 to-orange-100 rounded-lg flex items-center justify-center border border-border-light"
              >
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 text-pink-300 mx-auto mb-1" />
                  <span className="text-[9px] text-pink-400">{att.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message body */}
        <p className={`text-[12.5px] leading-relaxed ${isOutgoing ? 'text-text-primary' : 'text-text-primary'}`}>
          {message.body}
        </p>

        {/* Reaction */}
        {meta?.reaction && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[14px]">{meta.reaction}</span>
            <span className="text-[10px] text-text-tertiary">Reaction</span>
          </div>
        )}
      </div>

      {/* Instagram account info */}
      {isOutgoing && (
        <div className="px-4 py-2 border-t border-border-light flex items-center gap-1.5">
          <Camera className="w-3 h-3 text-[#e1306c]" />
          <span className="text-[10px] text-text-tertiary">{message.senderIdentifier}</span>
          {message.status && (
            <span className="text-[10px] text-text-tertiary capitalize ml-auto">{message.status}</span>
          )}
        </div>
      )}
    </div>
  );
}
