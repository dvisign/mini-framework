import {createComponent} from "@/lib/ui-kit/core/createComponent.js";

export default function Input() {
  return createComponent({
    setup: () => ({
      value: "",
      updateValue(e) {
        console.log("[Input:updateValue] called", e.target.value); // ✅ 찍히는가?
        this.value = e.target.value;
      },
    }),
    template: `
      <div>
        <div>{{ value }}</div>
        <input data-oninput="updateValue" data-model="value" />
      </div>
    `,
  });
}
