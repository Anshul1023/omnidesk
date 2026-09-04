import type { Channel } from './message';

export type ConnectedAccount = {
  id: string;
  channel: Channel;
  displayName: string;
  identifier: string;
  status: 'connected' | 'disconnected';
};
