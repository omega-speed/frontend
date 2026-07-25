// Ollie's mark — a small brand token, not a decorative icon. A cobalt disc with a
// quiet ring; it breathes gently while Ollie is thinking.
export function OllieMark({ thinking = false }: { thinking?: boolean }) {
  return (
    <span className="relative flex size-7 shrink-0 items-center justify-center">
      {thinking && (
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/30 [animation-duration:1.6s]" />
      )}
      <span className="relative flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <span className="size-2 rounded-full bg-primary-foreground/90" />
      </span>
    </span>
  );
}
