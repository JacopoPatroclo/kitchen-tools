import React from "react";
import ReactDOM from "react-dom";

export const loadAndRender = (
  importFn: () => Promise<any>,
  domElement: HTMLElement
) => {
  importFn().then((module) => {
    const App = module.default;
    const context = JSON.stringify(domElement.dataset.microContext || "{}");
    ReactDOM.render(<App context={context}></App>, domElement);
  });
};
