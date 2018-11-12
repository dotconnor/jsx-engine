const addPx = require('add-px-to-style');

function jsx(nodeName, attributes, ...args) {
  let children = args.length ? [].concat(...args) : null;
  return { nodeName, attributes, children };
};
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
jsx.render = function render(vnode) {
  if (!vnode) {
    return "undefined";
  }
  if (vnode.split) return vnode;
  if (isFunction(vnode.nodeName)) {
    return render(vnode.nodeName({ ...vnode.attributes, children: (vnode.attributes && vnode.attributes.children) || vnode.children}));
  }
  if (vnode.nodeName === jsx.Fragment) {
    return (vnode.children || []).map(a => render(a)).join('');
  }
  let n = `<${vnode.nodeName}`
  let a = vnode.attributes || {};
  Object.keys(a).forEach( k => {
    if (k === 'style' && typeof a[k] === 'object') {
      n += ` ${k}="${css(a[k])}"`;
    } else if (k === 'children') {
      Object.assign(vnode.attributes, {children: a[k]})
    } else if (k === 'className') {
      n += ` class="${a[k]}"`
    } else {
      n += ` ${k}="${a[k]}"`
    }
  });
  n += ">";
  // if self closing tag then just return
  if (['area', 'base', 'col', 'embed', 'link', 'track', 'wbr', 'param', 'source', 'img', 'input', 'br', 'hr', 'meta'].includes(vnode.nodeName)) {
    return n;
  }
  // render (build) and then append child nodes:
  ((vnode.attributes && vnode.attributes.children) || vnode.children || []).forEach( c => n += render(c) );
  n += `</${vnode.nodeName}>`;
  return n;
}
module.exports = jsx;