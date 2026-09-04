export type Channel = 'email' | 'instagram' | 'whatsapp';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type AttentionReason =
  | 'reply_unavailable'
  | 'message_failed'
  | 'account_disconnected'
  | 'unknown_contact';

export type EmailMetadata = {
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
};

export type InstagramMetadata = {
  handle: string;
  profileName: string;
  storyReply?: boolean;
  sharedPost?: boolean;
  reaction?: string;
};

export type WhatsAppMetadata = {
  phoneNumber: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
};

export type MessageMetadata = EmailMetadata | InstagramMetadata | WhatsAppMetadata;

export type Attachment = {
  id: string;
  name: string;
  type: 'image' | 'file' | 'audio' | 'video';
  size: string;
  url?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  channel: Channel;
  direction: 'incoming' | 'outgoing';
  senderName: string;
  senderIdentifier?: string;
  recipientIdentifier?: string;
  connectedAccountId: string;
  timestamp: string;
  body: string;
  status?: MessageStatus;
  attachments?: Attachment[];
  metadata?: MessageMetadata;
};
