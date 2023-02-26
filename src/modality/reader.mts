import { Readability } from "@mozilla/readability";
import path from "path";
import { Page } from "puppeteer-core";
import { ROOT_PATH } from "../root-path.mjs";

const readabilityModulePath = path.join(
  ROOT_PATH,
  "./node_modules/@mozilla/readability/Readability.js"
);

export type Reader = (query: string, page: Page) => Promise<string>;

export type WithReader = {
  readURL: Reader;
};

export const readerModality = {
  off: async function browsePage(_query, page) {
    return "";
  },
  readability: async function browsePage(query, page) {
    // install @mozilla/readability
    await page.addScriptTag({
      id: "bori-readability",
      path: readabilityModulePath,
    });

    // parse the document
    const parseResult = await page.evaluate(async () => {
      const url = window.location.href;

      try {
        return new Readability(document).parse();
      } catch (e) {
        console.error(e);
        const content = `Sorry, I could not read document titled "${document.title}" at "${url}" because of an error: ${e}`;
        return {
          title: content,
          byline: content,
          dir: "ltr",
          content: content,
          textContent: content,
          length: -1,
          excerpt: content,
          siteName: content,
        };
      }
    });

    // collapse all whitespace into a single space/newline
    const text = parseResult.textContent
      .replace(/ +/g, " ")
      .replace(/\t+/g, "\t")
      .replace(/\n+/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");

    return [text].join("\n").trim();
  },
} satisfies Record<string, Reader>;

export type ReaderModality = keyof typeof readerModality;
