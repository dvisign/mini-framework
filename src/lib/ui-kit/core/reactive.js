export function reactive(obj, onUpdate) {
  return new Proxy(obj, {
    get(target, key) {
      return target[key];
    },
    set(target, key, val) {
      target[key] = val;
      if (typeof onUpdate === "function") {
        onUpdate();
      }
      return true;
    },
  });
}
