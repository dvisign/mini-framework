import {createComponent} from "@/lib/ui-kit/core/createComponent.js";

export default function Headers(props) {
  return createComponent({
    props,
    setup({}) {
      return {};
    },
    mount() {},
    styles: () => ({
      ".headers": {
        padding: "16px",
      },
    }),
    template: `
      <div class="headers">
        <h1>🗒️ Post-it Board</h1>
      </div>
    `,
  });
}
