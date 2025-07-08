export function createElement(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }
  if (vnode.component) {
    const props = vnode.props || {};
    return vnode.component(props);
  }
  const {tag, props = {}, children = []} = vnode;
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
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

  if (oldVNode === undefined) {
    parent.appendChild(createElement(newVNode));
    return;
  }

  if (newVNode === undefined) {
    if (oldEl) parent.removeChild(oldEl);
    return;
  }

  if (typeof oldVNode === "string" && typeof newVNode === "string") {
    if (oldVNode !== newVNode) {
      parent.replaceChild(document.createTextNode(newVNode), oldEl);
    }
    return;
  }

  if (
    typeof oldVNode !== typeof newVNode ||
    oldVNode.tag !== newVNode.tag ||
    oldVNode.component !== newVNode.component
  ) {
    parent.replaceChild(createElement(newVNode), oldEl);
    return;
  }

  if (oldVNode.component) {
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};
    const propsChanged =
      Object.keys(oldProps).length !== Object.keys(newProps).length ||
      Object.entries(newProps).some(([k, v]) => oldProps[k] !== v);

    if (propsChanged) {
      const newEl = newVNode.component(newVNode.props);
      parent.replaceChild(newEl, oldEl);
    }
    return;
  }

  updateProps(oldEl, oldVNode.props, newVNode.props);

  const oldChildren = oldVNode.children || [];
  const newChildren = newVNode.children || [];

  const getKey = (v, i) => v?.props?.["data-key"] ?? i;
  const oldMap = new Map(oldChildren.map((v, i) => [getKey(v, i), v]));
  const newMap = new Map(newChildren.map((v, i) => [getKey(v, i), v]));

  const oldKeys = [...oldMap.keys()];
  const newKeys = [...newMap.keys()];

  oldKeys.forEach((key, i) => {
    if (!newMap.has(key)) {
      diff(oldMap.get(key), undefined, oldEl, i);
    }
  });

  newKeys.forEach((key, i) => {
    diff(oldMap.get(key), newMap.get(key), oldEl, i);
  });
}

function updateProps(el, oldProps = {}, newProps = {}) {
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) el.removeAttribute(key);
  });
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
