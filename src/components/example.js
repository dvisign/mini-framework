// /src/components/ExampleList.js
import {createComponent} from "@/lib/ui-kit/core/createComponent.js";

export default function Example() {
  return createComponent({
    setup: () => ({
      items: ["🍎 Apple", "🍌 Banana"],
      newItem: "",
      showList: true,
      get buttonLabel() {
        return this.showList ? "Hide" : "Show";
      },
      toggleList() {
        this.showList = !this.showList;
      },
      updateNewItem(e) {
        this.newItem = e.target.value;
      },
      addItem() {
        if (!this.newItem.trim()) return;
        this.items = [...this.items, this.newItem.trim()];
        this.newItem = "";
      },
    }),
    watch: {
      items(newVal, oldVal) {
        console.log("items changed:", oldVal, "→", newVal);
      },
      showList(newVal) {
        console.log("showList:", newVal);
      },
    },
    mount() {
      console.log("ExampleList mounted:", this.items);
    },
    template: `
      <div>
        <h2>🍋 Example List</h2>
        <button data-onclick="toggleList">
          {{ buttonLabel }} List
        </button>

        <!-- 조건 렌더링 -->
        <div data-if="showList">
          <ul>
            <!-- 반복 렌더링 -->
            <li data-for="item in items">{{ item }}</li>
          </ul>
        </div>

        <div style="margin-top:8px;">
          <!-- 값 바인딩 -->
          <input
            placeholder="새 항목 입력"
            data-onchange="updateNewItem"
            value="{{ newItem }}"
          />
          <button data-onclick="addItem">Add</button>
        </div>
      </div>
    `,
  });
}
