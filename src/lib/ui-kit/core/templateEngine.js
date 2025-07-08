// /src/lib/ui-kit/core/templateEngine.js
const boundEventsMap = new WeakMap();

/**
 * Parses template string into a VNode tree, supporting conditional and list rendering.
 */
export function parseTemplateToVNode(template, state, components) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = template.trim();

  function interpolate(val, localState) {
    return typeof val === "string"
      ? val.replace(/{{\s*(\w+)\s*}}/g, (_, key) => localState[key] ?? "")
      : val;
  }

  function domToVNode(node, localState) {
    // Text nodes: interpolate placeholders
    if (node.nodeType === Node.TEXT_NODE) {
      return interpolate(node.textContent, localState);
    }
    // Ignore non-element nodes
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return undefined;
    }

    // Conditional rendering via data-if
    if (node.hasAttribute("data-if")) {
      const cond = node.getAttribute("data-if").trim();
      if (!localState[cond]) return undefined;
    }

    // List rendering via data-for="item in items"
    if (node.hasAttribute("data-for")) {
      const expr = node.getAttribute("data-for");
      const [itemName, listName] = expr.split(/ in /).map((s) => s.trim());
      const list = localState[listName] || [];
      return list.flatMap((itemValue) => {
        const clone = node.cloneNode(true);
        clone.removeAttribute("data-for");
        const scopedState = new Proxy(localState, {
          get(target, key) {
            if (key === itemName) return itemValue;
            return target[key];
          },
        });
        return domToVNode(clone, scopedState);
      });
    }

    const tag = node.tagName.toLowerCase();
    // Custom component
    if (components[tag]) {
      const props = {};
      Array.from(node.attributes).forEach(({name, value}) => {
        if (name.startsWith(":")) {
          props[name.slice(1)] = localState[value];
        } else if (name !== "data-if" && name !== "data-for") {
          props[name] = interpolate(value, localState);
        }
      });
      const children = Array.from(node.childNodes)
        .map((n) => domToVNode(n, localState))
        .flat()
        .filter((n) => n !== undefined);
      return {component: components[tag], props, children};
    }

    // Regular DOM element
    const props = {};
    Array.from(node.attributes).forEach(({name, value}) => {
      if (name !== "data-if" && name !== "data-for") {
        props[name] = interpolate(value, localState);
      }
    });
    const children = Array.from(node.childNodes)
      .map((n) => domToVNode(n, localState))
      .flat()
      .filter((n) => n !== undefined);
    return {tag, props, children};
  }

  return domToVNode(wrapper.firstElementChild, state);
}

export function bindEvents(root, state) {
  root.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach(({name, value}) => {
      if (!name.startsWith("data-on")) return;
      const eventKey = name.slice(7).toLowerCase();
      const eventType = eventKey === "change" ? "input" : eventKey;
      const handler = state[value];
      if (typeof handler !== "function") return;
      let boundSet = boundEventsMap.get(el);
      if (!boundSet) {
        boundSet = new Set();
        boundEventsMap.set(el, boundSet);
      }
      if (boundSet.has(name)) return;
      el.addEventListener(eventType, handler.bind(state));
      boundSet.add(name);
    });
  });
}
