import { loadAndRender } from "../helpers/load-and-render";

const ID = "micro-example";

const root = document.getElementById(ID);
if (root) {
  // Use root as <div id="micro-example" data-micro-context='{"text": "<%= themeName %>"}' ></div>
  loadAndRender(() => import("./app"), root);
}
