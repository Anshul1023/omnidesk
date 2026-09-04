import {
  Inbox,
  AtSign,
  Contact,
  ChevronDown,
} from 'lucide-react';
import type { InboxView } from '../../hooks/useInbox';

type SidebarProps = {
  currentView: InboxView;
  onViewChange: (view: InboxView) => void;
};

const viewItems = [
  { label: 'Unassigned', count: 12, icon: '👤' },
  { label: 'My open', count: 16, icon: '📋' },
  { label: 'Waiting on customer', count: 5, icon: '⏳' },
  { label: 'Needs attention', count: 4, icon: '⚠️', highlight: true },
  { label: 'Resolved', count: 24, icon: '✅' },
  { label: 'Snoozed', count: 7, icon: '😴' },
];

const channelItems = [
  { label: 'Email', icon: '✉', color: 'text-[#F87171]', count: 12 },
  { label: 'Instagram', icon: '📸', color: 'text-[#E879A8]', count: 8 },
  { label: 'WhatsApp', icon: '💬', color: 'text-[#4ADE80]', count: 12 },
];

const teamItems = [
  { label: 'Support', color: 'bg-[#34D399]', count: 12 },
  { label: 'Sales', color: 'bg-[#60A5FA]', count: 6 },
  { label: 'Billing', color: 'bg-[#FBBF24]', count: 4 },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-[210px] h-full bg-[#1E2125] flex flex-col shrink-0 border-r border-[#3A3F46]">
      {/* Brand */}
      <div className="px-4 py-3 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#4169A8] flex items-center justify-center">
          <span className="text-white text-[13px] font-bold">C</span>
        </div>
        <span className="text-[14px] font-semibold text-[#F3F4F6] tracking-tight">OmniDesk</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto">
        {/* Main nav */}
        <div className="mb-3">
          <button
            onClick={() => onViewChange('all')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium transition-all ${
              currentView === 'all'
                ? 'bg-[#303844] text-[#F3F4F6] border border-[#314D82]'
                : 'text-[#A8ADB5] hover:bg-[#2A2E35] border border-transparent'
            }`}
          >
            <Inbox className="w-4 h-4 shrink-0" strokeWidth={currentView === 'all' ? 2.5 : 2} />
            <span>Inbox</span>
            <span className="ml-auto text-[10px] text-[#737982] bg-[#30343A] px-1.5 py-0.5 rounded">24</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-[#A8ADB5] hover:bg-[#2A2E35] border border-transparent transition-all">
            <AtSign className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>Mentions</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-[#A8ADB5] hover:bg-[#2A2E35] border border-transparent transition-all">
            <Contact className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>All conversations</span>
          </button>
        </div>

        {/* Views */}
        <div className="mb-3">
          <p className="px-2.5 mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-[#737982]">
            Views
          </p>
          <ul className="space-y-px">
            {viewItems.map((item) => (
              <li key={item.label}>
                <button className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11.5px] transition-colors ${
                  item.highlight ? 'text-[#FBBF24] hover:bg-[#2A2E35]' : 'text-[#A8ADB5] hover:bg-[#2A2E35]'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="text-xs">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#737982] tabular-nums">{item.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Channels */}
        <div className="mb-3">
          <p className="px-2.5 mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-[#737982]">
            Channels
          </p>
          <ul className="space-y-px">
            {channelItems.map((item) => (
              <li key={item.label}>
                <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11.5px] text-[#A8ADB5] hover:bg-[#2A2E35] transition-colors">
                  <span className="flex items-center gap-2">
                    <span className="text-xs">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#737982] tabular-nums">{item.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Teams */}
        <div className="mb-3">
          <p className="px-2.5 mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-[#737982]">
            Teams
          </p>
          <ul className="space-y-px">
            {teamItems.map((item) => (
              <li key={item.label}>
                <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11.5px] text-[#A8ADB5] hover:bg-[#2A2E35] transition-colors">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#737982] tabular-nums">{item.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Bottom workspace */}
      <div className="px-3 py-2.5 border-t border-[#3A3F46]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[#F3F4F6]">Acme Support</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#737982]" />
        </div>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[10px] text-[#737982]">3 members online</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-[#243B68] flex items-center justify-center text-[8px] font-semibold text-[#8BACD8]">S</div>
          <div className="w-6 h-6 rounded-full bg-[#4A2545] flex items-center justify-center text-[8px] font-semibold text-[#D8A0C8]">A</div>
          <div className="w-6 h-6 rounded-full bg-[#1A3A2A] flex items-center justify-center text-[8px] font-semibold text-[#80D8A8]">R</div>
          <span className="text-[9px] text-[#737982] ml-0.5">+2</span>
        </div>
      </div>

      {/* Agent profile */}
      <div className="px-3 py-2.5 border-t border-[#3A3F46]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#4169A8] flex items-center justify-center text-[10px] font-semibold text-white">
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-[#F3F4F6] truncate">Arjun Mehta</p>
            <p className="text-[9.5px] text-[#737982]">Support Agent</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#737982]" />
        </div>
      </div>
    </aside>
  );
}
