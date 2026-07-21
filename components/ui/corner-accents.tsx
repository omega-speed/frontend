/**
 * Decorative corner bracket accents.
 * Positioned at the inner border edge (top: 0, bottom: 0) so they work
 * correctly on any height container without overflow or containing-block issues.
 *
 * Parent must have `position: relative`.
 */
export function CornerAccents() {
  const b = "2px solid oklch(1 0 0 / 0.6)";
  const cls = "pointer-events-none absolute z-10 w-[10px] h-[10px]";
  return (
    <>
      <span className={cls} style={{ top: 0, left: 0, borderTop: b, borderLeft: b }} />
      <span className={cls} style={{ top: 0, right: 0, borderTop: b, borderRight: b }} />
      <span className={cls} style={{ bottom: 0, left: 0, borderBottom: b, borderLeft: b }} />
      <span className={cls} style={{ bottom: 0, right: 0, borderBottom: b, borderRight: b }} />
    </>
  );
}
