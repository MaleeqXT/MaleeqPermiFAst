import { createElement } from "react";
import { createRoot } from "react-dom/client";
import RdvPermisPage from "../src/rdvpermis/RdvPermisPage.jsx";

// Test entry only; never imported by the production entry. The test server
// overrides the API base to a non-routable .invalid host and mocks all traffic.
if (!import.meta.env.DEV || !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  throw new Error("The RdvPermis fixture is local-development only.");
}
createRoot(document.getElementById("root")).render(createElement(RdvPermisPage));
