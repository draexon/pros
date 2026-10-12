import { test, expect } from "@playwright/test";
import { build } from "vite";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import catalog from "../../src/catalog.json" with { type: "json" };

declare global {
  interface Window {
    ConsumerTest: typeof import("../fixtures/consumer");
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("pros.motion", "off");
    localStorage.setItem("pros.theme", "light");
  });
});

test("discovery and trending filters select real content and save independently", async ({
  page,
}) => {
  await page.goto("/#/component/discovery-hub");
  const discovery = page.locator('[data-pros="DiscoveryHub"]');
  await discovery.getByRole("button", { name: "Food", exact: true }).click();
  await expect(discovery.locator("h4")).toHaveText("A seat at the table.");
  await discovery
    .getByRole("button", { name: "Save A seat at the table." })
    .click();
  await expect(discovery.getByRole("status")).toHaveText("1 saved");
  await discovery.getByRole("button", { name: "For you", exact: true }).click();
  await expect(discovery.locator(".p-discovery-small")).toHaveCount(2);
  await page.goto("/#/component/trending-board");
  const trending = page.locator('[data-pros="TrendingBoard"]');
  await expect(trending.locator(".p-trending-story b").first()).toHaveText(
    "A seat at the table.",
  );
  await trending.getByRole("button", { name: "Places", exact: true }).click();
  await expect(trending.locator(".p-trending-row")).toHaveCount(2);
  await trending
    .getByRole("button", { name: "Save Find your slower Sunday." })
    .click();
  await expect(trending.getByRole("status")).toHaveText(
    "1 find saved to your collection.",
  );
});

test("saved collections search, remove, and restore the original order", async ({
  page,
}) => {
  await page.goto("/#/component/collection-studio");
  const block = page.locator('[data-pros="CollectionStudio"]');
  await block.getByRole("textbox").fill("design");
  await expect(block.locator(".p-collection-card")).toHaveCount(1);
  await block.getByRole("textbox").fill("no such thing");
  await expect(
    block.getByText("No matches. Try a different search."),
  ).toBeVisible();
  await block.getByRole("textbox").clear();
  const before = await block.locator(".p-collection-open b").allTextContents();
  await block.getByRole("button", { name: "Edit", exact: true }).click();
  await block
    .getByRole("button", { name: "Remove Objects with a story." })
    .click();
  await expect(block.locator(".p-collection-card")).toHaveCount(3);
  await expect(
    block.getByRole("button", { name: "Undo", exact: true }),
  ).toBeFocused();
  await block.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(block.locator(".p-collection-open b")).toHaveText(before);
  await expect(
    block.getByRole("button", { name: "Done", exact: true }),
  ).toBeFocused();
  await block.getByRole("button", { name: "Done", exact: true }).click();
  await expect(block.locator(".p-collection-remove")).toHaveCount(0);
});

test("shopping quantities calculate shipping, preserve undo quantity, and handle an empty bag", async ({
  page,
}) => {
  await page.goto("/#/component/shopping-bag");
  const block = page.locator('[data-pros="ShoppingBag"]');
  await expect(block.locator(".p-app-total strong")).toHaveText("$78.00");
  await expect(
    block.getByRole("button", { name: "Decrease The everyday carry" }),
  ).toBeDisabled();
  await block
    .getByRole("button", { name: "Increase The everyday carry" })
    .click();
  await expect(block.locator(".p-app-total strong")).toHaveText("$120.00");
  await expect(block.getByText("Your bag ships on us.")).toBeVisible();
  await block
    .getByRole("button", { name: "Remove The everyday carry" })
    .click();
  await expect(block.locator(".p-app-total strong")).toHaveText("$30.00");
  await block.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(block.getByLabel("The everyday carry quantity")).toHaveText("2");
  await block
    .getByRole("button", { name: "Remove The everyday carry" })
    .click();
  await block.getByRole("button", { name: "Remove A place for ideas" }).click();
  await expect(block.locator(".p-app-total strong")).toHaveText("$0.00");
  await expect(
    block.getByRole("button", { name: "Continue to checkout" }),
  ).toBeDisabled();
});

test("checkout reviews the chosen method, returns focus, and labels its demo honestly", async ({
  page,
}) => {
  await page.goto("/#/component/checkout-panel");
  const block = page.locator('[data-pros="CheckoutPanel"]');
  await block.getByRole("button", { name: /Digital wallet/ }).click();
  await block.getByRole("button", { name: "Review $78.00" }).click();
  await expect(block.locator(".p-checkout-body")).toBeFocused();
  await expect(block.locator(".p-app-summary")).toContainText("Digital wallet");
  await block.getByRole("button", { name: "Back to payment methods" }).click();
  await expect(
    block.getByRole("button", { name: /Digital wallet/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await block.getByRole("button", { name: "Review $78.00" }).click();
  await block.getByRole("button", { name: "Preview payment" }).click();
  await expect(block.locator(".p-checkout-complete")).toContainText(
    "No payment was taken.",
  );
  await block.getByRole("button", { name: "Try it again" }).click();
  await expect(
    block.getByRole("button", { name: "Review $78.00" }),
  ).toBeVisible();
});

test("membership billing, order inspection, and reward eligibility preserve their meaning", async ({
  page,
}) => {
  await page.goto("/#/component/membership-studio");
  const membership = page.locator('[data-pros="MembershipStudio"]');
  await expect(membership.locator(".p-membership-price strong")).toHaveText([
    "$72.00",
    "$120.00",
  ]);
  await membership
    .getByRole("button", { name: "Monthly", exact: true })
    .click();
  await expect(membership.locator(".p-membership-price strong")).toHaveText([
    "$8.00",
    "$14.00",
  ]);
  await membership.getByRole("button", { name: /^Everyday/ }).click();
  await membership
    .getByRole("button", { name: "Continue with Everyday" })
    .click();
  await expect(page.locator(".event-log")).toContainText(
    "subscribe:everyday:monthly",
  );
  await page.goto("/#/component/order-journey");
  const order = page.locator('[data-pros="OrderJourney"]');
  await order.getByRole("button", { name: /At your door/ }).click();
  await expect(order.locator(".p-order-detail h4")).toHaveText("At your door");
  await expect(order.locator('[aria-current="step"]')).toContainText(
    "On its way",
  );
  await expect(order.locator(".p-order-hero .p-app-tag")).toHaveText(
    "On its way",
  );
  await page.goto("/#/component/rewards-wallet");
  const rewards = page.locator('[data-pros="RewardsWallet"]');
  await expect(
    rewards.getByRole("button", { name: /Something special/ }),
  ).toBeDisabled();
  await rewards.getByRole("button", { name: /A little thank you/ }).click();
  await expect(rewards.locator(".p-reward-review")).toContainText(
    "240 points remaining",
  );
  await rewards.getByRole("button", { name: "Choose reward" }).click();
  await expect(page.locator(".event-log")).toContainText("redeem:credit");
});

test("app block height, entrance motion, and reduced motion remain coordinated", async ({
  page,
}) => {
  await page.goto("/#/component/discovery-hub");
  await page.locator(".motion-control").click();
  const block = page.locator('[data-pros="DiscoveryHub"]');
  await block.getByRole("button", { name: "Design", exact: true }).click();
  await expect
    .poll(() =>
      block.evaluate((el) =>
        el
          .getAnimations()
          .some(
            (a) =>
              a.effect instanceof KeyframeEffect &&
              a.effect.getKeyframes().some((f) => f.height),
          ),
      ),
    )
    .toBe(true);
  await expect(
    block.getByRole("heading", { name: "Objects with a story.", exact: true }),
  ).toBeVisible();
  await block.evaluate((el) =>
    Promise.all(
      el.getAnimations().map((animation) => animation.finished.catch(() => {})),
    ),
  );
  await block.getByRole("button", { name: "For you", exact: true }).click();
  await expect
    .poll(() =>
      block.evaluate((el) =>
        el.getAnimations().some((animation) => {
          if (!(animation.effect instanceof KeyframeEffect)) return false;
          const frames = animation.effect.getKeyframes();
          return (
            parseFloat(String(frames[0]?.height)) <
            parseFloat(String(frames[frames.length - 1]?.height))
          );
        }),
      ),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await block.getByRole("button", { name: "Places", exact: true }).click();
  await expect
    .poll(() =>
      block.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
    )
    .toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator(".motion-control").click();
  await block.getByRole("button", { name: "Food", exact: true }).click();
  await expect
    .poll(() =>
      block.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
    )
    .toBe(0);
});

test("all app block controls stay within their own panels at narrow and wide sizes", async ({
  page,
}) => {
  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const entry of catalog.filter((e) => e.category === "consumer")) {
      await page.goto("/#/component/" + entry.slug);
      const block = page.locator(".p-app-block");
      const overflow = await block.evaluate((el) => {
        const outer = el.getBoundingClientRect();
        return [...el.querySelectorAll("button,input")]
          .filter((control) => {
            const bounds = control.getBoundingClientRect();
            return (
              bounds.width > 0 &&
              (bounds.left < outer.left - 1 || bounds.right > outer.right + 1)
            );
          })
          .map((el) => el.textContent);
      });
      expect(overflow, entry.name + " at " + width).toEqual([]);
    }
  }
});

test.describe("consumer integration contract", () => {
  let script = "",
    css = "";
  test.beforeAll(async () => {
    css = await readFile(resolve("src/library/styles.css"), "utf8");
    const result = await build({
      configFile: false,
      logLevel: "silent",
      define: { "process.env.NODE_ENV": '"production"' },
      build: {
        write: false,
        lib: {
          entry: resolve("tests/fixtures/consumer.tsx"),
          name: "ConsumerTest",
          formats: ["iife"],
        },
      },
    });
    const bundle = Array.isArray(result) ? result[0] : result;
    if (!("output" in bundle)) throw new Error("Expected an in-memory bundle");
    for (const item of bundle.output) {
      if (item.type === "chunk") script += item.code;
    }
  });
  test.beforeEach(async ({ page }) => {
    await page.goto("about:blank");
    await page.setContent(
      '<html><head></head><body><div id="root"></div></body></html>',
    );
    await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: script });
  });
  test("confirmation waits for integration, blocks duplicate submits, recovers from failure, then succeeds", async ({
    page,
  }) => {
    await page.evaluate(() =>
      window.ConsumerTest.mount(
        "CheckoutPanel",
        { amount: 4250, currency: "USD" },
        true,
      ),
    );
    await page.getByRole("button", { name: "Review $42.50" }).click();
    await page.getByRole("button", { name: "Confirm payment" }).click();
    await expect(
      page.getByRole("button", { name: "Confirming…" }),
    ).toBeDisabled();
    await expect(page.locator(".p-checkout-body")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(
      await page.evaluate(() => window.ConsumerTest.getRequests()),
    ).toEqual([
      { method: "payment-method-123", amount: 4250, currency: "USD" },
    ]);
    await page.evaluate(() => window.ConsumerTest.settlePayment(false));
    await expect(page.getByRole("alert")).toContainText("couldn't confirm");
    await expect(
      page.getByRole("button", { name: "Confirm payment" }),
    ).toBeEnabled();
    await page.getByRole("button", { name: "Confirm payment" }).click();
    await page.evaluate(() => window.ConsumerTest.settlePayment(true));
    await expect(
      page.getByText("Confirmation received.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirm payment" }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => window.ConsumerTest.getRequests()),
    ).toHaveLength(2);
  });
  test("empty custom data and disabled app blocks remain usable and honest", async ({
    page,
  }) => {
    for (const name of [
      "DiscoveryHub",
      "TrendingBoard",
      "CollectionStudio",
      "ShoppingBag",
      "CheckoutPanel",
      "MembershipStudio",
      "OrderJourney",
      "RewardsWallet",
    ]) {
      await page.evaluate(
        (name) =>
          window.ConsumerTest.mount(name, {
            stories: [],
            products: [],
            methods: [],
            plans: [],
            milestones: [],
            rewards: [],
          }),
        name,
      );
      await expect(page.locator(`[data-pros="${name}"]`)).toBeVisible();
      await expect(page.locator(".p-app-empty")).toBeVisible();
      await page.evaluate(
        (name) => window.ConsumerTest.mount(name, { disabled: true }),
        name,
      );
      for (const control of await page
        .locator(".p-app-block button, .p-app-block input")
        .all())
        await expect(control).toBeDisabled();
    }
  });
});
