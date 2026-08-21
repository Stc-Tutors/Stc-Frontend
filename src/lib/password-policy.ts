import { z } from "zod";

// Single source of truth for password strength on the frontend - mirrors
// stcbe's src/core/validators/password-policy.ts exactly. Previously every
// registration/reset/change form declared its own independent
// `z.string().min(6, ...)` with no character requirements; tightened
// platform-wide per the 2026-08-21 password policy task.
//
// Standard accounts (parent/student self-registration, tutor registration,
// admin-created accounts, special-course registration, password
// reset/change): 8+ characters, at least one uppercase letter, one
// lowercase letter, and one number. No mandatory special character.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number";

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { message: PASSWORD_POLICY_MESSAGE })
  .regex(/[a-z]/, { message: PASSWORD_POLICY_MESSAGE })
  .regex(/[A-Z]/, { message: PASSWORD_POLICY_MESSAGE })
  .regex(/[0-9]/, { message: PASSWORD_POLICY_MESSAGE });

export function isValidPassword(value: string): boolean {
  return (
    value.length >= PASSWORD_MIN_LENGTH && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value)
  );
}

// Lighter, length-only rule for parent-managed child logins (a young child
// may need to type this themselves, so no forced character mix) - see
// RegisterChildDto/IsChildPassword on the backend.
export const CHILD_PASSWORD_MIN_LENGTH = 8;
export const CHILD_PASSWORD_MESSAGE = `Password must be at least ${CHILD_PASSWORD_MIN_LENGTH} characters`;

export const childPasswordSchema = z.string().min(CHILD_PASSWORD_MIN_LENGTH, { message: CHILD_PASSWORD_MESSAGE });
