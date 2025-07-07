import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import Number from "./number.js";

export default function Counter() {
  return createComponent({
    setup: () => ({
      count: 0,
      increment() {
        console.log("this.count", this.count);
        this.count++;
      },
    }),
    components: {Number},
    styles: {
      p: {
        margin: "0 0 8px 0",
        fontSize: "20px",
        color: "inherit",
      },
      button: ({count}) => ({
        padding: "6px 12px",
        fontSize: "16px",
        cursor: "pointer",
        backgroundColor: count > 0 ? "#cfe2ff" : "#e2e3e5",
        border: "1px solid #999",
        borderRadius: "4px",
      }),
    },
    template: `
      <div>
        <number :number="count"></number>
        <button data-onclick="increment">+1</button>
      </div>
    `,
  });
}
