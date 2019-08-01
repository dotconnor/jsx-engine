import vm from "vm";
import { readFile, readFileSync } from "fs";
import { promisify } from "util";
import { join, dirname } from "path";
import { transform, transformSync } from "@babel/core";
import jsx, { Component } from "./jsx";

const read = promisify(readFile);

const cache: {
  [key: string]: any;
} = {};

export interface Locals {
  [key: string]: any;
  cache?: boolean;
}

export type RenderCallback = (err?: Error | null, result?: string) => void;

const babelOptions = {
  plugins: [
    `@babel/plugin-transform-modules-commonjs`,
    [
      `@babel/plugin-transform-react-jsx`,
      {
        pragma: `jsx`,
        pragmaFrag: `jsx.Fragment`,
      },
    ],
  ],
};

const vmRequire = (_path: string): any => (path: string): any => {
  /* istanbul ignore if  */
  if (!_path || typeof _path !== `string`) {
    throw new Error(`Cannot not require without a proper path.`);
  }

  const modPath = join(_path, path);
  const _code = readFileSync(modPath).toString();
  const result = transformSync(_code, babelOptions);

  /* istanbul ignore if  */
  if (!result || result === null) {
    throw new Error(`Could not parse file: ${modPath}`);
  }

  const { code } = result;

  /* istanbul ignore if  */
  if (!code || code === null) {
    throw new Error(`Could not parse file: ${modPath}`);
  }

  const context = vm.createContext({
    module: {},
    jsx,
    require: vmRequire(dirname(modPath)),
    exports: {},
  });
  vm.runInContext(code, context);
  return context.module.exports;
};

async function compile(_code: string, _path?: string): Promise<Component> {
  try {
    const r = await transform(_code, babelOptions);
    /* istanbul ignore if  */
    if (!r || r === null) {
      throw new Error(`Could not parse file: ${_path}`);
    }

    const { code } = r;

    /* istanbul ignore if  */
    if (!code || code === null) {
      throw new Error(`Could not parse file: ${_path}`);
    }

    const context = vm.createContext({
      module: {},
      jsx,
      require: _path ? vmRequire(dirname(_path)) : () => void 0,
      exports: {},
    });
    vm.runInContext(code, context);
    let f: Component | undefined;
    if (
      context.module &&
      context.module.exports &&
      typeof context.module.exports === `function`
    ) {
      f = context.module.exports;
    }

    if (
      context.exports &&
      context.exports.__esModule === true &&
      typeof context.exports.default === `function`
    ) {
      f = context.exports.default;
    }

    if (!f) {
      throw new Error(`JSX file must return a function`);
    }

    return f;
  } catch (e) {
    throw e;
  }
}

function jsxEngine(f: Component, locals: Locals = {}): string {
  return jsx.render(f(locals));
}

async function render(
  code: string,
  locals: Locals = {},
  path?: string,
  callback?: RenderCallback
): Promise<any> {
  let f;
  /* istanbul ignore if  */
  if (
    path &&
    cache[path] &&
    ((locals &&
      locals.settings &&
      locals.settings[`view cache`] &&
      locals.settings[`view cache`] === true) ||
      (locals && locals.cache && locals.cache === true))
  ) {
    f = cache[path];
  } else {
    try {
      f = await compile(code, path);
      if (path) {
        // eslint-disable-next-line require-atomic-updates
        cache[path] = f;
      }
    } catch (e) {
      /* istanbul ignore if  */
      if (callback) {
        callback(e);
      }

      throw e;
    }
  }

  const html = jsxEngine(f, locals);
  if (callback) {
    callback(undefined, html);
  }

  return html;
}

export async function renderFile(
  path: string,
  locals: Locals = {},
  callback?: RenderCallback
): Promise<string> {
  return render((await read(path)).toString(), locals, path, callback);
}

renderFile.__express = renderFile;
renderFile.render = render;

export const __express = renderFile;

export default renderFile;

module.exports = renderFile;
