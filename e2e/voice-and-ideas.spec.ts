import { expect, test } from "@playwright/test";

test("registro por voz mostra prévia, pergunta o que faltou e só preenche após confirmação", async ({
  page,
}) => {
  await page.goto("/partidas/nova?modo=voz");
  const dialog = page.getByRole("dialog", { name: "Registrar por voz" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Prefiro digitar" }).click();
  await dialog
    .getByLabel("Como foi a partida?")
    .fill(
      "Joguei contra o Arsenal, ganhamos de três a um, fiz dois gols e dei uma assistência. Tirei nota nove.",
    );
  await dialog.getByRole("button", { name: "Interpretar" }).click();

  await expect(dialog.getByRole("heading", { name: "Entendi" })).toBeVisible();
  await expect(dialog.getByText(/não informou a competição/)).toBeVisible();
  await expect(page.getByLabel("Adversário", { exact: true })).toHaveValue("");

  await dialog.getByRole("button", { name: "Usar no formulário" }).click();
  await expect(page.getByText("Dados da voz aplicados")).toBeVisible();
  await expect(page.getByLabel("Adversário", { exact: true })).toHaveValue("Arsenal");
  await expect(page.getByLabel("Competição", { exact: true })).toHaveValue("");
});

test("Surpreenda-me gera uma carreira e leva ao criador preenchido", async ({ page }) => {
  await page.goto("/ideias");
  await page.getByRole("button", { name: "Surpreenda-me" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Sua próxima carreira" });
  await expect(dialog.getByRole("button", { name: "Começar esta carreira" })).toBeEnabled({
    timeout: 5000,
  });
  const name = await dialog.locator("h3").first().innerText();
  await dialog.getByRole("button", { name: "Começar esta carreira" }).click();
  await expect(page).toHaveURL(/nova-carreira/);
  await expect(page.getByText("Carreira sorteada carregada")).toBeVisible();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(name.split(" ")[0] ?? "");
});

test("assistente responde com dados da carreira", async ({ page }) => {
  await page.goto("/assistente");
  await page.getByRole("button", { name: "Como está minha temporada?" }).click();
  await expect(page.getByText(/24 jogos, 18 gols e 10 assistências/)).toBeVisible();
});
