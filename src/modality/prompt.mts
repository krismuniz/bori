import puppeteer from "puppeteer-core";
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

    await page.goto(url);
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
      `Context: Today is ${currentDateTime}`,
      `Instructions: Simplify, cleanup, and summarize the following Text while answering Query if it's a question.`,
      `Question / Instruction / Query: "${query}"`,
      `Text: ${browseResult}`,
      "Summary: ",
    ].join("\n");
  },
} satisfies Record<string, Prompt<WithReader & WithSearch>>;

export type PromptModality = keyof typeof promptModality;
