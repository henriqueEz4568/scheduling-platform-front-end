const DEFAULT_SIGNUP_ROLE = "admin";

/**
 * Role assigned to accounts created through the public sign-up. Defined only
 * on the server; any role sent by the browser is ignored.
 */
export function getSignupRole(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.SIGNUP_DEFAULT_ROLE?.trim() || DEFAULT_SIGNUP_ROLE;
}
