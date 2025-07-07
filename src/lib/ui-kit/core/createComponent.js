// /src/lib/ui-kit/core/createComponent.js
import {parseTemplateToVNode, bindEvents} from "./templateEngine.js";
import {createElement, diff} from "./virtualDom.js";

export function createComponent({setup, template, components = {}}) {
  // componentMap: 태그명(소문자) → 컴포넌트 함수
  const componentMap = {};
  Object.entries(components).forEach(([name, Comp]) => {
    componentMap[name.toLowerCase()] = Comp;
  });

  const rawState = setup();
  const state = new Proxy(rawState, {
    set(target, key, value) {
      target[key] = value;
      render();
      return true;
    },
  });

  const container = document.createElement("div");
  let oldVNode = null;

  function render() {
    const newVNode = parseTemplateToVNode(template, state, componentMap);
    if (!oldVNode) {
      const el = createElement(newVNode);
      container.innerHTML = "";
      container.appendChild(el);
    } else {
      diff(oldVNode, newVNode, container);
    }
    oldVNode = newVNode;
    bindEvents(container, state);
  }

  render();
  return container;
}
