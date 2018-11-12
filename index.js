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
function render(code, locals = {}, callback, path) {
  const res =  new Promise(async (resolve, reject) => {
    let f;
    if (cache[path] && (locals && locals.cache)) {
      f = cache[path];
    } else {
      try {
        f = await compile(code);
        resolve(jsxEngine(f, locals));
      } catch (e) {
        reject(e);
      }
    }
  });
  if (!callback) {
    return res;
  } else {
    res.then((html) => {
      callback(undefined, html);
    }).catch((err) => {
      callback(err);
    })
  }
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