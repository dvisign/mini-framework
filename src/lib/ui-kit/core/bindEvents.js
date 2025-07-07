export function bindEvents(el, ctx) {
  el.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const match = attr.name.match(/^data-on(.+)$/);
      if (match) {
        const eventType = match[1];
        const methodName = attr.value;
        if (typeof ctx[methodName] === "function") {
          el.addEventListener(eventType, ctx[methodName].bind(ctx));
        }
      }
    });
  });
}
