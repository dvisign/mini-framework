import {createComponent} from "@/lib/ui-kit/core/createComponent.js";

export default function Counter() {
  return createComponent({
    setup: () => ({
      count: 0,
      increment() {
        this.count++;
      },
    }),
    template: `
      <div>
        <p>Count: {{ count }}</p>
        <button data-onclick="increment">+1</button>
      </div>
    `,
  });
}
