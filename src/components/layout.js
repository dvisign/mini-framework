import {createComponent} from "@/lib/ui-kit/core/createComponent.js";
import PostItBoard from "@/components/postItBoard.js";
import Headers from "@/components/header";

export default function Layout(props) {
  return createComponent({
    props,
    components: {PostItBoard, Headers},
    setup({}) {
      return {};
    },
    mount() {},
    styles: () => ({}),
    template: `
      <div class="layouts">
        <headers></headers>
        <postitboard></postitboard>
      </div>
    `,
  });
}
