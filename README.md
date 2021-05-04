<h1 style="text-align: center">@tone-row/components</h1>

---

Tiny API (1.2kb!) for creating styled, type-safe components. Focus more on **your theme** and less on _implementing your theme_ in css-material-styled-jsx-components-in-js.

Build design-systems faster 🤘

## Features

- Component Driven
- Type Safe
- Minimal Runtime / Easily compiles to _.css_
- Tiny API
- Polymorphic

## Usage

```tsx
/* theme.ts */
import { prop, component } from "@tone-row/components";

const color = prop<"papayawhip" | "peachpuff">({
  toDeclaration: (cssVar) => ({ color: cssVar }),
});

export const Type = component({
  displayName: "Type",
  props: {
    color,
  },
});

/* App.tsx */
import { css } from "@tone-row/components";
import { Type } from "./theme.ts";

export default function App() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = css();
    document.head.appendChild(style);
  }, []);
  return (
    <div>
      <Type color="peachpuff">Hello World</Type>
    </div>
  );
}
```

Next Steps

- see if you can type the css
- add generate function to produce css file
