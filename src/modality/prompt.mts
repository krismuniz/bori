import puppeteer from "puppeteer-core";
import { truncateString } from "../truncate.mjs";
import { WithReader } from "./reader.mjs";
import { WithSearch } from "./search.mjs";

type Prompt<T extends object> = (
  opts: { query: string; url?: string } & T
) => Promise<string>;

export const promptModality = {
  ["bori-standard"]: async function mapPrompt({ query, url, readURL }) {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH,
      headless: "new",
    });

    const page = await browser.newPage();

    await page.setBypassCSP(true);

    // TODO: maybe we should log these to a file instead of stdout?
    // or maybe enable via a flag?
    // page.on("error", (error) => process.stderr.write(error.message));
    // page.on("pageerror", (error) => process.stderr.write(error.message));
    // page.on(
    //   "console",
    //   (message) =>
    //     "BROWSER:" + process.stdout.write(message.text() + "\n", "utf-8")
    // );

    await page.goto(url, { waitUntil: "networkidle2" });
    await page.setViewport({ width: 1080, height: 1024 });

    const currentDateTime = await page.evaluate(() => new Date().toString());

    if (url === "about:blank") {
      return [
        `Today is ${currentDateTime}`,
        `Question / Instruction / Query: "${query}"`,
        "Answer: ",
      ].join("\n");
    }

    const browseResult = await readURL(query, page);
    await browser.close();

    return [
      `Current Date: Today is ${currentDateTime}[END]`,
      `Instructions: Simplify, cleanup, and summarize the following Text while answering Query if it's a question.[END]`,
      `Question / Instruction / Query: "${truncateString(query, 1024)}"[END]`,
      `Text: ${truncateString(browseResult, 1024)}[END]`,
      "Summary: ",
    ].join("\n");
  },
} satisfies Record<string, Prompt<WithReader & WithSearch>>;

export type PromptModality = keyof typeof promptModality;
