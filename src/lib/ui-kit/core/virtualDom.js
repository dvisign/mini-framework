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
    el.setAttribute(k, v);
  });
  children.forEach((child) => el.appendChild(createElement(child)));
  return el;
}

export function diff(oldVNode, newVNode, parent, index = 0) {
  const oldEl = parent.childNodes[index];

  // 1) Mount
  if (oldVNode === undefined) {
    parent.appendChild(createElement(newVNode));
    return;
  }
  // 2) Unmount
  if (newVNode === undefined) {
    if (oldEl) parent.removeChild(oldEl);
    return;
  }
  // 3) 텍스트 노드 업데이트
  if (typeof oldVNode === "string" && typeof newVNode === "string") {
    if (oldVNode !== newVNode) {
      parent.replaceChild(document.createTextNode(newVNode), oldEl);
    }
    return;
  }
  // 4) 타입 또는 컴포넌트 변경 시 대체
  if (
    typeof oldVNode !== typeof newVNode ||
    oldVNode.tag !== newVNode.tag ||
    oldVNode.component !== newVNode.component
  ) {
    parent.replaceChild(createElement(newVNode), oldEl);
    return;
  }
  // 5) 컴포넌트 내부 렌더링에 맡김
  if (oldVNode.component) return;
  // 6) 동일 요소: props diff + children diff
  updateProps(oldEl, oldVNode.props, newVNode.props);
  const oldLen = oldVNode.children.length;
  const newLen = newVNode.children.length;
  for (let i = 0; i < Math.max(oldLen, newLen); i++) {
    diff(oldVNode.children[i], newVNode.children[i], oldEl, i);
  }
}

function updateProps(el, oldProps = {}, newProps = {}) {
  // 제거된 속성 삭제
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) el.removeAttribute(key);
  });
  // 추가/변경 속성 설정
  Object.entries(newProps).forEach(([key, value]) => {
    if (oldProps[key] !== value) el.setAttribute(key, value);
  });
}
