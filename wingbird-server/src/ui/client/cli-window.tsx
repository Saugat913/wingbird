import { render } from "hono/jsx/dom";
import CliWindow from "../components/cli-window";

const root = document.getElementById("cli-window");

if (root) {
  render(<CliWindow />, root);
}