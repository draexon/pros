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
    test(`all 210 previews fit at ${width}px in ${theme} mode`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        (value) => localStorage.setItem("pros.theme", value),
        theme,
      );
      await page.goto("/#/components");
      const seen = new Set<string>();
      for (let i = 1; i <= 14; i++) {
        await page.locator(".category-button").nth(i).click();
        await expect(page.locator(".component-tile")).toHaveCount(15);
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
  await page.getByLabel("Sort components").selectOption("az");
  await expect(page.locator(".tile-title b").first()).toHaveText(
    "Accordion Panel",
  );
  expect(
    (await page.getByLabel("Sort components").boundingBox())!.height,
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
        track.evaluate((el) => getComputedStyle(el, "::before").translate),
      )
      .toBe(middle.target);
    await track.locator("button").first().click();
    await expect
      .poll(() =>
        track.evaluate((el) => getComputedStyle(el, "::before").translate),
      )
      .toBe(start);
  });
}

test("theme crossfade contains final component colors without trailing transitions", async ({
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
                String(animation.animationName).startsWith("theme-fade"),
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
