import { useState } from 'react';

/**
 * Avatar with a demo user photo (pravatar) and an initials
 * fallback that shows while loading or when offline.
 * The photo index is derived from the name so each contact
 * always gets the same face.
 */
function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

interface AvatarProps {
  name: string;
  size?: number;
  radius?: number; // default = circle
  border?: string;
  fontSize?: number;
  dot?: 'online' | 'offline';
  backgroundColor?: string;
}

export function Avatar({ name, size = 40, radius, border = '1px solid var(--border-accent)', fontSize, dot, backgroundColor }: AvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const imgIdx = 1 + (hashName(name) % 70); // pravatar has 1..70
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const r = radius ?? size / 2;

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      <div
        style={{
          width: size, height: size, borderRadius: r, border, boxSizing: 'border-box',
          background: backgroundColor || 'radial-gradient(circle at 38% 24%, #bda38f 0 12%, #735d4e 13% 28%, #303941 29% 100%)',
          display: 'grid', placeItems: 'center', position: 'relative',
          fontSize: fontSize ?? Math.max(9, size * 0.3), fontWeight: 800,
          color: '#fff', overflow: 'hidden', textShadow: '0 1px 2px rgba(0,0,0,0.35)',
        }}
      >
        {initials}
        <img
          src={`https://i.pravatar.cc/${Math.max(80, size * 2)}?img=${imgIdx}`}
          alt=""
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.25s',
          }}
        />
      </div>
      {dot && (
        <div
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: Math.max(9, size * 0.24), height: Math.max(9, size * 0.24),
            borderRadius: '50%', boxSizing: 'border-box',
            background: dot === 'online' ? '#63d595' : '#69727b',
            border: '2px solid var(--surface-2)',
          }}
        />
      )}
    </div>
  );
}
