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

/* Box */
let toValue = (s: number | string) =>
  typeof s === "number" ? `calc(${s} * 10px)` : s;
const p = prop<number | string>({
  toValue,
  toDeclaration: (s) => ({ padding: s }),
});
const py = prop<number | string>({
  toValue,
  toDeclaration: (s) => ({ paddingTop: s, paddingBottom: s }),
});
const px = prop<number | string>({
  toValue,
  toDeclaration: (s) => ({ paddingLeft: s, paddingRight: s }),
});
const pt = prop<number | string>({
  toValue,
  toDeclaration: (s) => ({ paddingTop: s }),
});
const pb = prop<number | string>({
  toValue,
  toDeclaration: (s) => ({ paddingBottom: s }),
});
const pl = prop<number | string>({
  toValue,
  toDeclaration: (s) => ({ paddingLeft: s }),
});
const pr = prop<number | string>({
  toValue,
  toDeclaration: (s) => ({ paddingRight: s }),
});
const gap = prop<number | string>({
  toValue,
  toDeclaration: (s) => ({ gridGap: s }),
});
const template = prop<string>({
  toDeclaration: (s) => ({ gridTemplate: s }),
});
const content = prop<string>({
  toDeclaration: (v) => ({ placeContent: v }),
});
const items = prop<string>({
  toDeclaration: (v) => ({ placeItems: v }),
});
const self = prop<string>({
  toDeclaration: (v) => ({ placeSelf: v }),
});
const flow = prop<"row" | "column">({
  toDeclaration: (v) => ({ gridAutoFlow: v }),
});

const boxProps = {
  flow,
  p,
  py,
  px,
  pt,
  pb,
  pl,
  pr,
  gap,
  template,
  content,
  items,
  self,
};

export const Box = component({
  displayName: "Box",
  baseStyles: {
    display: "grid",
  },
  props: boxProps,
});

export { css } from "@tone-row/components";
