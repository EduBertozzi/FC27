import { expect, test } from "@playwright/test";

test("atualiza o overall pela Início e vê na timeline", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Atualizar overall" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Atualizar overall" });
  await dialog.getByRole("button", { name: "Aumentar novo overall" }).click();
  await dialog.getByRole("button", { name: "Aumentar novo overall" }).click();
  await expect(dialog.getByText("+2 (era 76)")).toBeVisible();
  await dialog.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Overall subiu para 78")).toBeVisible();
  await expect(page.getByRole("img", { name: "Overall de 61 para 78" })).toBeVisible();
  await page.goto("/timeline");
  await expect(page.getByRole("heading", { name: "Overall sobe para 78" })).toBeVisible();
});

test("grava por voz com o reconhecimento de fala do navegador", async ({ page }) => {
  // Simula a Web Speech API: o Chromium de teste não tem microfone.
  await page.addInitScript({
    content: `
      class FakeRecognition {
        constructor() { this.lang = ""; this.continuous = false; this.interimResults = false; this.onresult = null; this.onerror = null; this.onend = null; }
        start() {
          setTimeout(() => {
            const alt = { transcript: "Joguei contra o Benfica em casa pela Liga Portugal, vencemos por 2 a 0, fui titular, joguei 90 minutos e fiz um gol" };
            const result = Object.assign([alt], { isFinal: true });
            this.onresult && this.onresult({ results: [result] });
          }, 50);
        }
        stop() { setTimeout(() => this.onend && this.onend(), 10); }
        abort() {}
      }
      for (const name of ["SpeechRecognition", "webkitSpeechRecognition"]) {
        Object.defineProperty(window, name, { value: FakeRecognition, configurable: true, writable: true });
      }
    `,
  });

  await page.goto("/partidas/nova?modo=voz");
  const dialog = page.getByRole("dialog", { name: "Registrar por voz" });
  await dialog.getByRole("button", { name: "Começar a gravar" }).click();
  await expect(dialog.getByText(/Joguei contra o Benfica/)).toBeVisible();
  await dialog.getByRole("button", { name: "Parar e interpretar" }).click();
  await expect(dialog.getByRole("heading", { name: "Entendi" })).toBeVisible();
  await dialog.getByRole("button", { name: "Usar no formulário" }).click();
  await expect(page.getByLabel("Adversário", { exact: true })).toHaveValue("Benfica");
  await expect(page.getByLabel("Competição", { exact: true })).toHaveValue("Liga Portugal");
});

test("navegador sem reconhecimento de fala oferece digitar", async ({ page }) => {
  await page.goto("/partidas/nova?modo=voz");
  const dialog = page.getByRole("dialog", { name: "Registrar por voz" });
  // Chromium headless pode ou não expor a API; força a ausência.
  await page.evaluate(() => {
    const w = window as unknown as Record<string, unknown>;
    delete w.webkitSpeechRecognition;
    delete w.SpeechRecognition;
  });
  await expect(dialog.getByRole("button", { name: "Prefiro digitar" })).toBeVisible();
});
