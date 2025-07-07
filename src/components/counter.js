import {createComponent} from "@/lib/ui-kit/core/createComponent.js";

export default function Counter() {
  return createComponent({
    setup: () => ({
      count: 0,
      increment() {
        console.log("this.count", this.count); // ✅ 찍히는가?
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
