function jsx(nodeName, attributes, ...args) {
  let children = args.length ? [].concat(...args) : null;
  return { nodeName, attributes, children };
};
jsx.render = function render(vnode) {
  if (vnode.split) return vnode;
  let n = `<${vnode.nodeName}`
  let a = vnode.attributes || {};
  Object.keys(a).forEach( k => n += ` "${k}"="${k[n]}"`);
  n += ">";
  // render (build) and then append child nodes:
  (vnode.children || []).forEach( c => n += render(c) );
  n += `</${vnode.nodeName}>`;
  return n;
}
module.exports = jsx;