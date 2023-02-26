#!/usr/bin/env node
import * as dotenv from "dotenv";
import { program } from "commander";
import { createCompletionStream } from "./openai.mjs";
import { searchModality, SearchModality } from "./modality/search.mjs";
import { readerModality, ReaderModality } from "./modality/reader.mjs";
import { promptModality } from "./modality/prompt.mjs";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import slugify from "@sindresorhus/slugify";
import { ROOT_PATH } from "./root-path.mjs";
import path from "path";
import { encode } from "gpt-3-encoder";

// load .env file
dotenv.config({
  path: path.join(ROOT_PATH, ".env"),
});

type ProgramOptions = {
  url?: string;
  temperature: string;
  maxTokens: string;
  search: SearchModality;
  reader: ReaderModality;
};

program
  .argument("<query>", "the query you want to run")
  .option("-u, --url <url>", "read a specific URL")
  .option(
    "-s, --search <engine-name>",
    "search engine name to browse the Web (when no --url is provided)",
    "google"
  )
  .option(
    "-r, --reader <reader-name>",
    "strategy to use to browse and read web pages",
    "readability"
  )
  .option(
    "-t, --temperature <number>",
    "temperature setting for Open AI completion",
    "0"
  )
  .option(
    "-m, --max-tokens <number>",
    "max tokens setting for Open AI completion",
    "250"
  )
  .parse(process.argv);

const options: ProgramOptions = program.opts();
const [query] = program.args;
const maxTokens = parseInt(options.maxTokens);

const readURL = readerModality[options.reader] ?? readerModality["off"];
const mapSearchURL = searchModality[options.search] ?? searchModality["google"];

const targetURL = mapSearchURL(query, options.url ?? "about:blank");

// I'm not making this configurable yet, trying to stay focused.
const generatePrompt = promptModality["bori-standard"];

const prompt = await generatePrompt({
  query,
  url: targetURL,
  readURL,
  mapSearchURL,
});

const encodedPrompt = encode(prompt);

if (encodedPrompt.length > 2048 || encodedPrompt.length > maxTokens * 1.5) {
  console.error(
    `The prompt is too long (${encodedPrompt.length} tokens), please try a shorter query.`
  );
  console.error(`Here's the prompt:\n`, prompt);
  process.exit(1);
}

let response = "";
await createCompletionStream({
  prompt,
  temperature: parseFloat(options.temperature),
  max_tokens: maxTokens,
  onToken(data) {
    // prevent printing empty lines at
    // the beginning of the output
    if ((response + data).trim() === "") {
      return;
    }

    process.stdout.write(data);
    response += data;
  },
});

const cwd = process.cwd();
if (cwd === ROOT_PATH) {
  const outputDir = path.join(ROOT_PATH, "./output");
  const outputDirExists = existsSync(outputDir);

  if (!outputDirExists) {
    await mkdir(outputDir);
  }

  await writeFile(
    `./output/${Date.now()}-${slugify(query)}.txt`,
    [prompt, `[${encodedPrompt.length} tokens]`, response].join("\n")
  );
}

process.exit(0);
