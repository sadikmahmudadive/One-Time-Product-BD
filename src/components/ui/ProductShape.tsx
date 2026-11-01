import type { ShapeKind } from "@/lib/content";

const STROKE = "#28634D";

/** Isometric product illustrations used in place of photography until real product shots exist. */
export function ProductShape({ kind }: { kind: ShapeKind }) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
        {SHAPES[kind]}
      </svg>
    </div>
  );
}

const SHAPES: Record<ShapeKind, React.ReactNode> = {
  square: (
    <>
      <ellipse cx="100" cy="180" rx="70" ry="9" fill="#173C31" opacity="0.08" />
      <polygon points="34,84 100,117 100,168 34,135" fill="#E7F1EB" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="100,117 166,84 166,135 100,168" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="28,80 100,114 100,122 28,88" fill="#E7F1EB" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="100,114 172,80 172,88 100,122" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="100,46 172,80 100,114 28,80" fill="#F7F9F7" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="100,58 148,80 100,102 52,80" fill="none" stroke="#B7D957" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="118" y1="62" x2="146" y2="75" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  rectBlack: (
    <>
      <ellipse cx="100" cy="178" rx="84" ry="9" fill="#102D25" opacity="0.12" />
      <polygon points="20,80 122,125 122,166 20,121" fill="#1B201E" stroke="#102D25" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="122,125 180,96 180,137 122,166" fill="#2B322F" stroke="#102D25" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="30" y1="96" x2="112" y2="133" stroke="#4D5952" strokeWidth="2" strokeLinecap="round" />
      <polygon points="16,72 122,118 122,126 16,80" fill="#E5EAE6" stroke="#77827B" strokeWidth="1.2" strokeLinejoin="round" fillOpacity="0.8" />
      <polygon points="122,118 184,88 184,96 122,126" fill="#FFFFFF" stroke="#77827B" strokeWidth="1.2" strokeLinejoin="round" fillOpacity="0.8" />
      <polygon points="78,42 184,88 122,118 16,72" fill="#FFFFFF" stroke="#77827B" strokeWidth="1.2" strokeLinejoin="round" fillOpacity="0.55" />
      <line x1="96" y1="56" x2="150" y2="80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  rectClear: (
    <>
      <ellipse cx="100" cy="178" rx="84" ry="9" fill="#173C31" opacity="0.08" />
      <polygon points="20,80 122,125 122,166 20,121" fill="#E7F1EB" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="122,125 180,96 180,137 122,166" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="16,72 122,118 122,126 16,80" fill="#E7F1EB" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="122,118 184,88 184,96 122,126" fill="#FFFFFF" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="78,42 184,88 122,118 16,72" fill="#F7F9F7" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="96" y1="56" x2="150" y2="80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  round: (
    <>
      <ellipse cx="100" cy="178" rx="64" ry="9" fill="#173C31" opacity="0.08" />
      <path d="M42 84 L54 158 A46 12 0 0 0 146 158 L158 84 Z" fill="#E7F1EB" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M50 120 L54 158 A46 12 0 0 0 146 158 L150 120 A50 13 0 0 1 50 120 Z" fill="#F2F8D9" stroke="none" />
      <ellipse cx="100" cy="84" rx="62" ry="16" fill="#E7F1EB" stroke={STROKE} strokeWidth="1.5" />
      <ellipse cx="100" cy="76" rx="62" ry="16" fill="#F7F9F7" stroke={STROKE} strokeWidth="1.5" />
      <ellipse cx="100" cy="76" rx="40" ry="9" fill="none" stroke="#B7D957" strokeWidth="1.5" />
      <line x1="66" y1="100" x2="72" y2="146" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  heart: (
    <>
      <ellipse cx="100" cy="182" rx="56" ry="8" fill="#173C31" opacity="0.08" />
      <path d="M100 172 C60 144 28 118 28 88 C28 64 46 50 64 50 C80 50 92 60 100 72 C108 60 120 50 136 50 C154 50 172 64 172 88 C172 118 140 144 100 172 Z" fill="#E7F1EB" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M100 160 C70 138 44 118 44 94 C44 76 56 66 70 66 C82 66 92 74 100 84 C108 74 118 66 130 66 C144 66 156 76 156 94 C156 118 130 138 100 160 Z" fill="#F2F8D9" stroke="#B7D957" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M100 146 C80 132 62 118 62 102 C62 92 70 86 78 86 C88 86 96 92 100 100 C104 92 112 86 122 86 C130 86 138 92 138 102 C138 118 120 132 100 146 Z" fill="#B7D957" opacity="0.55" />
      <line x1="56" y1="76" x2="66" y2="66" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  cup: (
    <>
      <ellipse cx="100" cy="180" rx="56" ry="8" fill="#173C31" opacity="0.08" />
      <path d="M46 60 Q46 50 56 50 L144 50 Q154 50 154 60 L143 160 Q142 170 132 170 L68 170 Q58 170 57 160 Z" fill="#E7F1EB" stroke={STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M53 118 L147 118 L143 160 Q142 170 132 170 L68 170 Q58 170 57 160 Z" fill="#F2F8D9" />
      <path d="M51 96 L149 96 L147 118 L53 118 Z" fill="#B7D957" opacity="0.5" />
      <rect x="40" y="42" width="120" height="14" rx="6" fill="#F7F9F7" stroke={STROKE} strokeWidth="1.5" />
      <line x1="64" y1="70" x2="68" y2="150" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  crate: (
    <>
      <ellipse cx="100" cy="182" rx="80" ry="9" fill="#102D25" opacity="0.12" />
      <polygon points="100,42 176,78 100,114 24,78" fill="#102D25" stroke="#102D25" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="100,54 152,78 100,102 48,78" fill="#173C31" />
      <polygon points="24,78 100,114 100,172 24,136" fill="#28634D" stroke="#173C31" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="100,114 176,78 176,136 100,172" fill="#347A5D" stroke="#173C31" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="34" y1="98" x2="90" y2="125" stroke="#173C31" strokeWidth="5" strokeLinecap="round" />
      <line x1="34" y1="118" x2="90" y2="145" stroke="#173C31" strokeWidth="5" strokeLinecap="round" />
      <line x1="110" y1="125" x2="166" y2="98" stroke="#28634D" strokeWidth="5" strokeLinecap="round" />
      <line x1="110" y1="145" x2="166" y2="118" stroke="#28634D" strokeWidth="5" strokeLinecap="round" />
      <polygon points="24,78 100,114 176,78 176,84 100,120 24,84" fill="#B7D957" opacity="0.85" />
    </>
  ),
};
