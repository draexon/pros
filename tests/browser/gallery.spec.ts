import { test, expect } from "@playwright/test";
import repoStats from "../../src/repo-stats.json" with { type: "json" };
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

test("gallery buttons stay stationary on hover while component presses settle smoothly", async ({
  page,
}) => {
  await page.goto("/#/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".motion-control").click();
  for (const selector of [
    ".hero-copy .big-action",
    ".header-start",
    ".github-star",
    ".site-header nav a:first-child",
  ]) {
    const button = page.locator(selector);
    await button.hover();
    await expect
      .poll(() =>
        button.evaluate((el) => {
          const style = getComputedStyle(el);
          return (
            (style.transform === "none" ||
              new DOMMatrixReadOnly(style.transform).isIdentity) &&
            (style.translate === "none" ||
              style.translate
                .split(" ")
                .every((value) => parseFloat(value) === 0))
          );
        }),
      )
      .toBe(true);
    expect(
      await button.evaluate((el) => el.style.getPropertyValue("--magnet-x")),
    ).toBe("");
  }
  await page.goto("/#/component/confirm-button");
  const component = page.locator('[data-pros="ConfirmButton"]');
  await component.click();
  const frames = await component.evaluate((el) =>
    el
      .getAnimations()
      .flatMap((a) =>
        a.effect instanceof KeyframeEffect ? a.effect.getKeyframes() : [],
      )
      .filter((f) => f.scale),
  );
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.every((frame) => Number(frame.scale) <= 1)).toBe(true);
  await expect(component).toHaveAttribute("aria-pressed", "true");
});

for (const [status, response, expected] of [
  [200, { stargazers_count: 1234 }, "1,234"],
  [404, { message: "Not Found" }, repoStats.stars.toLocaleString("en-US")],
  [200, { stargazers_count: -1 }, repoStats.stars.toLocaleString("en-US")],
] as const) {
  test(`repository stars show a live count or verified fallback (${status}, ${expected})`, async ({
    page,
  }) => {
    await page.route("https://api.github.com/repos/draexon/pros", (route) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      }),
    );
    await page.goto("/#/components");
    await expect(page.locator("#repo-star-count")).toHaveText(expected);
    await expect(
      page.getByRole("link", { name: "Star Pros on GitHub", exact: true }),
    ).toHaveAttribute("href", "https://github.com/draexon/pros");
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("content switches crossfade outgoing panels and handle rapid reversals", async ({
  page,
}) => {
  for (const [slug, next] of [
    ["pill-tabs", "Objects"],
    ["tabbed-panel", "Objects"],
    ["carousel", "Next slide"],
    ["slide-swap", "Next panel"],
    ["section-navigator", "Next section"],
    ["discovery-hub", "Design"],
    ["trending-board", "Places"],
    ["order-journey", "At your door"],
  ]) {
    await page.goto("/#/component/" + slug);
    await page.evaluate(() => document.fonts.ready);
    if (
      (await page.locator(".motion-control").getAttribute("aria-pressed")) ===
      "false"
    )
      await page.locator(".motion-control").click();
    const root = page.locator(".detail-component > [data-pros]");
    const control =
      slug === "pill-tabs"
        ? root.getByRole("tab", { name: next, exact: true })
        : root.getByRole("button", { name: new RegExp(next) }).first();
    await control.click();
    const ghost = root.locator(".p-content-outgoing");
    await expect(ghost).toHaveCount(1);
    await expect(ghost).toHaveAttribute("aria-hidden", "true");
    expect(await ghost.evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    expect(await ghost.locator("[id], [data-pros]").count()).toBe(0);
    const live = root
      .locator("[data-content-transition]:not(.p-content-outgoing)")
      .first();
    expect(
      await live.evaluate((el) =>
        el
          .getAnimations()
          .some(
            (a) =>
              a.effect instanceof KeyframeEffect &&
              a.effect.getKeyframes().some((f) => f.opacity === "0"),
          ),
      ),
    ).toBe(true);
    await expect(ghost).toHaveCount(0);
  }
  await page.goto("/#/component/pill-tabs");
  const tabs = page.getByRole("tab");
  await tabs.nth(1).click();
  await tabs.nth(2).click();
  await tabs.nth(0).click();
  await expect(page.getByRole("tabpanel")).toHaveText(
    "A space for better ideas",
  );
  await expect(page.locator(".p-content-outgoing")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await tabs.nth(1).click();
  await expect(page.locator(".p-content-outgoing")).toHaveCount(0);
  await expect(page.getByRole("tabpanel")).toHaveText(
    "Useful things, thoughtfully made",
  );
});

test("compact navbar matches the page background in both themes", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.addInitScript(
      (theme) => localStorage.setItem("pros.theme", theme),
      theme,
    );
    await page.goto("/#/components");
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const styles = await page
        .locator(".site-header")
        .evaluate((el) => ({
          height: el.getBoundingClientRect().height,
          color: getComputedStyle(el).backgroundColor,
          page: getComputedStyle(el.closest(".site")!).backgroundColor,
        }));
      expect(styles.color).toBe(styles.page);
      expect(styles.height).toBe(width === 390 ? 64 : 72);
    }
  }
});

for (const theme of ["light", "dark"]) {
  for (const width of [390, 1440]) {
    for (const motion of ["off", "on"]) {
      test(`tile chrome and form controls work at ${width}px in ${theme} with motion ${motion}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.addInitScript(
          (theme) => localStorage.setItem("pros.theme", theme),
          theme,
        );
        await page.goto("/#/components");
        if (motion === "on") await page.locator(".motion-control").click();
        await expect(page.locator(".site")).toHaveAttribute("data-motion", motion);
        const choose = async (name: string) => {
          await page
            .locator(".category-button")
            .filter({ hasText: name })
            .click();
          await page.locator(".component-grid").evaluate(async (el) => {
            await Promise.all(
              el
                .getAnimations({ subtree: true })
                .filter(
                  (a) => a.effect?.getComputedTiming().iterations !== Infinity,
                )
                .map((a) => a.finished.catch(() => {})),
            );
          });
        };
        for (const category of [
          "Inputs",
          "Buttons",
          "Feedback",
          "Media",
          "Commerce",
        ]) {
          await choose(category);
          const tiles = await page.locator(".tile-stage").evaluateAll((stages) => {
            const luminance = (color: string) => {
              const [r, g, b] = (color.match(/[\d.]+/g) ?? [])
                .slice(0, 3)
                .map((n) => {
                  const value = Number(n) / 255;
                  return value <= 0.04045
                    ? value / 12.92
                    : ((value + 0.055) / 1.055) ** 2.4;
                });
              return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };
            return stages.map((stage) => {
              const preview = stage.querySelector(".tile-component")!;
              const source = stage.querySelector(".tile-source")!;
              const bounds = source.getBoundingClientRect();
              const style = getComputedStyle(source);
              const foreground = luminance(style.color);
              const background = luminance(style.backgroundColor);
              return {
                name: preview.firstElementChild?.getAttribute("data-pros"),
                gap:
                  bounds.top -
                  Math.max(
                    preview.getBoundingClientRect().bottom,
                    preview.firstElementChild!.getBoundingClientRect().bottom,
                  ),
                inside: bounds.bottom <= stage.getBoundingClientRect().bottom,
                font: parseFloat(style.fontSize),
                contrast:
                  (Math.max(foreground, background) + 0.05) /
                  (Math.min(foreground, background) + 0.05),
              };
            });
          });
          for (const tile of tiles) {
            expect(tile.gap, tile.name ?? category).toBeGreaterThanOrEqual(0);
            expect(tile.inside).toBe(true);
            expect(tile.font).toBeGreaterThanOrEqual(10);
            expect(tile.contrast).toBeGreaterThanOrEqual(4.5);
          }
        }
        await choose("Inputs");
        const password = page.locator('[data-pros="PasswordInput"]');
        await password.locator("input").fill("GoodPass1!");
        await expect(password.getByRole("meter")).toHaveAttribute(
          "aria-valuenow",
          "4",
        );
        await expect(
          password.getByText("Password strength: Strong"),
        ).toBeVisible();
        await expect(password.locator(".p-input-group")).toHaveCSS(
          "border-top-width",
          "1px",
        );
        await password.getByRole("button", { name: "Show password" }).click();
        await expect(password.locator("input")).toHaveAttribute("type", "text");
        await password.getByRole("button", { name: "Hide password" }).click();
        await expect(password.locator("input")).toHaveAttribute(
          "type",
          "password",
        );
        await expect(password.locator("input")).toHaveValue("GoodPass1!");
        const date = page.locator('[data-pros="DateInput"]');
        await date.locator("input").fill("2024-02-29");
        await expect(date.locator(".p-number")).toHaveText("29");
        await expect(date.locator(".p-date-copy")).toHaveText(
          "February 2024Thursday",
        );
        await date.locator("input").focus();
        await expect(date.locator(":scope > div")).toHaveCSS(
          "outline-style",
          "solid",
        );
        await date.locator("input").clear();
        await expect(date.locator(".p-date-copy")).toContainText("Choose a date");
        const select = page.locator(
          '[data-pros="SelectInput"] .p-dropdown-trigger',
        );
        await select.focus();
        await select.press("ArrowDown");
        await expect(select).toHaveAttribute("aria-expanded", "true");
        const menu = page.locator(".p-dropdown-menu[data-open='true']");
        await expect(
          menu.locator('[role="menuitemradio"][aria-checked="true"]'),
        ).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(select).toHaveAttribute("aria-expanded", "false");
        await expect(select).toBeFocused();
        await select.press("Enter");
        await expect(select).toHaveAttribute("aria-expanded", "true");
        await expect(menu.locator('[role="menuitemradio"]:focus')).toHaveCount(1);
        await page.keyboard.press("o");
        await page.keyboard.press("Enter");
        await expect(select).toHaveText("Objects");
        await expect(select).toBeFocused();
        await expect(select).toHaveCSS("border-top-width", "1px");
        const slots = page.locator('[data-pros="OtpInput"] input');
        await slots.first().fill("1");
        await expect(slots.nth(1)).toBeFocused();
        await expect(slots.first()).toHaveClass("is-filled");
        await expect(slots.nth(1)).toHaveCSS("border-top-width", "1px");
        expect(
          await slots.nth(1).evaluate((el) => {
            const style = getComputedStyle(el);
            return style.caretColor === style.color;
          }),
        ).toBe(true);
        await slots.first().evaluate((el) => {
          const clipboardData = new DataTransfer();
          clipboardData.setData("text", "12a34");
          el.dispatchEvent(
            new ClipboardEvent("paste", { clipboardData, bubbles: true }),
          );
        });
        for (let i = 0; i < 4; i++)
          await expect(slots.nth(i)).toHaveValue(String(i + 1));
        await expect(slots.nth(3)).toBeFocused();
        await slots.nth(3).press("ArrowLeft");
        await expect(slots.nth(2)).toBeFocused();
        const search = page.locator('[data-pros="SearchInput"]');
        await expect(search.locator("kbd")).toHaveText("Enter");
        await search.locator("input").fill("sage");
        await search.getByRole("button", { name: "Clear search" }).click();
        await expect(search.locator("input")).toBeFocused();
        await expect(search.locator("input")).toHaveValue("");
        await choose("Buttons");
        const orbit = page.locator('[data-pros="OrbitButton"] > svg');
        await expect(orbit.locator("textPath")).toHaveCount(1);
        const running = () =>
          orbit.evaluate((el) =>
            el.getAnimations().some((a) => a.playState === "running"),
          );
        await expect.poll(running).toBe(motion === "on");
        const sound = page.locator('[data-pros="SoundButton"]');
        const bars = sound.locator(".p-wave i");
        await expect(bars).toHaveCount(5);
        for (const bar of await bars.all()) {
          await expect(bar).toHaveCSS("height", "2px");
          await expect(bar).toHaveCSS("animation-name", "none");
        }
        await sound.click();
        await expect(sound).toHaveAttribute("aria-pressed", "true");
        await expect(sound).toHaveAccessibleName("Mute sound");
        await expect(bars.first()).toHaveCSS("height", "12px");
        const playing = () =>
          bars.first().evaluate((el) =>
            el.getAnimations().some((a) => a.playState === "running"),
          );
        await expect.poll(playing).toBe(motion === "on");
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expect.poll(running).toBe(false);
        await expect.poll(playing).toBe(false);
        await sound.click();
        await expect(sound).toHaveAccessibleName("Enable sound");
        await expect(bars.first()).toHaveCSS("height", "2px");
      });
    }
  }
}

test("category switches and scrolling reveal tiles without flashing them first", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("pros.motion", "on"));
  await page.goto("/#/components");
  const flashes = await page.evaluate(async () => {
    let count = 0;
    let run = true;
    const last = new WeakMap<Element, number>();
    const loop = () => {
      for (const tile of document.querySelectorAll(".component-tile")) {
        const rect = tile.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) continue;
        const opacity = parseFloat(getComputedStyle(tile).opacity);
        if ((last.get(tile) ?? 0) > 0.9 && opacity < 0.5) count++;
        last.set(tile, opacity);
      }
      if (run) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    const buttons = document.querySelectorAll<HTMLButtonElement>(".category-button");
    for (const index of [3, 9, 1]) {
      buttons[index].click();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    for (let y = 0; y < 2400; y += 120) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
    run = false;
    return count;
  });
  expect(flashes).toBe(0);
});
