import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { Channel, ConversationStatus } from '../../types';
import type { InboxFilter } from '../../hooks/useInbox';
import { channelLabel } from '../../utils/formatting';

type FilterPopoverProps = {
  filter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  onClose: () => void;
};

const channels: Channel[] = ['email', 'instagram', 'whatsapp'];
const statuses: ConversationStatus[] = ['open', 'pending', 'resolved'];
const assignees = ['You', 'Sarah', 'Aman', 'Unassigned'];
const recencies = [
  { value: 'today' as const, label: 'Today' },
  { value: '7days' as const, label: 'Last 7 days' },
  { value: '30days' as const, label: 'Last 30 days' },
];

export function FilterPopover({ filter, onFilterChange, onClose }: FilterPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState<InboxFilter>({ ...filter });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  function toggleItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary mb-2">
          {title}
        </p>
        <div className="flex flex-wrap gap-1.5">{children}</div>
      </div>
    );
  }

  function Option({
    label,
    selected,
    onClick,
  }: {
    label: string;
    selected: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors border ${
          selected
            ? 'bg-accent-light text-accent border-accent/20'
            : 'bg-white text-text-secondary border-border hover:border-gray-300'
        }`}
      >
        {selected && <Check className="w-3 h-3" />}
        {label}
      </button>
    );
  }

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 w-80 bg-white border border-border rounded-lg shadow-lg z-40 p-3"
    >
      <Section title="Channel">
        {channels.map((ch) => (
          <Option
            key={ch}
            label={channelLabel(ch)}
            selected={local.channels.includes(ch)}
            onClick={() =>
              setLocal((prev) => ({ ...prev, channels: toggleItem(prev.channels, ch) }))
            }
          />
        ))}
      </Section>

      <div className="border-t border-border-light" />

      <Section title="Status">
        {statuses.map((s) => (
          <Option
            key={s}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            selected={local.status === s}
            onClick={() =>
              setLocal((prev) => ({ ...prev, status: prev.status === s ? undefined : s }))
            }
          />
        ))}
      </Section>

      <div className="border-t border-border-light" />

      <Section title="Read state">
        <Option
          label="Unread"
          selected={local.unreadOnly}
          onClick={() => setLocal((prev) => ({ ...prev, unreadOnly: !prev.unreadOnly }))}
        />
      </Section>

      <div className="border-t border-border-light" />

      <Section title="Assignee">
        {assignees.map((a) => (
          <Option
            key={a}
            label={a}
            selected={local.assignee === a}
            onClick={() =>
              setLocal((prev) => ({ ...prev, assignee: prev.assignee === a ? undefined : a }))
            }
          />
        ))}
      </Section>

      <div className="border-t border-border-light" />

      <Section title="Recency">
        {recencies.map((r) => (
          <Option
            key={r.value}
            label={r.label}
            selected={local.recency === r.value}
            onClick={() =>
              setLocal((prev) => ({ ...prev, recency: prev.recency === r.value ? undefined : r.value }))
            }
          />
        ))}
      </Section>

      <div className="flex items-center justify-between pt-2 border-t border-border-light">
        <button
          onClick={() => {
            onFilterChange({
              unreadOnly: false,
              needsAttention: false,
              channels: [],
            });
            onClose();
          }}
          className="text-[11.5px] text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => {
            onFilterChange(local);
            onClose();
          }}
          className="px-3 py-1.5 bg-accent text-white text-[11.5px] font-medium rounded-md hover:bg-accent-hover transition-colors"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
