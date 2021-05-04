import React from "react";

const _components: Record<
  string,
  ComponentArgs<Record<string, Prop<any>>>["props"]
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

type FunctionArgs<K extends Record<string, Prop<any>>> = {
  [P in keyof K]?: K[P] extends Prop<infer U> ? U : never;
};

type ComponentArgs<K> = {
  displayName: string;
  baseClass: string;
  props: K;
};

export function component<K extends Record<string, Prop<any>>>(
  args: ComponentArgs<K>
) {
  _components[args.baseClass] = args.props;
  const getComponentClassNameAndStyle = makeGetComponentClassNameAndStyle(args);
  const separateComponentProps = makeSeparateComponentProps(args.props);

  const Component = (props: FunctionArgs<K>) => {
    const { componentProps, elementProps } = separateComponentProps(props);
    const { style, className } = getComponentClassNameAndStyle(componentProps);
    const {
      className: elementClassName = "",
      style: elementStyle = {},
      ...remainingProps
    } = elementProps;
    return (
      <div
        className={[...className, elementClassName].filter(Boolean).join(" ")}
        style={{ ...style, ...(elementStyle as object) }} // this could trigger re-renders
        {...remainingProps}
      >
        Here we go again
      </div>
    );
  };
  Component.displayName = args.displayName;
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
>({ baseClass, props: config }: ComponentArgs<K>) {
  /**
   * Transforms props into the requisite classnames and css custom properties
   */
  return function getComponentClassNameAndStyle(props: FunctionArgs<K>) {
    let className = [baseClass];
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
    const config = _components[className];
    for (const prop in config) {
      const { toDeclaration, modifier = "", atRule = "" } = config[prop];
      const styleStr = Object.entries(toDeclaration(`var(--${String(prop)})`))
        .map(
          ([k, v]) =>
            `${k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${v}`
        )
        .join(";");
      const ruleset = `.${className}.${prop}${modifier} { ${styleStr} }`;
      // if they have an at rule, build the declaration but then store it in the atRules
      // object reflecting that atRule
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