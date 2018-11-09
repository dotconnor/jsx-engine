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
module.exports = (path, locals = {}, callback) => {
  const res = new Promise(async (resolve, reject) => {
    let f;
    if (cache[path]) {
      f = cache[path];
    } else {
      const code = (await transform((await readFile(path)).toString(), {
        plugins: [['@babel/plugin-transform-react-jsx', {
          pragma: 'jsx'
        }]],
      })).code;
      const context = {module: {}, jsx, require };
      vm.runInNewContext(code, context);
      if (!context.module || !context.module.exports || !isFunction(context.module.exports)) {
        return reject('JSX file must return a function');
      }
      f = context.module.exports;
      cache[path] = f;
    }
    resolve(jsx.render(f(locals)));
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