import type { Metadata } from "next";
import { APP_NAME, COMPANY_NAME } from "@/lib/config";
import {
  Title,
  Updated,
  H2,
  P,
  InfoBox,
  LegalTable,
} from "../_components/prose";

// Placeholder policy — replace with your real, lawyer-reviewed policy before launch.
export const metadata: Metadata = {
  title: `Cookie Policy — ${APP_NAME}`,
  description: `How ${APP_NAME} uses cookies and similar technologies.`,
};

export default function CookiePolicyPage() {
  return (
    <article>
      <Title>Cookie Policy</Title>
      <Updated>Last updated: [DATE]</Updated>

      <H2>1. Introduction</H2>
      <P>
        This Cookie Policy explains how {COMPANY_NAME} uses cookies and similar
        technologies on {APP_NAME}.
      </P>

      <H2>2. Who we are</H2>
      <InfoBox>
        <p className="font-semibold text-foreground">{COMPANY_NAME}</p>
        <p>[Registered address]</p>
        <p>[Contact email]</p>
      </InfoBox>

      <H2>3. Cookies we use</H2>
      <LegalTable
        headers={["Cookie", "Purpose", "Duration"]}
        rows={[
          ["access_token", "Keeps you signed in", "9 hours"],
          ["refresh_token", "Renews your session", "7 days"],
          ["[analytics…]", "[purpose]", "[duration]"],
        ]}
      />

      <H2>4. Managing cookies</H2>
      <P>
        You can control and delete cookies through your browser settings. Note
        that blocking the essential cookies above will sign you out.
      </P>
    </article>
  );
}
