# @tone-row/components

A smol library for creating styled, type-safe components in React apps.

![npm version](https://img.shields.io/npm/v/@tone-row/components)
![bundle size](https://img.shields.io/bundlephobia/minzip/@tone-row/components)

## Features

- Component-first API
- Type Safe
- Minimal runtime using [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Polymorphic Components](https://www.benmvp.com/blog/polymorphic-react-components-typescript/)
- Develop dynamically
- Generate static `.css` file for deployment

## Basic Usage

1. [Declare Props](#declare-props)
1. [Build Components](#build-components)
1. [Export `{ css }`](#export-{-css-})
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

### Export `{ css }`

Export the css function at the bottom of your [theme file](#theme-file).

```tsx
// const color = ...
// const fontSize = ...
// export const Type = ...

export { css } from "@tone-row/components";
```

### Include CSS

The `css` export is a function that produces a css string. This makes it easy to use in different environments.

For example, in [Next.js](https://nextjs.org/) we can use the `<Head>` component to server-render our styles.

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

In environments without SSR we can load styles on the client when the component mounts:

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

**Note** These techniques are great for development, but for a smaller runtime footprint, to benefit from browser-cacheing and reduce jank we recommend you [generate a static css file](#generate-css).

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

## Advanced Usage

- [Modifiers](#modifiers) (psuedo states, attribute selectors)
- [@rules](#responsive-props) (responsive breakpoints)
- [Generate CSS](#generate-css)
- [Theme File](#theme-file)

### Modifiers

Modifiers make it easy to create props that control psuedo-states (like `:hover`) or attribute selectors (like `[aria-selected]`).

```tsx
// theme.ts
import { prop, modifier, component } from "@tone-row/components";

type ThemeColors = "red" | "blue" | "green";

const hover = modifier(":hover");

const bg = prop<ThemeColors>({
  toDeclaration: (v) => ({ backgroundColor: v }),
});

export const HoverableComponent = component({
  displayName: "HoverableComponent",
  props: {
    bg,
    bgHover: hover(bg),
  },
});
```

[View on CodeSandbox](https://codesandbox.io/s/modifier-example-yr2km?file=/src/theme.ts)

### Responsive Props

The `atRule` function allows you to create props which are only declare in @rules, such as media queries.

```tsx
// theme.ts
import { prop, atRule, component } from "@tone-row/components";

const fontSize = prop<number>({
  toDeclaration: (cssVar) => ({ fontSize: cssVar }),
  toValue: (n) => `${n * 4}px`,
});

const desktop = atRule("@media (min-width: 600px)");

export const Type = component({
  displayName: "Type",
  props: {
    fontSize,
    fontSizeDesktop: desktop(fontSize),
  },
});

export { css } from "@tone-row/components";
```

[View on CodeSandbox](https://codesandbox.io/s/loving-lederberg-w274n?file=/src/theme.ts)

### Theme File

Depending on the size of your project, your components may fit in one file (for example `src/theme.tsx`) or they may require a folder (`src/theme/Button.tsx, src/theme/Modal.tsx, ...`)

If they require a folder, you'll need to make an entrypoint file to your theme which re-exports all of your components. For example:

```tsx
// src/theme/index.ts

export { Button } from "./Button";
export { Modal } from "./Modal";
```

### Generate CSS

Generate css using the `generate-css` command

Pass a file, folder or glob to the `--watch` flag to watch the theme file for changes.

```json
  // package.json...
  "scripts": {
    "css": "generate-css --input theme/index.ts --output theme/style.css",
    "theme:watch": "yarn css --watch theme",
    "dev": "concurrently -n 'app,theme' 'react-scripts start' 'yarn css:watch'"
  },
  // ...
```
