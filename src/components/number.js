import {createComponent} from "@/lib/ui-kit/core/createComponent.js";

export default function Number(props) {
  console.log("Number component rendered with number:", props);
  return createComponent({
    props,
    components: {},
    styles: {
      p: {
        margin: "0 0 8px 0",
        fontSize: "20px",
        color: "inherit",
      },
    },
    template: `
      <p>Count: {{ number }}</p>
    `,
  });
}
