import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedRdvPermisOAuthOrigin } from "../src/rdvpermis/oauthPopup.js";

test("only the local app and registered frontend may report OAuth completion", () => {
  assert.equal(isTrustedRdvPermisOAuthOrigin("http://127.0.0.1:5173", "http://127.0.0.1:5173"), true);
  assert.equal(isTrustedRdvPermisOAuthOrigin("http://localhost:5173", "https://reactfast.passpermisfacile.fr"), true);
  assert.equal(isTrustedRdvPermisOAuthOrigin("https://reactfast.passpermisfacile.fr", "http://127.0.0.1:5173"), true);
  assert.equal(isTrustedRdvPermisOAuthOrigin("https://untrusted.example", "http://127.0.0.1:5173"), false);
});
