import { prop, component } from "@tone-row/components";

const color = prop<"purple" | "green">({
  toDeclaration: (color) => ({ color }),
});

export const Type = component({
  displayName: "Type",
  defaultElement: "span",
  props: {
    color,
  },
});
