import puppeteer from "puppeteer-core";
import { ChatMessage } from "../openai.mjs";
import { truncateString, truncateTokens } from "../truncate.mjs";
import { WithReader } from "./reader.mjs";
import { getSiteModifier, WithSearch } from "./search.mjs";

type Prompt<T extends object> = (
  opts: { query: string; url?: string; follow: boolean } & T
) => Promise<ChatMessage[]>;

export const promptModality = {
  ["bori-standard"]: async function mapPrompt({ query, url, follow, readURL }) {
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

    const site = getSiteModifier(query);
    if (site || follow) {
      const links = await page.$$eval(
        "a[href]",
        async (links, site, follow) =>
          links
            .filter((link) => {
              try {
                const href = new URL(link.href);
                if (site && href.hostname.includes(site)) {
                  return true;
                } else if (
                  follow &&
                  // We should not follow links to search engines
                  !href.hostname.includes("google") &&
                  !href.hostname.includes("bing") &&
                  !href.hostname.includes("duckduckgo")
                ) {
                  return true;
                }

                return false;
              } catch (e) {
                console.log(e);
                return false;
              }
            })
            .map((l) => l.href),
        site,
        follow
      );

      if (links.length > 0) {
        await page.goto(links[0], { waitUntil: "networkidle2" });
      }
    }

    await page.setViewport({ width: 1080, height: 1024 });

    const currentDateTime = await page.evaluate(() => new Date().toString());

    if (url === "about:blank") {
      return [
        { role: "system", content: `Today is ${currentDateTime}` },
        {
          role: "system",
          content:
            "You are an AI that knows how to browse the Web via Text. Answer questions based on the Context above.",
        },
        { role: "user", content: query },
      ];
    }

    const browseResult = await readURL(query, page);
    await browser.close();

    const context = [
      `Context: ${truncateTokens(browseResult, 256)}`,
      `Today's Date: ${currentDateTime}`,
    ].join("\n");

    return [
      { role: "system", content: context },
      {
        role: "system",
        content:
          "You are an AI that knows how to browse the Web via Text. Answer questions based on the Context above.",
      },
      { role: "user", content: query },
    ];
  },
} satisfies Record<string, Prompt<WithReader & WithSearch>>;

export type PromptModality = keyof typeof promptModality;
