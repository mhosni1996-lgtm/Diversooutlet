import type { ReactNode } from 'react';

/** Colors duplicated from tokens.css for SVG attribute use. */
const C = { blue: '#4847AE', yellow: '#FCD704', ice: '#D4ECF6', white: '#FFFFFF', ink: '#14142B' };

/** Brand double-chevron arrow (derived from the logo cursor), pointing in reading direction (left in RTL). */
export function ArrowGlyph({ dir = 'left', className = 'arrow-glyph' }: { dir?: 'left' | 'right'; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={dir === 'right' ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M2 12 L17 3.5 L13.2 12 L17 20.5 Z" fill="currentColor" />
      <path d="M14.6 12 L22 7.6 L20 12 L22 16.4 Z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/**
 * Oblique "logo" cube: square front face, extrusion toward bottom-left (SVG +y is down).
 * Matches the 45° projection used by the REACH logotype.
 */
function Cube({ x, y, s, d, fill = C.white, side = C.ice, stroke = C.blue, sw = 2.5, children }: {
  x: number; y: number; s: number; d: number; fill?: string; side?: string; stroke?: string; sw?: number; children?: ReactNode;
}) {
  const left = `${x},${y} ${x},${y + s} ${x - d},${y + s + d} ${x - d},${y + d}`;
  const bottom = `${x},${y + s} ${x + s},${y + s} ${x + s - d},${y + s + d} ${x - d},${y + s + d}`;
  return (
    <g strokeLinejoin="round" stroke={stroke} strokeWidth={sw}>
      <polygon points={left} fill={side} />
      <polygon points={bottom} fill={side} />
      <rect x={x} y={y} width={s} height={s} fill={fill} />
      {children}
    </g>
  );
}

function Arrow({ x, y, s, rot = -35 }: { x: number; y: number; s: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s / 24})`}>
      <path d="M22 12 L7 3.5 L10.8 12 L7 20.5 Z" fill={C.yellow} />
      <path d="M9.4 12 L2 7.6 L4 12 L2 16.4 Z" fill={C.yellow} />
    </g>
  );
}

export function ServiceMotif({ kind }: { kind: 'identity' | 'content' | 'web' | 'campaigns' }) {
  return (
    <svg className="service__motif" viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      {kind === 'identity' && (
        <Cube x={22} y={10} s={46} d={12}>
          <rect x={33} y={21} width={24} height={24} fill={C.blue} stroke="none" />
          <polygon points="57,45 57,57 45,57" fill={C.yellow} stroke="none" />
        </Cube>
      )}
      {kind === 'content' && (
        <Cube x={22} y={10} s={46} d={12}>
          <circle cx={45} cy={33} r={13} fill={C.blue} stroke="none" />
          <circle cx={45} cy={33} r={5} fill={C.white} stroke="none" />
          <rect x={56} y={15} width={7} height={5} fill={C.yellow} stroke="none" />
        </Cube>
      )}
      {kind === 'web' && (
        <g>
          <Cube x={30} y={8} s={40} d={8} />
          <Cube x={20} y={20} s={40} d={8}>
            <rect x={20} y={20} width={40} height={8} fill={C.blue} stroke="none" />
            <rect x={27} y={35} width={12} height={16} fill={C.ice} stroke="none" />
            <rect x={43} y={35} width={10} height={6} fill={C.yellow} stroke="none" />
          </Cube>
        </g>
      )}
      {kind === 'campaigns' && (
        <g>
          <Cube x={16} y={26} s={36} d={10} />
          <Arrow x={46} y={30} s={34} rot={-40} />
        </g>
      )}
    </svg>
  );
}

/** Clearly-labelled placeholder artwork for concept projects. */
export function ConceptArt({ kind, label }: { kind: 'web' | 'content' | 'campaign'; label: string }) {
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${label}: رسم توضيحي هندسي`}>
      <defs>
        <pattern id={`g-${kind}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke={C.ice} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="500" fill="#F6F8FB" />
      <rect width="400" height="500" fill={`url(#g-${kind})`} />
      {kind === 'web' && (
        <g>
          <Cube x={92} y={92} s={236} d={30} sw={3}>
            <rect x={92} y={92} width={236} height={26} fill={C.blue} stroke="none" />
            <circle cx={108} cy={105} r={4} fill={C.white} stroke="none" />
            <circle cx={122} cy={105} r={4} fill={C.white} stroke="none" />
          </Cube>
          {[0, 1, 2].map((c) =>
            [0, 1].map((r) => (
              <g key={`${c}-${r}`}>
                <rect x={108 + c * 70} y={134 + r * 92} width={60} height={60} fill={r === 0 && c === 1 ? C.blue : C.ice} stroke={C.blue} strokeWidth={2} />
                <rect x={108 + c * 70} y={200 + r * 92} width={40} height={6} fill={C.blue} opacity={0.5} />
              </g>
            )),
          )}
          <Arrow x={300} y={300} s={70} rot={-40} />
          <Cube x={70} y={372} s={64} d={16} fill={C.blue} side={C.ice} />
        </g>
      )}
      {kind === 'content' && (
        <g>
          {[
            [70, 70, 120],
            [210, 70, 120],
            [70, 210, 120],
            [210, 210, 120],
          ].map(([x, y, s], i) => (
            <Cube key={i} x={x + 20} y={y + 20} s={s} d={16} sw={3}>
              {i === 0 && <circle cx={x + 80} cy={y + 80} r={30} fill={C.blue} stroke="none" />}
              {i === 1 && <rect x={x + 50} y={y + 50} width={60} height={60} fill={C.ice} stroke="none" />}
              {i === 2 && <polygon points={`${x + 40},${y + 120} ${x + 80},${y + 60} ${x + 120},${y + 120}`} fill={C.blue} stroke="none" />}
              {i === 3 && <rect x={x + 40} y={y + 40} width={80} height={80} fill={C.yellow} stroke="none" />}
            </Cube>
          ))}
          <rect x={90} y={392} width={220} height={8} fill={C.blue} />
          <rect x={90} y={410} width={140} height={8} fill={C.blue} opacity={0.4} />
        </g>
      )}
      {kind === 'campaign' && (
        <g>
          <Cube x={60} y={300} s={80} d={18} sw={3} />
          <Cube x={150} y={220} s={100} d={22} sw={3} />
          <Cube x={260} y={120} s={110} d={24} sw={3} fill={C.blue} />
          <text x={100} y={350} fontFamily="Space Grotesk Variable, sans-serif" fontWeight={600} fontSize={22} fill={C.blue} textAnchor="middle">01</text>
          <text x={200} y={280} fontFamily="Space Grotesk Variable, sans-serif" fontWeight={600} fontSize={26} fill={C.blue} textAnchor="middle">02</text>
          <text x={315} y={185} fontFamily="Space Grotesk Variable, sans-serif" fontWeight={600} fontSize={28} fill={C.white} textAnchor="middle">03</text>
          <Arrow x={300} y={84} s={84} rot={-40} />
          <path d="M70 440 L340 440" stroke={C.blue} strokeWidth={3} strokeDasharray="8 8" />
        </g>
      )}
    </svg>
  );
}

/** Static sculpture used when WebGL is unavailable or reduced motion is requested. */
export function StaticSculpture({ variant }: { variant: 'hero' | 'contact' }) {
  if (variant === 'contact') {
    // The REACH stair: two cubes over three, small arrow box — a resolved composition.
    return (
      <svg className="static-art" viewBox="0 0 560 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <ellipse cx="300" cy="372" rx="210" ry="16" fill="#14142B" opacity="0.06" />
        <Cube x={90} y={96} s={110} d={34} sw={3.5}>
          <rect x={122} y={128} width={46} height={46} fill={C.blue} stroke="none" />
        </Cube>
        <Cube x={200} y={96} s={110} d={34} sw={3.5} />
        <Cube x={200} y={206} s={110} d={34} sw={3.5} />
        <Cube x={310} y={206} s={110} d={34} sw={3.5}>
          <rect x={342} y={238} width={46} height={46} fill={C.blue} stroke="none" />
        </Cube>
        <Cube x={420} y={206} s={110} d={34} sw={3.5} />
        <Cube x={330} y={110} s={58} d={16} sw={3} />
        <Arrow x={392} y={112} s={72} rot={-38} />
      </svg>
    );
  }
  return (
    <svg className="static-art" viewBox="0 0 560 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <ellipse cx="280" cy="470" rx="230" ry="18" fill="#14142B" opacity="0.06" />
      <Cube x={120} y={300} s={130} d={36} sw={3.5} fill={C.blue} side={C.ice} />
      <Cube x={250} y={300} s={130} d={36} sw={3.5} />
      <Cube x={380} y={300} s={110} d={30} sw={3.5}>
        <rect x={410} y={330} width={50} height={50} fill={C.ice} stroke="none" />
      </Cube>
      <Cube x={190} y={170} s={130} d={36} sw={3.5} />
      <Cube x={240} y={220} s={50} d={14} sw={3} fill={C.blue} />
      <Cube x={340} y={110} s={70} d={20} sw={3} />
      <Cube x={90} y={130} s={44} d={12} sw={2.5} fill={C.blue} />
      <Arrow x={150} y={250} s={150} rot={0} />
    </svg>
  );
}
