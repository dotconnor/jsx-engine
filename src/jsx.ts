import addPx from "add-px-to-style";

// eslint-disable-next-line @typescript-eslint/naming-convention
const Fragment = Symbol("jsx.Fragment");

export type Props = {
  [key: string]: any;
  children?: VNode[] | null;
};
export type Component = (props: Props) => VNode;
export interface VNode {
  nodeName: string | Component | typeof Fragment;
  attributes: Props;
  children?: VNode[] | null;
}

interface Attributes {
  [key: string]: string | Record<string, string>;
}

function jsx(
  nodeName: string,
  attributes: Attributes,
  ...args: VNode[]
): VNode {
  const children = args.length ? [].concat(...(args as never[])) : null;
  return { nodeName, attributes, children };
}

function css(style: Record<string, string>): string {
  return Object.entries(style)
    .reduce((styleString, [propName, propValue]) => {
      const name = propName.replace(
        /([A-Z])/g,
        (matches) => `-${matches[0].toLowerCase()}`
      );
      return `${styleString} ${name}: ${addPx(name, propValue)};`;
    }, "")
    .trim();
}

function buildAttributes(attributes: Attributes): string {
  let html = "";
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "style" && typeof value === "object") {
      html += ` ${key}="${css(value)}"`;
    } else if (key === "children") {
      Object.assign(attributes, { children: value });
    } else if (key === "className") {
      html += ` class="${value}"`;
    } else {
      html += ` ${key}="${value}"`;
    }
  });
  return html;
}

jsx.render = function render(vnode: VNode): string {
  if (!vnode) {
    return "";
  }

  if (typeof vnode === "string") {
    return vnode;
  }

  if (typeof vnode.nodeName === "function") {
    return render(
      vnode.nodeName({
        ...vnode.attributes,
        children:
          (vnode.attributes && vnode.attributes.children) || vnode.children,
      })
    );
  }

  if (vnode.nodeName === Fragment) {
    return (vnode.children || []).map((child) => render(child)).join("");
  }

  let html = `<${vnode.nodeName}`;
  const attributes = vnode.attributes || {};
  html += buildAttributes(attributes);
  html += ">";
  if (
    [
      "area",
      "base",
      "col",
      "embed",
      "link",
      "track",
      "wbr",
      "param",
      "source",
      "img",
      "input",
      "br",
      "hr",
      "meta",
    ].includes(vnode.nodeName as string)
  ) {
    return html;
  }

  html += ((attributes && attributes.children) || vnode.children || [])
    .map((child) => render(child))
    .join("");
  html += `</${vnode.nodeName}>`;
  return html;
};

module.exports = jsx;
module.exports.Fragment = Fragment;
export default jsx;
export { Fragment };
