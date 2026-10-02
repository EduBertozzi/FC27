// Captura telas para revisão visual: node scripts/screenshot.mjs <baseUrl> <outDir> <route...>
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const [baseUrl = "http://localhost:3000", outDir = "screenshots", ...routes] =
  process.argv.slice(2);
const executablePath = existsSync("/opt/pw-browsers/chromium")
  ? "/opt/pw-browsers/chromium"
  : undefined;
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath });
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
for (const [name, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: name === "mobile" ? 2 : 1 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of routes.length ? routes : ["/"]) {
    await page.goto(baseUrl + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const file = `${outDir}/${name}${route.replaceAll("/", "_") || "_home"}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log("saved", file);
  }
  if (errors.length) console.log(`[${name}] console errors:\n` + errors.join("\n"));
  await page.close();
}
await browser.close();
