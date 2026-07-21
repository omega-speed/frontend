import type { Metadata } from "next";
import { APP_NAME, COMPANY_NAME } from "@/lib/config";
import {
  Title,
  Updated,
  H2,
  P,
  UL,
  Callout,
  InfoBox,
} from "../_components/prose";

// Placeholder terms — replace with your real, lawyer-reviewed terms before launch.
export const metadata: Metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: `The terms that govern your use of ${APP_NAME}.`,
};

export default function TermsOfServicePage() {
  return (
    <article>
      <Title>Terms of Service</Title>
      <Updated>Last updated: [DATE]</Updated>

      <H2>1. Introduction</H2>
      <P>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of {APP_NAME}, operated by {COMPANY_NAME}. By creating an account or
        using the service, you agree to be bound by these Terms.
      </P>
      <Callout>If you do not agree to these Terms, do not use the service.</Callout>

      <H2>2. Who we are</H2>
      <InfoBox>
        <p className="font-semibold text-foreground">{COMPANY_NAME}</p>
        <p>[Registered address]</p>
        <p>[Contact email]</p>
      </InfoBox>

      <H2>3. Your account</H2>
      <UL>
        <li>You must provide accurate information when registering.</li>
        <li>You are responsible for keeping your credentials secure.</li>
        <li>[Add age requirements, eligibility, and account rules.]</li>
      </UL>

      <H2>4. Acceptable use</H2>
      <P>[Describe what users may and may not do on the service.]</P>

      <H2>5. Termination</H2>
      <P>[Describe when and how accounts may be suspended or terminated.]</P>

      <H2>6. Changes to these Terms</H2>
      <P>
        We may update these Terms from time to time. We will notify you of
        material changes before they take effect.
      </P>
    </article>
  );
}
