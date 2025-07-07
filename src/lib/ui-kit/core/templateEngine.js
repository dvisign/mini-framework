// /src/lib/ui-kit/core/templateEngine.js
// 이벤트 바인딩 중복 방지를 위해 WeakMap 사용 (이미 바인딩된 이벤트 추적)
const boundEventsMap = new WeakMap();

export function parseTemplateToVNode(template, state, components) {
  // 1. {{ key }} 바인딩
  const html = template.replace(
    /{{\s*(\w+)\s*}}/g,
    (_, key) => state[key] ?? ""
  );
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();

  // DOM -> VNode 변환 (재귀)
  function domToVNode(node) {
    // 텍스트 노드
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    const tag = node.tagName.toLowerCase();

    // 커스텀 컴포넌트 처리
    if (components[tag]) {
      const props = {};
      Array.from(node.attributes).forEach(({name, value}) => {
        if (name.startsWith(":")) {
          // 동적 바인딩 (props명: state 키)
          props[name.slice(1)] = state[value];
        } else {
          props[name] = value;
        }
      });
      // 자식 VNode 필요 시 포함
      const children = Array.from(node.childNodes).map(domToVNode);
      return {component: components[tag], props, children};
    }

    // 일반 DOM 요소 처리
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
  // 모든 data-on* 속성 이벤트 바인딩
  root.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach(({name, value}) => {
      if (!name.startsWith("data-on")) return;
      const eventKey = name.slice(7).toLowerCase();
      const eventType = eventKey === "change" ? "input" : eventKey;
      const handler = state[value];
      if (typeof handler !== "function") return;

      // 중복 바인딩 방지
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
