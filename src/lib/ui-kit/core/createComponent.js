import {parseTemplateToVNode, bindEvents} from "./templateEngine.js";
import {createElement, diff} from "./virtualDom.js";

let GLOBAL_THEME = {};

export function setTheme(themeObj) {
  GLOBAL_THEME = themeObj;
  if (typeof document === "undefined") return;
  let styleTag = document.getElementById("ui-kit-theme");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "ui-kit-theme";
    document.head.appendChild(styleTag);
  }
  if (typeof themeObj === "string") {
    styleTag.textContent = themeObj;
  } else {
    const cssLines = [];
    Object.entries(themeObj).forEach(([selector, defs]) => {
      const decls = Object.entries(defs)
        .map(([prop, val]) => {
          const kebab = prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          return `${kebab}: ${val};`;
        })
        .join(" ");
      cssLines.push(`${selector} { ${decls} }`);
    });
    styleTag.textContent = cssLines.join("\n");
  }
}

export function createComponent(options) {
  const {
    setup,
    template,
    components = {},
    styles,
    globalStyles,
    props = {},
    watch = {},
    mount,
  } = options;

  const componentMap = {};
  Object.entries(components).forEach(([name, Comp]) => {
    componentMap[name.toLowerCase()] = Comp;
  });

  if (globalStyles && typeof document !== "undefined") {
    const styleTag = document.createElement("style");
    const cssLines = [];
    Object.entries(globalStyles).forEach(([selector, defs]) => {
      const styleObj = typeof defs === "function" ? defs(GLOBAL_THEME) : defs;
      const decls = Object.entries(styleObj)
        .map(([prop, val]) => {
          const kebab = prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          return `${kebab}: ${val};`;
        })
        .join(" ");
      cssLines.push(`${selector} { ${decls} }`);
    });
    styleTag.textContent = cssLines.join("\n");
    document.head.appendChild(styleTag);
  }

  const initial = typeof setup === "function" ? setup(props) : {};
  const rawState = Object.assign({}, props, initial);
  const watchers = watch;
  let isMounted = false;

  const refs = {};

  const state = new Proxy(rawState, {
    set(target, key, value) {
      const oldValue = target[key];
      target[key] = value;
      if (watchers && typeof watchers[key] === "function") {
        watchers[key].call(state, value, oldValue);
      }
      render();
      return true;
    },
  });

  Object.defineProperty(state, "$refs", {
    get: () => refs,
  });

  const container = document.createElement("div");
  let oldVNode = null;

  function applyStyles() {
    if (!styles) return;
    const result =
      typeof styles === "function" ? styles(state, GLOBAL_THEME) : styles;
    Object.entries(result).forEach(([selector, styleObj]) => {
      if (!selector) {
        Object.assign(container.style, styleObj);
      } else {
        container
          .querySelectorAll(selector)
          .forEach((el) => Object.assign(el.style, styleObj));
      }
    });
  }

  function updateRefs() {
    container.querySelectorAll("[data-ref]").forEach((el) => {
      const name = el.getAttribute("data-ref");
      if (name) refs[name] = el;
    });
  }

  function render() {
    const newVNode = parseTemplateToVNode(template, state, componentMap);
    const newEl = createElement(newVNode);

    container.innerHTML = "";
    container.appendChild(newEl);

    updateRefs();
    if (typeof mount === "function" && !isMounted) {
      mount.call(state);
      isMounted = true;
    }

    applyStyles();
    bindEvents(container, state);

    oldVNode = newVNode;
  }

  render();
  return container;
}
