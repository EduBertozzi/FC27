import { expect, test } from "@playwright/test";

const ROUTES: [string, RegExp][] = [
  ["/", /Rafa Monteiro/],
  ["/carreira", /Painel da carreira/],
  ["/partidas", /Partidas/],
  ["/partidas/nova", /Registrar partida/],
  ["/timeline", /Timeline/],
  ["/noticias", /Notícias/],
  ["/noticias/news_04", /Dérbi tem dono/],
  ["/assistente", /Assistente/],
  ["/jogador", /Rafa Monteiro/],
  ["/nova-carreira", /Nova carreira/],
  ["/ideias", /Estou sem ideia/],
  ["/design-system", /Design System/],
];

for (const [route, heading] of ROUTES) {
  test(`tela ${route} carrega sem erros e sem rolagem horizontal`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(heading);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("rota inexistente mostra 404 amigável", async ({ page }) => {
  await page.goto("/nao-existe");
  await expect(page.getByText("Página fora de campo")).toBeVisible();
});

test("navegação mobile alcança todas as áreas pelo menu Mais", async ({ page, isMobile }) => {
  test.skip(!isMobile, "apenas mobile");
  await page.goto("/");
  await page.getByRole("button", { name: "Mais" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Notícias" }).click();
  await expect(page).toHaveURL("/noticias");
  await expect(page.getByRole("dialog")).toBeHidden();
});
