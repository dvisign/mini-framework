// /src/lib/ui-kit/core/createComponent.js
import {parseTemplateToVNode, bindEvents} from "./templateEngine.js";
import {createElement, diff} from "./virtualDom.js";

// Global theme object
let GLOBAL_THEME = {};

/**
 * Set global theme CSS by selector definitions or raw CSS string
 */
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

/**
 * Creates a component with lifecycle hooks, props merging, dynamic styles, watchers, and global CSS.
 * @param {{ setup?: Function, template: string, components?: object, styles?: Function|object, watch?: object, mount?: Function, globalStyles?: object, props?: object }} options
 */
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

  // Map custom component tags to functions
  const componentMap = {};
  Object.entries(components).forEach(([name, Comp]) => {
    componentMap[name.toLowerCase()] = Comp;
  });

  // Inject globalStyles into <head>
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

  // Initialize setup data and watchers
  const initial = typeof setup === "function" ? setup(props) : {};
  const rawState = Object.assign({}, props, initial);
  const watchers = watch;
  let isMounted = false;

  // State proxy with watcher and re-render logic
  const state = new Proxy(rawState, {
    set(target, key, value) {
      const oldValue = target[key];
      target[key] = value;
      // Trigger watcher if exists
      if (watchers && typeof watchers[key] === "function") {
        watchers[key].call(state, value, oldValue);
      }
      render();
      return true;
    },
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

  function render() {
    const newVNode = parseTemplateToVNode(template, state, componentMap);
    if (!oldVNode) {
      // Initial mount
      const el = createElement(newVNode);
      container.innerHTML = "";
      container.appendChild(el);
      // Call mount hook once
      if (typeof mount === "function" && !isMounted) {
        mount.call(state);
        isMounted = true;
      }
    } else {
      diff(oldVNode, newVNode, container);
    }
    oldVNode = newVNode;
    applyStyles();
    bindEvents(container, state);
  }

  render();
  return container;
}
