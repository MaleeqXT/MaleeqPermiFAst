export const RDVPERMIS_OAUTH_MESSAGE = "rdvpermis:oauth-result";

const trustedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://reactfast.passpermisfacile.fr",
]);

export function isTrustedRdvPermisOAuthOrigin(origin, currentOrigin) {
  return origin === currentOrigin || trustedOrigins.has(origin);
}
