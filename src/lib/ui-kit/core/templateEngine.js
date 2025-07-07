// /src/lib/ui-kit/core/templateEngine.js
// 이벤트 바인딩 중복 방지를 위해 WeakMap 사용
const boundEventsMap = new WeakMap();

export function parseTemplateToVNode(template, state, components) {
  const html = template.replace(/{{\s*(\w+)\s*}}/g, (_, k) => state[k] ?? "");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();

  function domToVNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    const tag = node.tagName.toLowerCase();

    // 커스텀 컴포넌트 노드
    if (components[tag]) {
      return {component: components[tag]};
    }

    // 일반 DOM 노드
    const props = {};
    Array.from(node.attributes).forEach(({name, value}) => {
      props[name] = value;
    });
    const children = Array.from(node.childNodes).map(domToVNode);
    return {tag, props, children};
  }

  return domToVNode(wrapper.firstElementChild);
}

export function bindEvents(root, state) {
  root.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach(({name, value}) => {
      if (!name.startsWith("data-on")) return;
      // data-onclick -> click, data-onchange -> input
      const eventKey = name.slice(7).toLowerCase();
      const type = eventKey === "change" ? "input" : eventKey;
      const handler = state[value];
      if (typeof handler !== "function") return;

      // 중복 바인딩 방지
      let boundSet = boundEventsMap.get(el);
      if (!boundSet) {
        boundSet = new Set();
        boundEventsMap.set(el, boundSet);
      }
      if (boundSet.has(name)) return;

      el.addEventListener(type, handler.bind(state));
      boundSet.add(name);
    });
  });
}
