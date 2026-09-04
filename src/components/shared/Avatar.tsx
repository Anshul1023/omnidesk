import { getInitials } from '../../utils/formatting';

const darkColors = [
  'bg-[#243B68] text-[#8BACD8]',
  'bg-[#4A2545] text-[#D8A0C8]',
  'bg-[#1A3A2A] text-[#80D8A8]',
  'bg-[#3A2A1A] text-[#D8B880]',
  'bg-[#1A2A3A] text-[#80B8D8]',
  'bg-[#3A1A2A] text-[#D880A0]',
  'bg-[#2A3A1A] text-[#A8D880]',
  'bg-[#1A3A3A] text-[#80D8D8]',
];

const lightColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
  'bg-violet-100 text-violet-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

function getColorForName(name: string, dark: boolean): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = dark ? darkColors : lightColors;
  return colors[Math.abs(hash) % colors.length];
}

type AvatarProps = {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  dark?: boolean;
};

export function Avatar({ name, src, size = 'md', online, dark = false }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[9px]',
    md: 'w-8 h-8 text-[10px]',
    lg: 'w-11 h-11 text-[13px]',
  };

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold ${getColorForName(name, dark)}`}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
            dark ? 'border-[#24272B]' : 'border-white'
          } ${online ? 'bg-success' : 'bg-text-muted'}`}
        />
      )}
    </div>
  );
}
