import { render } from "hono/jsx/dom";
import { AuthSuccess } from "../apps/auth/success";

const root = document.getElementById("auth-success");

if (root) {
  render(<AuthSuccess />, root);
}