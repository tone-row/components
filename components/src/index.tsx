import React, {
  ComponentPropsWithRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  ReactNode,
} from "react";

const _components: Record<
  string,
  ComponentArgs<Record<string, Prop<any>>, ElementType, boolean>
> = {};

export type Prop<T> = {
  toDeclaration: (variable: string) => Record<string, string>;
  toValue?: (propValue: T) => string | void;
  modifier?: string;
  atRule?: string;
};

export function prop<T>(args: Prop<T>): Prop<T> {
  return args;
}

type ComponentArgs<
  K extends Record<string, Prop<any>>,
  C extends ElementType = "div",
  P extends boolean = true
> = {
  displayName: string;
  defaultElement?: C;
  baseStyles?:
    | Record<string, string>
    | ((props: FunctionArgs<K>) => Record<string, string>);
  polymorphic?: P;
  props: K;
};

type FunctionArgs<K extends Record<string, Prop<any>>> = {
  [P in keyof K]?: K[P] extends Prop<infer U> ? U : never;
};

type PolymorphicArgs<
  P extends boolean,
  F extends ElementType = "div"
> = P extends true ? { as?: F } : {};

export function component<
  K extends Record<string, Prop<any>>,
  C extends ElementType = "div",
  P extends boolean = true
>(args: ComponentArgs<K, C, P>) {
  const { displayName, props, defaultElement, polymorphic } = args;
  if (!displayName.match(/^[A-Z][a-zA-Z0-9]+$/)) {
    throw new Error("Invalid displayName. Must match /^[A-Z][a-zA-Z0-9]+$/");
  }
  const baseClassName = displayName.toLocaleLowerCase();
  _components[baseClassName] = args;
  let element = defaultElement || "div";
  const getComponentClassNameAndStyle = makeGetComponentClassNameAndStyle({
    props,
    baseClassName,
  });
  const separateComponentProps = makeSeparateComponentProps(props);

  const Component = forwardRef(
    <F extends ElementType = C>(
      props: FunctionArgs<K> & {
        children: ReactNode;
      } & PolymorphicArgs<P, F> &
        ComponentPropsWithRef<F>,
      ref: ForwardedRef<F>
    ) => {
      const { componentProps, elementProps } = separateComponentProps(props);
      const { style, className } = getComponentClassNameAndStyle(
        componentProps
      );
      const {
        className: elementClassName = "",
        style: elementStyle = {},
        ...remainingProps
      } = elementProps;
      let As = element;
      if (polymorphic ?? true) {
        As = props.as || element;
      }
      return (
        <As
          ref={ref}
          className={[...className, elementClassName].filter(Boolean).join(" ")}
          style={{ ...style, ...(elementStyle as object) }}
          {...remainingProps}
        />
      );
    }
  );

  Component.displayName = displayName;
  return Component;
}

function makeSeparateComponentProps<K extends Record<string, Prop<any>>>(
  props: K
) {
  // will get more complicated when we add hover/responsive
  const propNames = Object.keys(props);
  return function separateComponentProps(props: FunctionArgs<K>) {
    const componentProps = {} as FunctionArgs<K>;
    const elementProps = {} as Record<string, unknown>;
    for (const key in props) {
      if (propNames.includes(key)) {
        componentProps[key] = props[key];
      } else {
        elementProps[key] = props[key];
      }
    }
    return { componentProps, elementProps };
  };
}

function makeGetComponentClassNameAndStyle<
  K extends Record<string, Prop<any>>
>({ baseClassName, props: config }: { baseClassName: string; props: K }) {
  /**
   * Transforms props into the requisite classnames and css custom properties
   */
  return function getComponentClassNameAndStyle(props: FunctionArgs<K>) {
    let className = [baseClassName];
    let style = {} as Record<string, string>;

    // Walk over config keys to determine what classes should be added based on props
    for (const key in config) {
      const { classNames, customProperties } = getPropClassNameAndStyle({
        key,
        config: config[key],
        props,
      });
      className = className.concat(classNames);
      style = { ...style, ...customProperties };
    }

    return { className, style };
  };
}

function getPropClassNameAndStyle<
  K extends Record<string, Prop<any>>,
  P extends keyof K
>({ key, config, props }: { key: P; config: K[P]; props: FunctionArgs<K> }) {
  const customProperties: Record<string, string> = {};
  const classNames: string[] = [];
  const { toValue } = config;
  const value = toValue ? toValue(props[key]) : props[key];
  if (typeof value !== "undefined") {
    const keyString = String(key);
    classNames.push(keyString);
    customProperties[`--${keyString}`] = String(value);
  }

  return { classNames, customProperties };
}

export function modifier(modifier: string) {
  return function <T>(props: Prop<T>): Prop<T> {
    return { ...props, modifier };
  };
}

export function atRule(atRule: string) {
  return function <T>(props: Prop<T>): Prop<T> {
    return { ...props, atRule };
  };
}

export function css() {
  const lines: string[] = [];
  const atRules: Record<string, string[]> = {};
  for (const className in _components) {
    const { props: config, baseStyles = {} } = _components[className];

    // Add base styles
    if (typeof baseStyles === "function") {
      lines.push(
        createRuleset(`.${className}`, cssObjToStr(baseStyles(config)))
      );
    } else if (Object.keys(baseStyles)) {
      lines.push(createRuleset(`.${className}`, cssObjToStr(baseStyles)));
    }

    for (const prop in config) {
      const { toDeclaration, modifier = "", atRule = "" } = config[prop];

      const ruleset = createRuleset(
        `.${className}.${prop}${modifier}`,
        cssObjToStr(toDeclaration(`var(--${String(prop)})`))
      );

      // if they have an at rule, build the declaration but then store it in the atRules
      if (atRule) {
        if (!(atRule in atRules)) atRules[atRule] = [];
        atRules[atRule].push(ruleset);
      } else {
        lines.push(ruleset);
      }
    }
  }

  for (const atRule in atRules) {
    lines.push(atRule + " {");
    for (const rule of atRules[atRule]) {
      lines.push(rule);
    }
    lines.push("}\n");
  }

  return lines.join("");
}

function cssObjToStr(cssObj: Record<string, string>) {
  return Object.entries(cssObj)
    .map(
      ([k, v]) =>
        `${k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${v}`
    )
    .join(";");
}

function createRuleset(selectors: string, declarations: string) {
  return `${selectors} { ${declarations} }`;
}
