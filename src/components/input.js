import {createComponent} from "@/lib/ui-kit/core/createComponent.js";

export default function Input() {
  return createComponent({
    setup: () => ({
      value: "",
      updateValue(e) {
        console.log("Input value changed:", e.target.value);
        this.value = e.target.value; // Proxy가 감지하고 자동 렌더 호출
      },
    }),
    template: `
      <div>
        <div>{{ value }}</div>
        <input
          data-onchange="updateValue"
          value="{{ value }}"
        />
      </div>
    `,
  });
}
