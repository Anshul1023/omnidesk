import { Mail, Camera, MessageCircle } from 'lucide-react';
import type { Channel } from '../../types';

type ChannelBadgeProps = {
  channel: Channel;
  size?: 'sm' | 'md';
};

const channelConfig: Record<Channel, { icon: typeof Mail; color: string; label: string }> = {
  email: { icon: Mail, color: 'text-[#e74c3c]', label: 'Email' },
  instagram: { icon: Camera, color: 'text-[#e1306c]', label: 'Instagram' },
  whatsapp: { icon: MessageCircle, color: 'text-[#25d366]', label: 'WhatsApp' },
};

export function ChannelBadge({ channel, size = 'sm' }: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.color}`}
      title={config.label}
    >
      <Icon className={sizeClasses} strokeWidth={2} />
    </span>
  );
}

export function ChannelIndicator({ channel }: { channel: Channel }) {
  const config = channelConfig[channel];
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-text-secondary">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor:
            channel === 'email' ? '#e74c3c' : channel === 'instagram' ? '#e1306c' : '#25d366',
        }}
      />
      {config.label}
    </span>
  );
}
