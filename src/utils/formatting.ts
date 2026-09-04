import type { Channel } from '../types';

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function channelLabel(channel: Channel): string {
  switch (channel) {
    case 'email':
      return 'Email';
    case 'instagram':
      return 'Instagram';
    case 'whatsapp':
      return 'WhatsApp';
  }
}

export function channelColor(channel: Channel): string {
  switch (channel) {
    case 'email':
      return '#e74c3c';
    case 'instagram':
      return '#e1306c';
    case 'whatsapp':
      return '#25d366';
  }
}

export function channelBgColor(channel: Channel): string {
  switch (channel) {
    case 'email':
      return '#fef2f2';
    case 'instagram':
      return '#fdf2f8';
    case 'whatsapp':
      return '#f0fdf4';
  }
}

export function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trim() + '…';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
