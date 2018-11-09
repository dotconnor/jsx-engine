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
function renderFile(path, locals = {}, callback) {
  const res =  new Promise(async (resolve, reject) => {
    let f;
    if (cache[path]) {
      f = cache[path];
    } else {
      try {
        f = await compile((await readFile(path)).toString());
        cache[path] = f;
      } catch (e) {
        reject(e);
      }
    }
    try {
      resolve(jsxEngine(f, locals));
    } catch (e) {
      reject(e);
    }
  });
  if (!callback) {
    return res;
  }
  res.then((html) => {
    callback(undefined, html);
  }).catch((err) => {
    callback(err);
  })
}
function render(code, locals = {}, callback) {
  const res =  new Promise(async (resolve, reject) => {
    try {
      const f = await compile(code);
      resolve(jsxEngine(f, locals));
    } catch (e) {
      reject(e);
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
        pragma: 'jsx'
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