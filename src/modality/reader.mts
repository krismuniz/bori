import { Readability } from "@mozilla/readability";
import path, { dirname } from "path";
import { Page } from "puppeteer-core";

const DIRNAME = path.dirname(import.meta.url.replace("file://", ""));

const readabilityModulePath = path.join(
  DIRNAME,
  "../../node_modules/@mozilla/readability/Readability.js"
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

    return [parseResult?.textContent].join("\n").trim();
  },
} satisfies Record<string, Reader>;

export type ReaderModality = keyof typeof readerModality;
