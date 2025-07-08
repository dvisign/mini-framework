const boundEventsMap = new WeakMap();

function evaluateExpression(expression, scope) {
  try {
    const keys = Object.keys(scope);
    const values = Object.values(scope);
    return new Function(...keys, `return (${expression})`)(...values);
  } catch (err) {
    console.warn("evaluate error:", expression, err);
    return "";
  }
}

export function parseTemplateToVNode(template, state, components) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = template.trim();

  function interpolate(val, localState) {
    return typeof val === "string"
      ? val.replace(/{{\s*(.*?)\s*}}/g, (_, expr) =>
          evaluateExpression(expr, localState)
        )
      : val;
  }

  function domToVNode(node, localState) {
    if (node.nodeType === Node.TEXT_NODE) {
      return interpolate(node.textContent, localState);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return undefined;
    }

    if (node.hasAttribute("data-if")) {
      const expr = node.getAttribute("data-if").trim();
      try {
        const fn = new Function(...Object.keys(localState), `return (${expr})`);
        const result = fn(...Object.values(localState));
        if (!result) return undefined;
      } catch (err) {
        console.warn("data-if 오류:", expr, err);
        return undefined;
      }
    }

    if (node.hasAttribute("data-for")) {
      const [itemName, listName] = node
        .getAttribute("data-for")
        .split(/ in /)
        .map((s) => s.trim());
      const list = localState[listName] || [];
      return list.flatMap((itemValue) => {
        const clone = node.cloneNode(true);
        clone.removeAttribute("data-for");
        const scopedState = new Proxy(localState, {
          get(target, key) {
            if (key === itemName) return itemValue;
            if (itemValue && key in itemValue) return itemValue[key];
            return target[key];
          },
        });
        return domToVNode(clone, scopedState);
      });
    }

    const tag = node.tagName.toLowerCase();

    if (components[tag]) {
      const props = {};
      Array.from(node.attributes).forEach(({name, value}) => {
        if (name.startsWith(":")) {
          const raw = name.slice(1);
          const propName = raw.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          const actualValue = localState[value];
          props[propName] =
            typeof actualValue === "function"
              ? actualValue.bind(localState)
              : actualValue;
        } else if (name === "data-key") {
          props.key = interpolate(value, localState);
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

    const props = {};
    Array.from(node.attributes).forEach(({name, value}) => {
      if (name === "data-key") {
        props.key = interpolate(value, localState);
      } else if (name !== "data-if" && name !== "data-for") {
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
