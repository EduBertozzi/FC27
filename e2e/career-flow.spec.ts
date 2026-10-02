import { expect, test } from "@playwright/test";

/**
 * Fluxo principal: criar carreira → registrar partida → salvar →
 * estatísticas atualizadas → painel → timeline.
 */
test("cria carreira, registra partida e vê painel e timeline atualizados", async ({
  page,
  isMobile,
}) => {
  await page.goto("/nova-carreira");

  // Etapa 1 — identidade
  await page.getByLabel("Nome", { exact: true }).fill("Kauã");
  await page.getByLabel("Sobrenome").fill("Siqueira");
  await page.getByLabel("Nacionalidade").selectOption("BRA");
  await page.getByLabel("Data de nascimento").fill("2008-05-02");
  await page.getByRole("button", { name: "Continuar" }).click();

  // Etapa 2 — perfil
  await page.getByRole("radio", { name: "Meia ofensivo" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // Etapa 3 — clube e arquétipo (validação bloqueia sem clube)
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Informe o clube inicial")).toBeVisible();
  await page.getByLabel("Clube inicial").fill("Mirassol");
  await page.getByRole("radio", { name: /Camisa 10 clássico/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  // Etapa 4 — objetivo
  // Etapa 4 — vários objetivos em um texto longo (cada um vira um objetivo)
  await page
    .getByLabel("Objetivos")
    .fill(
      "Conquistar a Champions League, ser vendido para uma das 5 ligas grandes, virar idolo de algum clube, bater recorde de assistencias, chegar na selação principal e ganhar uma copa do mundo",
    );
  await expect(page.getByText("5 objetivos serão criados")).toBeVisible();
  await page.getByRole("button", { name: "Começar carreira" }).click();

  // Home da nova carreira: estado vazio
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1, name: "Kauã Siqueira" })).toBeVisible();
  await expect(page.getByText("Nenhuma partida ainda")).toBeVisible();
  await expect(page.getByText("Conquistar a Champions League")).toBeVisible();
  await page.getByText("Ver mais 1").click();
  await expect(
    page.getByText("Chegar na selação principal e ganhar uma copa do mundo"),
  ).toBeVisible();

  // Registrar partida
  await page.getByRole("link", { name: "Registrar primeira partida" }).click();
  await page.getByLabel("Adversário", { exact: true }).fill("Santos");
  await page.getByLabel("Competição", { exact: true }).fill("Brasileirão");
  await page.getByRole("radio", { name: "Casa" }).click();
  await page.getByRole("button", { name: "Aumentar gols do mirassol" }).click();
  await page.getByRole("button", { name: "Aumentar gols do mirassol" }).click();
  await page.getByRole("button", { name: "Aumentar gols", exact: true }).click();
  await page.getByRole("button", { name: "Aumentar assistências", exact: true }).click();
  await page.getByRole("button", { name: "Salvar partida" }).click();

  await expect(page.getByRole("heading", { name: "Partida registrada" })).toBeVisible();
  await expect(page.getByText("Estreia profissional contra o Santos")).toBeVisible();
  await expect(page.getByText("Primeiro gol da carreira, contra o Santos")).toBeVisible();

  // Painel atualizado
  await page.getByRole("link", { name: "Ver painel da carreira" }).click();
  await expect(page.getByRole("heading", { name: "Painel da carreira" })).toBeVisible();
  const goals = page.locator("dl").first().locator("div", { hasText: "Gols" }).first();
  await expect(goals).toContainText("1");
  await expect(page.getByRole("img", { name: "1 vitórias, 0 empates, 0 derrotas" })).toBeVisible();

  // Timeline
  if (isMobile)
    await page
      .getByRole("navigation", { name: "Principal" })
      .getByRole("link", { name: "Timeline" })
      .click();
  else await page.goto("/timeline");
  await expect(
    page.getByRole("heading", { name: "Primeiro gol da carreira, contra o Santos" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Começa a carreira no Mirassol" })).toBeVisible();
});

test("validação impede salvar partida inconsistente", async ({ page }) => {
  await page.goto("/partidas/nova");
  await page.getByLabel("Adversário", { exact: true }).fill("Benfica");
  await page.getByLabel("Competição", { exact: true }).fill("Liga Portugal");
  await page.getByRole("radio", { name: "Fora" }).click();
  await page.getByRole("button", { name: "Aumentar gols", exact: true }).click();
  await page.getByRole("button", { name: "Salvar partida" }).click();
  await expect(page.getByText("Corrija 1 campo para salvar")).toBeVisible();
  await expect(
    page.getByText(/Seus gols \(1\) não podem passar do placar do time \(0\)/).first(),
  ).toBeVisible();
});
