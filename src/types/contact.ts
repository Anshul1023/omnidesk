export type Contact = {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  instagramHandle?: string;
  customerSince: string;
  tags: string[];
  priority: 'normal' | 'high';
  agentNote?: string;
  lastPurchase?: string;
};
