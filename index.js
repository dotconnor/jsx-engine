const babel = require("@babel/core");
const vm = require('vm');
const jsx = require('./jsx');
const { promisify } = require('util');
let { readFile } = require('fs');
readFile = promisify(readFile);
const { transform } = babel;
const cache = {};
function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}
async function renderFile(path, locals = {}, callback) {
  return render((await readFile(path)).toString(), locals, callback, path);
}
async function render(code, locals = {}, callback, path) {
  let f;
  if (path && cache[path] && (locals && locals.cache)) {
    f = cache[path];
  } else {
    try {
      f = await compile(code);
    } catch (e) {
      if (callback) {
        callback(e)
        return;
      }
      throw e;
    }
  }
  const html = jsxEngine(f, locals);
  if (!callback) {
    return html;
  }
  callback(undefined, html);
}
async function compile(code) {
  try {
    code = (await transform(code, {
      plugins: [['@babel/plugin-transform-react-jsx', {
        pragma: 'jsx',
        pragmaFrag: 'jsx.Fragment',
      }]],
    })).code;
  } catch (e) {
    throw e;
  }
  const context = {module: {}, jsx, require };
  vm.runInNewContext(code, context);
  if (!context.module || !context.module.exports || !isFunction(context.module.exports)) {
    throw new Error('JSX file must return a function');
  }
  f = context.module.exports;
  return f;
}
function jsxEngine(f, locals = {}) {
  return jsx.render(f(locals));
}

renderFile.__express = renderFile;
renderFile.render = render;
module.exports = renderFile;