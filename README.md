![@tone-row/components](/components.png)

# @tone-row/components

A 1.4kb, component-focused library for creating styled, type-safe components in React apps. Intended to be used alongside css.

## Features

- Component Driven
- Type Safe
- Minimal runtime using [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Polymorphic Components](https://www.benmvp.com/blog/polymorphic-react-components-typescript/)
- Develop dynamically, generate static .css for deployment

## Basic Usage

1. [Declare Props](#declare-props)
1. [Build Components](#build-components)
1. [Export `{ css }`](#export-css)
1. [Include CSS](#include-css)
1. [Use Components](#use-components)

### Declare Props

Declare a prop that will be added to a component using the `prop` function.

Use the `toDeclaration` argument to express which css property(-ies) this prop will control. Use the generic argument to specify the prop type.

```tsx
import { prop } from "@tone-row/components";

const color = prop<"royalblue" | "peachpuff">({
  toDeclaration: (cssVar) => ({ color: cssVar }),
});
```

Use the `toValue` argument to transform between the value passed to the component, and the value set on the css custom property.

```tsx
const fontSize = prop<"small" | "large">({
  toValue: (value) => (value === "small" ? "16px" : "32px"),
  toDeclaration: (cssVar) => ({ fontSize: cssVar }),
});
```

### Build Components

Build components by combining your props with the `component` function.

```tsx
import { component } from "@tone-row/components";

export const Type = component({
  displayName: "Type",
  props: {
    color,
    fontSize,
  },
});
```

### Export `css`

At the bottom of your [theme file](#theme-file) you must export the css function:

```tsx
// something like src/theme.ts or src/theme/index.ts

// components components...

export { css } from "@tone-row/components";
```

### Include CSS

`css` is a function that produces a CSS string. This makes it easy to use in a number of different environments. For instance, in [Next.js](https://nextjs.org/) we can use the `<Head>` component to get the benefit of being server-rendered.

```tsx
/* components/AppWrapper.tsx */

import Head from "next/head";
import { css } from "./theme";

export default function AppWrapper({ children }) {
  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: css() }} />
      </Head>

      {children}
    </>
  );
}
```

In environments without SSR we load styles on the client when the component mounts:

```tsx
/* App.tsx */

import { css } from "components/theme";

export default function App() {

  // Write css to style tag on mount
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = css();
    document.head.appendChild(style);

    return style.remove; // Clean up effect
  }, []);

  // ...rest of component
```

For a smaller runtime footprint, to benefit from browser-cacheing and reduce jank we recommend you [generate a css file](#generate-css).

### Use Components

Import and use your components 🎉

```tsx
import { Type } from "./theme";

export default function () {
  return (
    <main>
      <Type fontSize="large" color="royalblue">
        Hello World 🌍
      </Type>
    </main>
  );
}
```

---

## Advanced Usage

- [Modifiers](#modifiers) (psuedo states, attribute selectors)
- [@rules](#responsive-props) (responsive breakpoints)
- [Generate CSS](#generate-css)
- [Theme File](#theme-file)

### Modifiers

[coming soon]

### Responsive Props

[coming soon]

### Theme File

Depending on the size of your project, your components may fit in one file (for example `src/theme.tsx`) or they may require a folder (`src/theme/Button.tsx, src/theme/Modal.tsx, ...`)

If they require a folder, you'll need to make an entrypoint file to your theme which re-exports all of your components. For example:

```tsx
// src/theme/index.ts

export { Button } from "./Button";
export { Modal } from "./Modal";
```

### Generate CSS

[coming soon]
