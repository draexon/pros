import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Pros from "../dist/pros.js";
const require = createRequire(import.meta.url);
const catalog = JSON.parse(
  await readFile(new URL("../src/catalog.json", import.meta.url), "utf8"),
);
const render = (C, props = {}) =>
  renderToStaticMarkup(
    createElement(Pros.ProsProvider, null, createElement(C, props)),
  );
test("ships 210 distinct public components across 14 complete collections", () => {
  assert.equal(catalog.length, 210);
  assert.equal(new Set(catalog.map((x) => x.name)).size, 210);
  assert.equal(new Set(catalog.map((x) => x.slug)).size, 210);
  const groups = Object.groupBy(catalog, (x) => x.category);
  assert.equal(Object.keys(groups).length, 14);
  for (const [category, items] of Object.entries(groups))
    assert.equal(items.length, 15, category);
  for (const entry of catalog)
    assert.equal(typeof Pros[entry.name], "function", entry.name);
});
test("CommonJS and ES module consumers receive the same public components", () => {
  const cjs = require("../dist/pros.cjs");
  for (const entry of catalog)
    assert.equal(typeof cjs[entry.name], "function", entry.name);
});
for (const entry of catalog) {
  test(
    entry.name +
      " renders on the server with defaults and caller-supplied content",
    () => {
      const C = Pros[entry.name];
      const standard = render(C);
      assert.ok(standard.length > 80);
      assert.ok(!standard.includes("NaN"), entry.name);
      assert.ok(!standard.includes("[object Object]"), entry.name);
      const custom = render(C, {
        title: "A custom title",
        description: "A custom description",
        items: [
          { label: "One", value: "25", description: "First" },
          { label: "Two", value: "50", description: "Second" },
        ],
      });
      assert.ok(custom.length > 80);
      assert.doesNotThrow(() => render(C, { items: [] }));
      for (const tag of standard.match(/<button\b[^>]*>/g) ?? [])
        assert.match(
          tag,
          /\btype="(?:button|submit)"/,
          "Buttons must not accidentally submit parent forms: " + entry.name,
        );
    },
  );
}
test("controlled values render correctly for toggles, progress, and numeric fields", () => {
  assert.match(render(Pros.ToggleInput, { value: "true" }), /checked=""/);
  assert.match(render(Pros.ProgressMeter, { value: "42" }), /value="42"/);
  assert.match(render(Pros.NumberStepper, { value: "7" }), /value="7"/);
  assert.match(
    render(Pros.LikeButton, { value: "true" }),
    /aria-pressed="true"/,
  );
});
test("billing, order, cart, and bundle amounts reflect real local calculations", () => {
  assert.match(
    render(Pros.PricingCard, { value: "true", min: 18, max: 24 }),
    /\$18/,
  );
  assert.match(
    render(Pros.PricingCard, { value: "false", min: 18, max: 24 }),
    /\$24/,
  );
  assert.match(
    render(Pros.OrderSummary, {
      items: [
        { label: "Item", value: "20" },
        { label: "Shipping", value: "5" },
      ],
    }),
    /\$25\.00/,
  );
  assert.match(render(Pros.CartItem, { value: "3", min: 12 }), /\$36\.00/);
  assert.match(render(Pros.BundleBuilder), /Add bundle · \$24/);
});
test("repeated instances use unique field and SVG identifiers", () => {
  const tree = renderToStaticMarkup(
    createElement(
      Pros.ProsProvider,
      null,
      createElement(Pros.FloatingInput),
      createElement(Pros.FloatingInput),
      createElement(Pros.CircularText),
      createElement(Pros.CircularText),
      createElement(Pros.RestockNotice),
      createElement(Pros.RestockNotice),
    ),
  );
  const ids = [...tree.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
  assert.equal(new Set(ids).size, ids.length);
});
test("motion can be disabled at the provider boundary", () => {
  const html = renderToStaticMarkup(
    createElement(
      Pros.ProsProvider,
      { motion: false },
      createElement(Pros.MorphingShape),
    ),
  );
  assert.match(html, /data-motion="off"/);
});
test("form submit controls retain submit behavior", () => {
  for (const name of [
    "CouponInput",
    "RestockNotice",
    "CommentThread",
    "ChatPanel",
    "InviteForm",
  ])
    assert.match(render(Pros[name]), /type="submit"/, name);
});

test("every catalog component retains its inspection marker, including labeled fields", () => {
  for (const entry of catalog)
    assert.ok(
      render(Pros[entry.name]).includes('data-pros="' + entry.name + '"'),
      entry.name,
    );
});

test("providers expose explicit dark and light themes without requiring browser globals", () => {
  for (const theme of ["dark", "light"])
    assert.match(
      renderToStaticMarkup(
        createElement(
          Pros.ProsProvider,
          { theme },
          createElement(Pros.SelectInput),
        ),
      ),
      new RegExp('data-theme="' + theme + '"'),
    );
});

test("disabled dropdown triggers cannot be activated", () => {
  for (const name of ["PopoverMenu", "SplitButton", "ContextMenu"])
    for (const button of render(Pros[name], { disabled: true }).match(
      /<button\b[^>]*>/g,
    ) ?? [])
      assert.match(button, /disabled=""/, name);
});

test("source, documentation and page metadata contain no em dash characters", async () => {
  const { readdir } = await import("node:fs/promises");
  async function inspect(url) {
    for (const entry of await readdir(url, { withFileTypes: true })) {
      const child = new URL(entry.name + (entry.isDirectory() ? "/" : ""), url);
      if (entry.isDirectory()) await inspect(child);
      else if (/\.(tsx?|css|json|md|html|mjs)$/.test(entry.name))
        assert.ok(
          !(await readFile(child, "utf8")).includes(String.fromCharCode(8212)),
          child.pathname,
        );
    }
  }
  for (const directory of ["src", "docs", "tests"])
    await inspect(new URL("../" + directory + "/", import.meta.url));
  for (const file of ["README.md", "COMPONENTS.md", "index.html"])
    assert.ok(
      !(
        await readFile(new URL("../" + file, import.meta.url), "utf8")
      ).includes(String.fromCharCode(8212)),
      file,
    );
});
