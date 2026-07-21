import type { Metadata } from "next";
import { APP_NAME, COMPANY_NAME } from "@/lib/config";
import {
  Title,
  Updated,
  H2,
  P,
  UL,
  InfoBox,
  ContactBox,
} from "../_components/prose";

// Placeholder policy — replace with your real, lawyer-reviewed policy before launch.
export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description: `How ${APP_NAME} collects, uses, and protects your information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <article>
      <Title>Privacy Policy</Title>
      <Updated>Last updated: [DATE]</Updated>

      <H2>1. Introduction</H2>
      <P>
        This Privacy Policy explains how {COMPANY_NAME} (&ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and protects
        your personal information when you use {APP_NAME}.
      </P>

      <H2>2. Data controller</H2>
      <InfoBox>
        <p className="font-semibold text-foreground">{COMPANY_NAME}</p>
        <p>[Registered address]</p>
        <p>[Contact email]</p>
      </InfoBox>

      <H2>3. Information we collect</H2>
      <UL>
        <li>Account information (name, email, username).</li>
        <li>[Usage data, device information, cookies…]</li>
        <li>[Any other categories your product actually collects.]</li>
      </UL>

      <H2>4. How we use your information</H2>
      <P>[Describe your purposes: providing the service, security, analytics…]</P>

      <H2>5. Your rights</H2>
      <P>[Describe access, correction, deletion, and complaint rights.]</P>

      <H2>6. Contact us</H2>
      <ContactBox>
        <p className="font-semibold">[Contact email]</p>
        <p>[Company name and registered address]</p>
      </ContactBox>
    </article>
  );
}
