import Link from "next/link";
import { cn } from "@/lib/utils";
import { COMPANY_NAME } from "@/lib/config";

// Shared legal links — surfaced on the auth pages and the policy pages, since the
// marketing landing (which normally carries these) redirects straight into the app.
export function LegalFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <span className="text-faint">© {year} {COMPANY_NAME}</span>
      <span className="text-faint">·</span>
      <Link
        href="/terms-of-service"
        className="hover:text-foreground transition-colors"
      >
        Terms of Service
      </Link>
      <span className="text-faint">·</span>
      <Link
        href="/privacy-policy"
        className="hover:text-foreground transition-colors"
      >
        Privacy Policy
      </Link>
      <span className="text-faint">·</span>
      <Link
        href="/cookie-policy"
        className="hover:text-foreground transition-colors"
      >
        Cookie Policy
      </Link>
    </div>
  );
}
