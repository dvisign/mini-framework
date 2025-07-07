// /src/lib/ui-kit/core/virtualDom.js
export function createElement(vnode) {
  if (typeof vnode === "string") return document.createTextNode(vnode);
  if (vnode.component) return vnode.component();

  const {tag, props = {}, children = []} = vnode;
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => el.setAttribute(k, v));
  children.forEach((child) => el.appendChild(createElement(child)));
  return el;
}

export function diff(oldVNode, newVNode, parent, index = 0) {
  // 마운트
  if (oldVNode === undefined) {
    parent.appendChild(createElement(newVNode));
    return;
  }
  const oldEl = parent.childNodes[index];

  // 제거
  if (newVNode === undefined) {
    if (oldEl) parent.removeChild(oldEl);
    return;
  }

  // 텍스트 노드
  if (typeof oldVNode === "string" && typeof newVNode === "string") {
    if (oldVNode !== newVNode) {
      parent.replaceChild(document.createTextNode(newVNode), oldEl);
    }
    return;
  }

  // 타입 또는 컴포넌트 변경 → 교체
  if (
    typeof oldVNode !== typeof newVNode ||
    oldVNode.tag !== newVNode.tag ||
    oldVNode.component !== newVNode.component
  ) {
    parent.replaceChild(createElement(newVNode), oldEl);
    return;
  }

  // 컴포넌트 노드: 내부 유지
  if (newVNode.component) return;

  // 동일 태그: props 업데이트
  updateProps(oldEl, oldVNode.props, newVNode.props);

  // 자식 diff
  const oldLen = oldVNode.children.length;
  const newLen = newVNode.children.length;
  for (let i = 0; i < Math.max(oldLen, newLen); i++) {
    diff(oldVNode.children[i], newVNode.children[i], oldEl, i);
  }
}

function updateProps(el, oldProps = {}, newProps = {}) {
  // 제거된 속성
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) el.removeAttribute(key);
  });
  // 추가/변경
  Object.entries(newProps).forEach(([key, value]) => {
    if (oldProps[key] !== value) el.setAttribute(key, value);
  });
}
