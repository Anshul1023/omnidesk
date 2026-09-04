import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Send,
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  Mail,
  Camera,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  Link,
} from 'lucide-react';
import type { Channel, ConnectedAccount } from '../../types';
import type { Contact } from '../../types';

type ComposerProps = {
  selectedChannel: Channel;
  selectedAccountId: string;
  availableAccounts: ConnectedAccount[];
  composerText: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
  onChannelSwitch: (channel: Channel) => void;
  onAccountSwitch: (accountId: string) => void;
  contact: Contact;
  replyUnavailable?: boolean;
  onSwitchToEmail?: () => void;
};

const channelBtnConfig: Record<Channel, { icon: typeof Mail; color: string; bg: string; border: string }> = {
  email: { icon: Mail, color: 'text-[#F87171]', bg: 'bg-[#3A2020]', border: 'border-[#F87171]/40' },
  instagram: { icon: Camera, color: 'text-[#E879A8]', bg: 'bg-[#3A2030]', border: 'border-[#E879A8]/40' },
  whatsapp: { icon: MessageCircle, color: 'text-[#4ADE80]', bg: 'bg-[#1A3020]', border: 'border-[#4ADE80]/40' },
};

export function Composer({
  selectedChannel,
  selectedAccountId,
  availableAccounts,
  composerText,
  onTextChange,
  onSend,
  onChannelSwitch,
  onAccountSwitch,
  contact,
  replyUnavailable,
  onSwitchToEmail,
}: ComposerProps) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showIdentityToast, setShowIdentityToast] = useState(false);
  const [identityText, setIdentityText] = useState('');
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setShowAccountMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedAccount = availableAccounts.find((a) => a.id === selectedAccountId);

  function handleAccountSwitch(id: string) {
    const acc = availableAccounts.find((a) => a.id === id);
    if (acc) {
      onAccountSwitch(id);
      setIdentityText(`You're now replying as ${acc.identifier}`);
      setShowIdentityToast(true);
      setTimeout(() => setShowIdentityToast(false), 2500);
    }
    setShowAccountMenu(false);
  }

  // Reply unavailable state
  if (replyUnavailable) {
    return (
      <div className="border-t border-[#3A3F46] bg-[#2B2F34]">
        <div className="px-5 py-3">
          <div className="bg-[#3A3020] border border-[#FBBF24]/20 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-[#F3F4F6] mb-0.5">Reply unavailable</p>
                <p className="text-[11px] text-[#A8ADB5] leading-relaxed mb-2">
                  This conversation is outside the available WhatsApp reply window. You can review
                  the conversation, but a normal reply cannot be sent from this account.
                </p>
                {onSwitchToEmail && (
                  <button
                    onClick={onSwitchToEmail}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#30343A] border border-[#3A3F46] rounded text-[11px] font-medium text-[#F3F4F6] hover:bg-[#363B42] transition-colors"
                  >
                    <Mail className="w-3 h-3 text-[#F87171]" />
                    Reply by Email
                    <ArrowRight className="w-3 h-3 text-[#737982]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {showIdentityToast && <IdentityToast text={identityText} />}
      </div>
    );
  }

  // Email composer
  if (selectedChannel === 'email') {
    return (
      <div className="border-t border-[#3A3F46] bg-[#2B2F34]">
        {/* Reply via + Reply as bar */}
        <div className="px-5 py-2 border-b border-[#3A3F46] flex items-center gap-3">
          <span className="text-[11px] text-[#737982]">Reply via</span>
          <ChannelButtons selected={selectedChannel} onSelect={onChannelSwitch} />
          <span className="text-[11px] text-[#737982] ml-2">Responding as</span>
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#A8ADB5] border border-[#3A3F46] hover:border-[#4B515A] transition-colors"
            >
              {selectedAccount?.identifier || 'Select account'}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showAccountMenu && (
              <div className="absolute bottom-full left-0 mb-1 w-52 bg-[#30343A] border border-[#3A3F46] rounded-md shadow-lg z-30 py-1">
                <p className="px-3 py-1 text-[9px] text-[#737982] font-semibold uppercase tracking-wider">Select account</p>
                {availableAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleAccountSwitch(acc.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                      selectedAccountId === acc.id ? 'bg-[#363B42] text-[#F3F4F6]' : 'text-[#A8ADB5] hover:bg-[#363B42]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedAccountId === acc.id ? 'bg-[#4169A8]' : 'bg-[#737982]'}`} />
                    {acc.identifier}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email fields */}
        <div className="px-5 py-1.5 space-y-0.5 border-b border-[#3A3F46]">
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-[#737982] w-12">To</span>
            <span className="text-[11px] text-[#A8ADB5]">{contact.name} &lt;{contact.email}&gt;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-[#737982] w-12">Subject</span>
            <span className="text-[11px] text-[#A8ADB5]">Re: Subscription question</span>
          </div>
        </div>

        {/* Rich text toolbar */}
        <div className="px-5 py-1.5 flex items-center gap-1 border-b border-[#3A3F46]">
          {[Bold, Italic, Underline, List, Link, Smile, Paperclip].map((Icon, i) => (
            <button key={i} className="p-1.5 text-[#737982] hover:text-[#A8ADB5] rounded transition-colors">
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="px-5 py-2">
          <textarea
            value={composerText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Write your email..."
            className="w-full h-16 bg-transparent text-[12.5px] text-[#F3F4F6] placeholder:text-[#737982] focus:outline-none resize-none"
          />
        </div>

        {/* Bottom bar */}
        <div className="px-5 py-2 border-t border-[#3A3F46] flex items-center justify-between">
          <div className="flex items-center gap-1">
            {['📎', '🖼', '</>', '✏️'].map((icon, i) => (
              <button key={i} className="p-1.5 text-[#737982] hover:text-[#A8ADB5] rounded transition-colors text-xs">
                {icon}
              </button>
            ))}
          </div>
          <button
            onClick={onSend}
            disabled={!composerText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4169A8] hover:bg-[#5580C0] text-white text-[12px] font-semibold rounded border border-[#314D82] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Send email
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        {showIdentityToast && <IdentityToast text={identityText} />}
      </div>
    );
  }

  // Instagram / WhatsApp compact composer
  return (
    <div className="border-t border-[#3A3F46] bg-[#2B2F34]">
      {/* Reply via + Reply as bar */}
      <div className="px-5 py-2 border-b border-[#3A3F46] flex items-center gap-3">
        <span className="text-[11px] text-[#737982]">Reply via</span>
        <ChannelButtons selected={selectedChannel} onSelect={onChannelSwitch} />
        <span className="text-[11px] text-[#737982] ml-2">Responding as</span>
        <div ref={accountRef} className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#A8ADB5] border border-[#3A3F46] hover:border-[#4B515A] transition-colors"
          >
            {selectedAccount?.identifier || 'Select account'}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showAccountMenu && (
            <div className="absolute bottom-full left-0 mb-1 w-52 bg-[#30343A] border border-[#3A3F46] rounded-md shadow-lg z-30 py-1">
              <p className="px-3 py-1 text-[9px] text-[#737982] font-semibold uppercase tracking-wider">Select account</p>
              {availableAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleAccountSwitch(acc.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    selectedAccountId === acc.id ? 'bg-[#363B42] text-[#F3F4F6]' : 'text-[#A8ADB5] hover:bg-[#363B42]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedAccountId === acc.id ? 'bg-[#4169A8]' : 'bg-[#737982]'}`} />
                  {acc.identifier}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="px-5 py-2.5 flex items-center gap-2">
        {selectedChannel === 'whatsapp' && (
          <button className="p-1.5 text-[#737982] hover:text-[#A8ADB5] rounded transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
        )}
        {selectedChannel === 'instagram' && (
          <button className="p-1.5 text-[#737982] hover:text-[#A8ADB5] rounded transition-colors">
            <ImageIcon className="w-4 h-4" />
          </button>
        )}
        <input
          type="text"
          value={composerText}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type your message..."
          className="flex-1 bg-transparent text-[12.5px] text-[#F3F4F6] placeholder:text-[#737982] focus:outline-none"
        />
        <button className="p-1.5 text-[#737982] hover:text-[#A8ADB5] rounded transition-colors">
          <Smile className="w-4 h-4" />
        </button>
        {selectedChannel === 'whatsapp' && (
          <button className="p-1.5 text-[#737982] hover:text-[#A8ADB5] rounded transition-colors">
            <Mic className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onSend}
          disabled={!composerText.trim()}
          className="p-2 bg-[#4169A8] hover:bg-[#5580C0] text-white rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      {showIdentityToast && <IdentityToast text={identityText} />}
    </div>
  );
}

function ChannelButtons({ selected, onSelect }: { selected: Channel; onSelect: (ch: Channel) => void }) {
  const channels: { id: Channel; label: string; icon: typeof Mail }[] = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'instagram', label: 'Instagram', icon: Camera },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ];

  return (
    <div className="flex items-center gap-1">
      {channels.map((ch) => {
        const cfg = channelBtnConfig[ch.id];
        const Icon = ch.icon;
        const isActive = selected === ch.id;
        return (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
              isActive
                ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                : 'bg-transparent text-[#737982] border-transparent hover:bg-[#363B42] hover:text-[#A8ADB5]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {ch.label}
          </button>
        );
      })}
    </div>
  );
}

function IdentityToast({ text }: { text: string }) {
  return (
    <div className="px-5 pb-2">
      <div className="flex items-center gap-2 px-2.5 py-1 bg-[#303844] rounded text-[11px] text-[#4169A8] font-medium border border-[#314D82]">
        <Check className="w-3.5 h-3.5" />
        {text}
      </div>
    </div>
  );
}
