import { z } from "zod";

// Mirrors the backend register contract: POST /auth/register { email, password, name }.
// isTermsAgreed is a client-side gate only and is not sent to the backend.
export const signUpPayload = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isTermsAgreed: z.boolean().refine((v) => v === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export type SignUpPayload = z.infer<typeof signUpPayload>;
