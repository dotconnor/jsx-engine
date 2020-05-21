import test from "ava";
import { join } from "path";
import jsx from "../src/index";

["div", "a", "h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
  test("basic-tags - should render a " + tag, async (t) => {
    t.is(
      await jsx.render(`module.exports = () => <${tag}></${tag}>`),
      `<${tag}></${tag}>`
    );
  });
});

test("child components", async (t) => {
  t.is(
    await jsx.render("module.exports = () => <div><a></a></div>"),
    "<div><a></a></div>"
  );
});

test("render attributes", async (t) => {
  t.is(
    await jsx.render(
      "const test = 5; module.exports = () => <div test={test}></div>"
    ),
    '<div test="5"></div>'
  );
});

test("convert className to class", async (t) => {
  t.is(
    await jsx.render('module.exports = () => <div className="test"></div>'),
    '<div class="test"></div>'
  );
});

test("render style attribute", async (t) => {
  t.is(
    await jsx.render(
      "module.exports = () => <div style={{height: 5, backgroundColor: '#fff'}}></div>"
    ),
    '<div style="height: 5px; background-color: #fff;"></div>'
  );
});

test("custom components", async (t) => {
  t.is(
    await jsx(join(__dirname, "index.jsx")),
    "<div><div><div></div></div></div>"
  );
});

test("children prop", async (t) => {
  t.is(
    await jsx.render(
      "module.exports = () => <div children={[<div></div>]}></div>"
    ),
    "<div><div></div></div>"
  );
});

test("children prop with custom component", async (t) => {
  t.is(
    await jsx.render(
      "const View = ({children}) => <div>{children}</div>; export default () => <View children={'hey'}></View>"
    ),
    "<div>hey</div>"
  );
});

test("soft-fail on no function", async (t) => {
  t.is(await jsx.render("module.exports = () => {<div></div>}"), "");
});

test("render string inside a component", async (t) => {
  t.is(
    await jsx.render("module.exports = () => <div>hey</div>"),
    "<div>hey</div>"
  );
});

test("render string when a string is returned", async (t) => {
  t.is(await jsx.render("module.exports = () => 'hey'"), "hey");
});

test("get passed options", async (t) => {
  t.is(
    await jsx.render("module.exports = (opts) => <div>{opts.hey}</div>", {
      hey: "hey",
    }),
    "<div>hey</div>"
  );
});

test("allow fragments", async (t) => {
  t.is(
    await jsx.render("module.exports = () => <><div /><div /></>", {}),
    "<div></div><div></div>"
  );
});

test("allow empty fragments", async (t) => {
  t.is(await jsx.render("module.exports = () => <></>", {}), "");
});

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
].forEach((tag) => {
  test(`single tag remains single - ${tag}`, async (t) => {
    t.is(await jsx.render(`module.exports = () => <${tag} />`, {}), `<${tag}>`);
  });
});

test.cb("callback option", (t) => {
  jsx.render(
    "module.exports = () => <div></div>",
    {},
    __filename,
    (err, html) => {
      t.is(html, "<div></div>");
      t.end();
    }
  );
});

test("throws on parse error", async (t) => {
  await t.throwsAsync(jsx.render("<div>{{}}"));
});

test("import another file", async (t) => {
  t.is(
    await jsx.render(
      'import View from "./index.jsx"; export default () => <View />',
      undefined,
      __filename
    ),
    "<div><div><div></div></div></div>"
  );
});

test("throw when file doesn't return a function", async (t) => {
  await t.throwsAsync(jsx.render("module.exports = {}"));
});
