import test from "ava";
import path from "path";
import jsx from "../src/index";
const request = require("supertest");
const express = require("express");

const makeApp = (): any => {
  const app = express();
  app.engine("jsx", jsx);
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "jsx");
  return app;
};

test("return a html body", async (t) => {
  t.plan(1);
  const app = makeApp();
  app.get("/", (req: any, res: any) => {
    res.render("index");
  });
  const res = await request(app).get("/").send();
  t.is(res.text, "<html><head></head><body></body></html>");
});

test("passes options to jsx", async (t) => {
  t.plan(1);
  const app = makeApp();
  app.get("/", (req: any, res: any) => {
    res.render("locals", { text: "hey" });
  });
  const res = await request(app).get("/").send();
  t.is(res.text, "<html><head></head><body>hey</body></html>");
});

test("allows for imports and exports", async (t) => {
  t.plan(1);
  const app = makeApp();
  app.get("/", (req: any, res: any) => {
    res.render("imports");
  });
  const res = await request(app).get("/").send();
  t.is(res.text, "<div><a>Hello There!</a></div>");
});
