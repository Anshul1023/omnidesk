import { useState } from 'react';
import type { Contact, Conversation } from '../../types';
import { Avatar } from '../shared/Avatar';
import { Edit3, MoreHorizontal, CheckCircle2 } from 'lucide-react';

type ContactPanelProps = {
  contact: Contact;
  conversation: Conversation;
};

type Tab = 'contact' | 'activity';

const connectedAccounts = [
  { channel: 'email', identifier: 'support@acme.com', via: 'Email', connected: true },
  { channel: 'instagram', identifier: '@acmeindia', via: 'Instagram', connected: true },
  { channel: 'whatsapp', identifier: '+91 98765 43210', via: 'WhatsApp', connected: true },
];

const channelStyles: Record<string, { icon: string; color: string; bg: string }> = {
  email: { icon: '✉', color: 'text-[#F87171]', bg: 'bg-[#3A2020]' },
  instagram: { icon: '📸', color: 'text-[#E879A8]', bg: 'bg-[#3A2030]' },
  whatsapp: { icon: '💬', color: 'text-[#4ADE80]', bg: 'bg-[#1A3020]' },
};

export function ContactPanel({ contact }: ContactPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('contact');

  return (
    <aside className="w-[300px] h-full bg-[#24272B] border-l border-[#3A3F46] flex flex-col shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#3A3F46]">
        {(['contact', 'activity'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[12px] font-semibold transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-[#4169A8] text-[#F3F4F6]'
                : 'border-transparent text-[#737982] hover:text-[#A8ADB5]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'contact' ? (
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-5 py-4 text-center border-b border-[#3A3F46]">
            <div className="flex justify-center mb-2 relative">
              <Avatar name={contact.name} size="lg" dark />
              <button className="absolute bottom-0 right-[calc(50%-20px)] w-5 h-5 bg-[#30343A] border border-[#3A3F46] rounded-full flex items-center justify-center hover:bg-[#363B42] transition-colors">
                <Edit3 className="w-2.5 h-2.5 text-[#737982]" />
              </button>
            </div>
            <h3 className="text-[14px] font-semibold text-[#F3F4F6]">{contact.name}</h3>
            <span className="inline-block mt-1 text-[9.5px] font-semibold text-[#4169A8] bg-[#303844] px-2 py-0.5 rounded border border-[#314D82]">
              VIP Customer
            </span>

            {/* Channel icons row */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-10 h-10 rounded-full bg-[#30343A] border border-[#3A3F46] flex items-center justify-center text-sm text-[#A8ADB5] hover:bg-[#363B42] transition-colors cursor-pointer">
                ✉
              </div>
              <div className="w-10 h-10 rounded-full bg-[#30343A] border border-[#3A3F46] flex items-center justify-center text-sm text-[#A8ADB5] hover:bg-[#363B42] transition-colors cursor-pointer">
                📞
              </div>
              <div className="w-10 h-10 rounded-full bg-[#30343A] border border-[#3A3F46] flex items-center justify-center text-sm text-[#A8ADB5] hover:bg-[#363B42] transition-colors cursor-pointer">
                📸
              </div>
              <div className="w-10 h-10 rounded-full bg-[#30343A] border border-[#3A3F46] flex items-center justify-center text-sm text-[#A8ADB5] hover:bg-[#363B42] transition-colors cursor-pointer">
                💬
              </div>
            </div>
          </div>

          {/* About */}
          <Section title="About">
            <div className="space-y-2">
              <InfoRow label="Customer since" value={contact.customerSince} />
              <InfoRow label="Total conversations" value="8" />
              <InfoRow label="Last activity" value="2 minutes ago" />
              <InfoRow label="Priority" value={contact.priority === 'high' ? 'High' : 'Normal'} valueColor={contact.priority === 'high' ? 'text-[#F87171]' : ''} />
            </div>
          </Section>

          {/* Connected accounts */}
          <div className="px-5 py-3 border-b border-[#3A3F46]">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737982]">Connected accounts</p>
              <button className="text-[10px] text-[#4169A8] font-medium">+ Add</button>
            </div>
            <div className="space-y-2.5">
              {connectedAccounts.map((acc, i) => {
                const style = channelStyles[acc.channel];
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${style.bg}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[#F3F4F6]">{acc.identifier}</p>
                      <p className="text-[9.5px] text-[#737982]">{acc.via}</p>
                    </div>
                    {acc.connected && <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="px-5 py-3 border-b border-[#3A3F46]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737982]">Notes</p>
              <button className="text-[10px] text-[#4169A8] font-medium">+ Add note</button>
            </div>
            <div className="bg-[#30343A] rounded-md p-3 border border-[#3A3F46]">
              <div className="flex items-start justify-between">
                <p className="text-[11px] text-[#A8ADB5] leading-relaxed">
                  {contact.agentNote || 'No notes yet.'}
                </p>
                <button className="p-0.5 text-[#737982] hover:text-[#A8ADB5]">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-[#737982] mt-1.5">May 23, 2024 · Arjun Mehta</p>
            </div>
          </div>

          {/* Tags */}
          <div className="px-5 py-3 border-b border-[#3A3F46]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737982]">Tags</p>
              <button className="text-[10px] text-[#4169A8] font-medium">+ Add tag</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 text-[10.5px] font-medium rounded-md border border-[#3A3F46] text-[#A8ADB5] bg-[#30343A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Previous tickets */}
          <div className="px-5 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737982]">Previous tickets</p>
              <button className="text-[10px] text-[#4169A8] font-medium">View all →</button>
            </div>
            <div className="bg-[#30343A] rounded-md p-3 border border-[#3A3F46]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-[#F3F4F6]">#TK-2456</span>
                <span className="text-[9px] font-semibold text-[#34D399] bg-[#1A3020] px-1.5 py-0.5 rounded border border-[#34D399]/20">Resolved</span>
              </div>
              <p className="text-[10.5px] text-[#A8ADB5]">Payment failed during checkout</p>
              <p className="text-[9px] text-[#737982] mt-1">Apr 30, 2024</p>
            </div>
          </div>
        </div>
      ) : (
        /* Activity tab */
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            {[
              { time: '2 min ago', text: 'Opened conversation via WhatsApp', icon: '💬' },
              { time: '1 hour ago', text: 'Sent email reply regarding subscription', icon: '✉' },
              { time: '3 hours ago', text: 'Replied to Instagram story', icon: '📸' },
              { time: '1 day ago', text: 'Created support ticket #TK-2456', icon: '🎫' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm mt-0.5">{activity.icon}</span>
                <div>
                  <p className="text-[11.5px] text-[#A8ADB5]">{activity.text}</p>
                  <p className="text-[10px] text-[#737982]">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-b border-[#3A3F46]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737982] mb-2.5">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[#737982]">{label}</span>
      <span className={`text-[11px] font-medium ${valueColor || 'text-[#F3F4F6]'}`}>{value}</span>
    </div>
  );
}
