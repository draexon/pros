import { test, expect } from "@playwright/test";
import catalog from "../../src/catalog.json" with { type: "json" };

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("pros.motion", "off"));
  test.info().annotations.push({
    type: "coverage",
    description: "Chromium interaction and layout regressions",
  });
  page.on("close", () => expect(errors).toEqual([]));
});

for (const theme of ["light", "dark"]) {
  for (const width of [390, 1440]) {
    test(`all 218 previews fit at ${width}px in ${theme} mode`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        (value) => localStorage.setItem("pros.theme", value),
        theme,
      );
      await page.goto("/#/components");
      const seen = new Set<string>();
      for (
        let i = 1;
        i <= new Set(catalog.map((entry) => entry.category)).size;
        i++
      ) {
        await page.locator(".category-button").nth(i).click();
        const category = [
          ...new Set(catalog.map((entry) => entry.category)),
        ].filter((id) => id !== "consumer");
        category.splice(1, 0, "consumer");
        await expect(page.locator(".component-tile")).toHaveCount(
          catalog.filter((entry) => entry.category === category[i - 1]).length,
        );
        const markers = await page
          .locator(".tile-component [data-pros]")
          .evaluateAll((elements) =>
            elements.map((el) => el.getAttribute("data-pros")!),
          );
        markers.forEach((name) => seen.add(name));
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      }
      expect([...seen].sort()).toEqual(catalog.map((item) => item.name).sort());
    });
  }
}

for (const [slug, label] of [
  ["popover-menu", "A few more options"],
  ["split-button", "More publishing options"],
  ["context-menu", "Object options"],
]) {
  test(`${slug} supports keyboard selection, dismissal and focus return`, async ({
    page,
  }) => {
    await page.goto("/#/component/" + slug);
    const trigger = page.getByRole("button", { name: label });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const options = page.locator(".p-action-menu button");
    await expect(options.first()).toBeFocused();
    await page.keyboard.press("End");
    await expect(options.last()).toBeFocused();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator(".p-action-menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await options.first().click();
    await expect(page.locator(".p-action-menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.locator(".detail-heading h1").click();
    await expect(page.locator(".p-action-menu")).toHaveCount(0);
  });
}

test("mobile menus stay inside the viewport and sort remains usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/component/popover-menu");
  await page.getByRole("button", { name: "A few more options" }).click();
  await expect(page.locator(".p-action-menu button").first()).toBeFocused();
  const bounds = (await page.locator(".p-action-menu").boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  await page.goto("/#/components");
  await page
    .getByRole("button", { name: "Sort components", exact: true })
    .click();
  await page.getByRole("menuitemradio", { name: /Name: A–Z/ }).click();
  await expect(page.locator(".tile-title b").first()).toHaveText(
    "Accordion Panel",
  );
  expect(
    (await page
      .getByRole("button", { name: "Sort components", exact: true })
      .boundingBox())!.height,
  ).toBeGreaterThanOrEqual(40);
});

test("confirm, undo, save undo, and the skip link preserve working state", async ({
  page,
}) => {
  await page.goto("/#/component/confirm-button");
  const button = page.locator('[data-pros="ConfirmButton"]');
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".event-log")).toContainText("undo");
  await page.locator(".detail-save").click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".detail-save")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await expect(page).toHaveURL(/confirm-button$/);
});

test("dialogs animate out, keep focus contained, and restore the trigger", async ({
  page,
}) => {
  await page.goto("/#/component/confirm-dialog");
  await page.getByRole("button", { name: "Motion off" }).click();
  const trigger = page.locator('[data-pros="ConfirmDialog"] > button');
  await trigger.click();
  await expect(page.locator("dialog")).toBeVisible();
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveAttribute("data-closing", "true");
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("theme changes in both directions persist and respect motion settings", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("pros.theme", "light"));
  await page.goto("/");
  await page.getByRole("button", { name: "Motion off" }).click();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("pros.theme")))
    .toBe("dark");
  // A new page shares storage without re-running the initial-theme script.
  const persisted = await page.context().newPage();
  await persisted.goto("/");
  await expect(persisted.locator("html")).toHaveAttribute("data-theme", "dark");
  await persisted.close();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Motion on" }).click();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
});

test("image accordion animates width in both directions and supports keyboard selection", async ({
  page,
}) => {
  await page.goto("/#/component/image-accordion");
  await page.getByRole("button", { name: "Motion off" }).click();
  const panels = page.locator(".p-image-accordion > button");
  await expect(panels.first()).toHaveAttribute("aria-expanded", "true");
  await panels.nth(1).click();
  await page.waitForTimeout(80);
  const expanding = await panels
    .nth(1)
    .evaluate((el) => Number(getComputedStyle(el).flexGrow));
  expect(expanding).toBeGreaterThan(1);
  expect(expanding).toBeLessThan(3);
  await panels.first().click();
  await page.waitForTimeout(50);
  const reversing = await panels
    .nth(1)
    .evaluate((el) => Number(getComputedStyle(el).flexGrow));
  expect(reversing).toBeLessThan(3);
  await expect
    .poll(() =>
      panels.first().evaluate((el) => Number(getComputedStyle(el).flexGrow)),
    )
    .toBe(3);
  await panels.first().focus();
  await page.keyboard.press("End");
  await expect(panels.last()).toBeFocused();
  await expect(panels.last()).toHaveAttribute("aria-expanded", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await panels.first().click();
  expect(
    await panels
      .first()
      .evaluate((el) => Number(getComputedStyle(el).flexGrow)),
  ).toBe(3);
});

for (const slug of ["pill-tabs", "segment-button"]) {
  test(`${slug} selection highlight travels continuously`, async ({ page }) => {
    await page.goto("/#/component/" + slug);
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole("button", { name: "Motion off" }).click();
    const track = page.locator(".detail-component .p-selection-track");
    await expect(track).toHaveAttribute("data-selection-ready", "true");
    const start = await track.evaluate(
      (el) => getComputedStyle(el, "::before").translate,
    );
    await track.locator("button").last().click();
    await page.waitForTimeout(70);
    const middle = await track.evaluate((el) => ({
      actual: getComputedStyle(el, "::before").translate,
      target:
        el.style.getPropertyValue("--selection-x") +
        " " +
        el.style.getPropertyValue("--selection-y"),
    }));
    expect(middle.actual).not.toBe(start);
    expect(middle.actual).not.toBe(middle.target);
    await expect
      .poll(() =>
        track.evaluate(
          (el) =>
            getComputedStyle(el, "::before").translate ===
            el.style.getPropertyValue("--selection-x") +
              " " +
              el.style.getPropertyValue("--selection-y"),
        ),
      )
      .toBe(true);
    await track.locator("button").first().click();
    await expect
      .poll(() =>
        track.evaluate((el) => getComputedStyle(el, "::before").translate),
      )
      .toBe(start);
  });
}

test("theme reveal contains final component colors without trailing transitions", async ({
  page,
}) => {
  await page.goto("/#/component/image-accordion");
  await page.getByRole("button", { name: "Motion off" }).click();
  const colors = () =>
    page.evaluate(() =>
      [
        ".site",
        ".detail-canvas",
        ".p-image-accordion .is-active",
        ".detail-tabs",
      ].map((selector) => {
        const style = getComputedStyle(document.querySelector(selector)!);
        return [style.backgroundColor, style.color];
      }),
    );
  for (let i = 0; i < 2; i++) {
    await page.locator(".theme-control").click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          document
            .getAnimations()
            .some(
              (animation) =>
                "animationName" in animation &&
                String(animation.animationName).startsWith("theme-reveal"),
            ),
        ),
      )
      .toBe(true);
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme-changing",
      "true",
    );
    const during = await colors();
    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation instanceof CSSTransition &&
                animation.playState === "running",
            ).length,
      ),
    ).toBe(0);
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme-changing",
    );
    expect(await colors()).toEqual(during);
  }
  const previous = await page.locator("html").getAttribute("data-theme");
  await page.locator(".theme-control").evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await expect(page.locator("html")).not.toHaveAttribute("data-theme-changing");
  await expect(page.locator("html")).toHaveAttribute("data-theme", previous!);
});

test("paper theme sweep uses opposing stepped paths on desktop and mobile", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.locator(".motion-control").click();
    const paths: string[] = [];
    for (let i = 0; i < 2; i++) {
      await page.locator(".theme-control").click();
      await page.waitForFunction(() =>
        document
          .getAnimations()
          .some(
            (animation) =>
              "animationName" in animation &&
              String(animation.animationName).startsWith("theme-reveal"),
          ),
      );
      const reveal = await page.evaluate(() => {
        const animation = document
          .getAnimations()
          .find(
            (animation) =>
              "animationName" in animation &&
              String(animation.animationName).startsWith("theme-reveal"),
          )!;
        return {
          frames: (animation.effect as KeyframeEffect)
            .getKeyframes()
            .map((frame) => String(frame.clipPath)),
          duration: animation.effect!.getTiming().duration,
        };
      });
      expect(reveal.frames).toHaveLength(3);
      expect(reveal.frames[1]).toContain("polygon(");
      expect(reveal.frames[1]).not.toBe(reveal.frames[0]);
      expect(reveal.frames[1]).not.toBe(reveal.frames[2]);
      paths.push(reveal.frames[1]);
      expect(reveal.duration).toBe(700);
      await expect(page.locator("html")).not.toHaveAttribute(
        "data-theme-changing",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(paths[0]).not.toBe(paths[1]);
  }
});

test("slash smoothly focuses search without hijacking typing and Escape clears then exits", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".motion-control").click();
  await page.keyboard.press("/");
  const search = page.getByRole("textbox", { name: "Search components" });
  await expect(search).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await search.fill("toggle");
  await expect(page.locator(".tile-title b").first()).toHaveText(
    "Toggle Input",
  );
  await page.keyboard.press("/");
  await expect(search).toHaveValue("toggle/");
  await page.keyboard.press("Escape");
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(search).not.toBeFocused();
  await expect(page.locator(".motion-control")).toBeFocused();
});

test("sort menu shows its selection, animates, and sorts through keyboard actions", async ({
  page,
}) => {
  await page.goto("/#/components");
  await page.locator(".motion-control").click();
  const trigger = page.getByRole("button", {
    name: "Sort components",
    exact: true,
  });
  await trigger.click();
  const curated = page.getByRole("menuitemradio", { name: /Curated order/ });
  await expect(curated).toBeFocused();
  await expect(curated).toHaveAttribute("aria-checked", "true");
  expect(
    await curated.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("sort-option-arrive");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(trigger).toContainText("Name: Z–A");
  await expect(page.locator(".tile-title b").first()).toHaveText("Zoom Canvas");
  await trigger.click();
  await expect(
    page.getByRole("menuitemradio", { name: /Name: Z–A/ }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(trigger).toContainText("Curated order");
  await expect(page.locator(".tile-title b").first()).toHaveText(
    "Editorial Card",
  );
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu", { name: "Sort components" })).toHaveCount(
    0,
  );
  await expect(trigger).toBeFocused();
});

test("compound inputs draw one outer focus ring and search clear retains focus", async ({
  page,
}) => {
  for (const [slug, wrapper] of [
    ["search-input", ".p-search-input"],
    ["password-input", ".p-input-group"],
    ["tag-input", ".p-tag-input > div"],
    ["collection-studio", ".p-app-search"],
  ]) {
    await page.goto("/#/component/" + slug);
    const field = page.locator(wrapper);
    const input = field.locator("input");
    await input.focus();
    expect(
      await input.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).toBe("none");
    expect(
      await field.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).toBe("solid");
    expect(
      await field.evaluate((el) =>
        parseFloat(getComputedStyle(el).outlineOffset),
      ),
    ).toBeGreaterThan(0);
  }
  await page.goto("/#/component/search-input");
  const input = page.locator(".p-search-input input");
  await input.fill("hello");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
});

test("navigation hides downward, returns upward, and keeps keyboard and mobile access", async ({
  page,
}) => {
  await page.goto("/#/components");
  const header = page.locator(".site-header");
  await expect(
    header.getByRole("link", { name: "draexon on GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/draexon");
  await expect(
    header.getByRole("link", { name: "Star Pros on GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/draexon/pros");
  await page.evaluate(() =>
    window.scrollTo({ top: 1100, behavior: "instant" }),
  );
  await expect(header).toHaveAttribute("data-hidden", "true");
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  await expect(header).toHaveAttribute("data-hidden", "false");
  expect((await header.boundingBox())!.y).toBe(0);
  await page.evaluate(() =>
    window.scrollTo({ top: 1300, behavior: "instant" }),
  );
  await expect(header).toHaveAttribute("data-hidden", "true");
  await header.getByRole("link", { name: "Pros home", exact: true }).focus();
  await expect(header).toHaveAttribute("data-hidden", "false");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 1500, behavior: "instant" });
  });
  await expect(header).toHaveAttribute("data-hidden", "false");
  await expect(header.getByRole("navigation")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
