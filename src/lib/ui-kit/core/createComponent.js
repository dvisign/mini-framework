import {reactive} from "./reactive.js";
import {compile} from "./compile.js";
import {bindEvents} from "./bindEvents.js";

export function createComponent({setup, template, components = {}}) {
  const el = document.createElement("div");
  let state;

  const render = () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = compile(template, state);

    // component 태그 처리
    wrapper.querySelectorAll("component[is]").forEach((node) => {
      const name = node.getAttribute("is");
      const child = components[name]?.();
      if (child) node.replaceWith(child);
    });

    // 이벤트 바인딩
    bindEvents(wrapper, state);

    // 📌 input[data-model]의 값만 수동 업데이트 (DOM 그대로 유지)
    wrapper.querySelectorAll("input[data-model]").forEach((input) => {
      const key = input.getAttribute("data-model");
      if (key in state) {
        input.value = state[key];
      }
    });

    // DOM 자식만 교체 (엘리먼트 유지)
    el.replaceChildren(...wrapper.childNodes);
  };

  state = reactive(setup(), render);
  render();

  return el;
}
