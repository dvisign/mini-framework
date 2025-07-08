// App.js
import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import Counter from "@/components/counter.js";
import Input from "@/components/input.js";
import Example from "@/components/example.js";

export default function App() {
  return createComponent({
    setup: () => ({}),
    components: {Counter, Input, Example}, // 추가
    template: `
      <div>
        <h1>App</h1>
        <counter></counter>
        <input></input>
        <example></example>
      </div>
    `,
  });
}
