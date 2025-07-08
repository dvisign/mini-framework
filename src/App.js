// /src/App.js
import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import PostItBoard from "@/components/postItBoard.js";

export default function App() {
  return createComponent({
    setup: () => ({}), // 초기 상태 없음
    components: {PostItBoard},
    template: `
      <div>
        <h1>🗒️ Post-it Board</h1>
        <postitboard></postitboard>
      </div>
    `,
  });
}
