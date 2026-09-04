import { AlertTriangle, Mail, Wifi, UserX } from 'lucide-react';
import type { AttentionReason } from '../../types';

type AttentionBannerProps = {
  reason: AttentionReason;
  onSwitchToEmail?: () => void;
  onReconnect?: () => void;
  onCreateContact?: () => void;
};

const reasonConfig: Record<
  AttentionReason,
  { title: string; description: string; icon: typeof AlertTriangle }
> = {
  reply_unavailable: {
    title: 'Reply window expired',
    description: 'This WhatsApp conversation is outside the 24-hour reply window. Send a template message or switch to another channel.',
    icon: AlertTriangle,
  },
  message_failed: {
    title: 'Message failed to send',
    description: 'The last message could not be delivered. You can retry sending or switch channels.',
    icon: AlertTriangle,
  },
  account_disconnected: {
    title: 'Account disconnected',
    description: 'One of the connected accounts is no longer active. Reconnect before sending messages from this identity.',
    icon: Wifi,
  },
  unknown_contact: {
    title: 'Unknown contact',
    description: 'This contact is not yet in your system. Create a contact to start tracking their history.',
    icon: UserX,
  },
};

export function AttentionBanner({
  reason,
  onSwitchToEmail,
  onReconnect,
  onCreateContact,
}: AttentionBannerProps) {
  const config = reasonConfig[reason];
  const Icon = config.icon;

  const handleAction = () => {
    switch (reason) {
      case 'reply_unavailable': onSwitchToEmail?.(); break;
      case 'account_disconnected': onReconnect?.(); break;
      case 'unknown_contact': onCreateContact?.(); break;
    }
  };

  return (
    <div className="mx-5 mb-2 bg-warning-dim border border-warning/20 rounded-md px-3 py-2.5 flex items-start gap-2.5 animate-slide-up">
      <Icon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-text-primary">{config.title}</p>
        <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">{config.description}</p>
      </div>
      {reason === 'reply_unavailable' && onSwitchToEmail && (
        <button
          onClick={handleAction}
          className="shrink-0 flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded text-[10px] font-medium text-text-secondary hover:bg-hover transition-colors"
        >
          <Mail className="w-3 h-3 text-channel-email" />
          Switch to Email
        </button>
      )}
      {reason === 'account_disconnected' && onReconnect && (
        <button
          onClick={handleAction}
          className="shrink-0 flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded text-[10px] font-medium text-text-secondary hover:bg-hover transition-colors"
        >
          <Wifi className="w-3 h-3 text-accent" />
          Reconnect
        </button>
      )}
      {reason === 'unknown_contact' && onCreateContact && (
        <button
          onClick={handleAction}
          className="shrink-0 flex items-center gap-1 px-2 py-1 bg-accent text-white rounded text-[10px] font-medium hover:bg-accent-hover transition-colors"
        >
          Create contact
        </button>
      )}
    </div>
  );
}
