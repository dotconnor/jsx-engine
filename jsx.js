const addPx = require('add-px-to-style');

function jsx(nodeName, attributes, ...args) {
  let children = args.length ? [].concat(...args) : null;
  return { nodeName, attributes, children };
};
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
  let n = `<${vnode.nodeName}`
  let a = vnode.attributes || {};
  Object.keys(a).forEach( k => {
    if (k === 'style') {
      n += ` ${k}="${css(a[k])}"`;
    } else if (k === 'children') {

    } else {
      n += ` ${k}="${a[k]}"`
    }
  });
  n += ">";
  // render (build) and then append child nodes:
  ((vnode.attributes && vnode.attributes.children) || vnode.children || []).forEach( c => n += render(c) );
  n += `</${vnode.nodeName}>`;
  return n;
}
module.exports = jsx;