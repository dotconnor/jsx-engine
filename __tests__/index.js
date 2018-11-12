const jsx = require('../');
const path = require('path');

describe("jsx-engine", () => {
  describe('basic tags', () => {
    ['div', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
      it('should render a ' + tag, async () => {
        expect((await jsx.render(`module.exports = () => <${tag}></${tag}>`, {}))).toBe(`<${tag}></${tag}>`)
      });
    })
  })
  it('should render child components', async () => {
    expect(await jsx.render(`module.exports = () => <div><a></a></div>`)).toBe('<div><a></a></div>')
  });
  it('should render attributes', async () => {
    expect(await jsx.render(`const test = 5; module.exports = () => <div test={test}></div>`)).toBe('<div test="5"></div>')
  });
  it('should render style', async () => {
    expect(await jsx.render(`module.exports = () => <div style={{height: 5, backgroundColor: '#fff'}}></div>`)).toBe('<div style="height: 5px;background-color: #fff;"></div>')
  });
  it('should render the file with custom components', async () => {
    expect(await jsx(path.join(__dirname, 'index.jsx'), {hey: 'hey'})).toBe('<div><div></div></div>');
  });
  it('should render the children prop', async () => {
    expect(await jsx.render(`module.exports = () => <div children={[<div></div>]}></div>`)).toBe('<div><div></div></div>')
  });
  it('should return undefined (soft-fail) when no function is given', async () => {
    expect(await jsx.render(`module.exports = () => {<div></div>}`)).toBe('');
  });
  it('should render a string', async () => {
    expect(await jsx.render(`module.exports = () => <div>hey</div>`)).toBe('<div>hey</div>')
  });
  it('should get passed options', async () => {
    expect(await jsx.render(`module.exports = (opts) => <div>{opts.hey}</div>`, {hey: 'hey'})).toBe('<div>hey</div>')
  });
  describe('rejects', () => {
    it('should fail with parser error', () => {
      expect(jsx.render('<div>{{}}')).rejects;
    })
  })
});