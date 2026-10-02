import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/carreira",
  "/partidas",
  "/partidas/nova",
  "/timeline",
  "/noticias",
  "/assistente",
  "/jogador",
  "/nova-carreira",
  "/ideias",
  "/design-system",
];

for (const route of ROUTES) {
  test(`a11y (WCAG 2.2 AA) em ${route}`, async ({ page }) => {
    // Sem animações de entrada: o axe mede contraste com opacidade final.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const violations = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.length} nó(s) — ${v.nodes[0]?.target.join(" ")}`,
    );
    expect(violations).toEqual([]);
  });
}
