const addPx = require('add-px-to-style');

function jsx(nodeName, attributes, ...args) {
  let children = args.length ? [].concat(...args) : null;
  return { nodeName, attributes, children };
}
jsx.Fragment = Symbol('Fragment');
function css(style) {
  return Object.entries(style).reduce((styleString, [propName, propValue]) => {
    propName = propName.replace(/([A-Z])/g, matches => `-${matches[0].toLowerCase()}`);
    return `${styleString}${propName}: ${addPx(propName, propValue)};`;
  }, '')
}
function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}
function buildAtrributes(attributes) {
  let html = '';
  Object.keys(attributes).forEach(key => {
    if (key === 'style' && typeof attributes[key] === 'object') {
      html += ` ${key}="${css(attributes[key])}"`;
    } else if (key === 'children') {
      Object.assign(attributes, {children: attributes[key]})
    } else if (key === 'className') {
      html += ` class="${attributes[key]}"`
    } else {
      html += ` ${key}="${attributes[key]}"`
    }
  });
  return html;
}
jsx.render = function render(vnode) {
  if (!vnode) return "";
  if (vnode.split) return vnode;
  if (isFunction(vnode.nodeName)) return render(vnode.nodeName({ ...vnode.attributes, children: (vnode.attributes && vnode.attributes.children) || vnode.children}));
  if (vnode.nodeName === jsx.Fragment) return (vnode.children || []).map(a => render(a)).join('');
  let html = `<${vnode.nodeName}`
  let attributes = vnode.attributes || {};
  html += buildAtrributes(attributes);
  html += ">";
  // if self closing tag then just return
  if (['area', 'base', 'col', 'embed', 'link', 'track', 'wbr', 'param', 'source', 'img', 'input', 'br', 'hr', 'meta'].includes(vnode.nodeName)) {
    return html;
  }
  // render (build) and then append child nodes:
  html += ((attributes && attributes.children) || vnode.children || []).map(child => render(child)).join('');
  html += `</${vnode.nodeName}>`;
  return html;
}
module.exports = jsx;