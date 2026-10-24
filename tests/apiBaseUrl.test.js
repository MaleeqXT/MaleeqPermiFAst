import assert from "node:assert/strict";
import test from "node:test";
import { resolveApiBaseUrl } from "../src/config/apiBaseUrl.js";

test("local development retains the origin serving the React app", () => {
  assert.equal(resolveApiBaseUrl({
    configuredApiUrl: "http://127.0.0.1:5173",
    development: true,
    browserOrigin: "http://localhost:5173",
  }), "http://localhost:5173");

  assert.equal(resolveApiBaseUrl({
    configuredApiUrl: "http://localhost:5173",
    development: true,
    browserOrigin: "http://127.0.0.1:5173",
  }), "http://127.0.0.1:5173");
});

test("production retains the explicit remote API URL", () => {
  assert.equal(resolveApiBaseUrl({
    configuredApiUrl: "https://staging2.passpermisfacile.fr/",
    development: false,
    browserOrigin: "https://reactfast.passpermisfacile.fr",
  }), "https://staging2.passpermisfacile.fr");
});

test("a missing production API URL fails instead of using localhost", () => {
  assert.throws(() => resolveApiBaseUrl({
    configuredApiUrl: "",
    development: false,
    browserOrigin: "https://reactfast.passpermisfacile.fr",
  }), /VITE_API_URL/);
});
