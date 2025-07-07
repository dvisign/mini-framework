// /src/lib/ui-kit/core/index.js
export function createApp(App, selector) {
  const root =
    typeof selector === "string" ? document.querySelector(selector) : selector;
  root.appendChild(App());
}
