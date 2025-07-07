// App.js
import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import Counter from "@/components/counter.js";
import Input from "@/components/input.js";

export default function App() {
  return createComponent({
    setup: () => ({}),
    components: {Counter, Input}, // 추가
    template: `
      <div>
        <h1>App</h1>
        <component is="Counter"></component> 
        <component is="Input"></component> 
      </div>
    `,
  });
}
