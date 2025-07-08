// /src/lib/ui-kit/core/virtualDom.js
export function createElement(vnode) {
  // 텍스트 노드
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }
  // 커스텀 컴포넌트 렌더링
  if (vnode.component) {
    const props = vnode.props || {};
    return vnode.component(props);
  }
  // 일반 요소 렌더링
  const {tag, props = {}, children = []} = vnode;
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    // input, textarea 등 value 프로퍼티를 직접 갱신
    if (k === "value" && "value" in el) {
      el.value = v;
    } else {
      el.setAttribute(k, v);
    }
  });
  children.forEach((child) => el.appendChild(createElement(child)));
  return el;
}

export function diff(oldVNode, newVNode, parent, index = 0) {
  const oldEl = parent.childNodes[index];

  // Mount
  if (oldVNode === undefined) {
    parent.appendChild(createElement(newVNode));
    return;
  }
  // Unmount
  if (newVNode === undefined) {
    if (oldEl) parent.removeChild(oldEl);
    return;
  }
  // Text node
  if (typeof oldVNode === "string" && typeof newVNode === "string") {
    if (oldVNode !== newVNode) {
      parent.replaceChild(document.createTextNode(newVNode), oldEl);
    }
    return;
  }
  // Different type or component
  if (
    typeof oldVNode !== typeof newVNode ||
    oldVNode.tag !== newVNode.tag ||
    oldVNode.component !== newVNode.component
  ) {
    parent.replaceChild(createElement(newVNode), oldEl);
    return;
  }
  // Component node: remount if props changed
  if (oldVNode.component) {
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};
    const propsChanged =
      Object.keys(oldProps).length !== Object.keys(newProps).length ||
      Object.entries(newProps).some(([k, v]) => oldProps[k] !== v);
    if (propsChanged) {
      parent.replaceChild(createElement(newVNode), oldEl);
    }
    return;
  }
  // Same tag: update attributes & diff children
  updateProps(oldEl, oldVNode.props, newVNode.props);
  const oldLen = oldVNode.children.length;
  const newLen = newVNode.children.length;
  for (let i = 0; i < Math.max(oldLen, newLen); i++) {
    diff(oldVNode.children[i], newVNode.children[i], oldEl, i);
  }
}

function updateProps(el, oldProps = {}, newProps = {}) {
  // remove old attributes
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) el.removeAttribute(key);
  });
  // add/update new attributes
  Object.entries(newProps).forEach(([key, value]) => {
    if (oldProps[key] !== value) {
      if (key === "value" && "value" in el) {
        el.value = value;
      } else {
        el.setAttribute(key, value);
      }
    }
  });
}
