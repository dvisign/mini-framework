import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import Layout from "@/components/layout";

export default function App() {
  return createComponent({
    setup: () => ({}), // 초기 상태 없음
    components: {Layout},
    template: `
      <div>
        <layout></layout>
      </div>
    `,
  });
}
