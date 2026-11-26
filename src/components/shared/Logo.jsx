/**
 * Brand mark: a small balanced tree on a rounded accent tile. Drawn inline so
 * it inherits the theme (light/dark) and stays crisp at every size.
 */
export default function Logo({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="var(--accent)" />
      <g stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" opacity=".55">
        <path d="M24 12 L16 22 M24 12 L32 22 M16 22 L16 31 M32 22 L32 31" />
      </g>
      <circle cx="24" cy="12" r="3.4" fill="var(--accent4)" />
      <circle cx="16" cy="22" r="2.6" fill="var(--surface)" />
      <circle cx="32" cy="22" r="2.6" fill="var(--surface)" />
      <circle cx="16" cy="33" r="2.2" fill="var(--surface)" />
      <circle cx="32" cy="33" r="2.2" fill="var(--surface)" />
    </svg>
  );
}
