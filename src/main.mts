import * as dotenv from "dotenv";
import { program } from "commander";
import { createCompletionStream } from "./openai.mjs";
import { searchModality, SearchModality } from "./modality/search.mjs";
import { readerModality, ReaderModality } from "./modality/reader.mjs";
import { promptModality } from "./modality/prompt.mjs";

// load .env file
dotenv.config();

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
const [query, url] = program.args;

const readURL = readerModality[options.reader] ?? readerModality["off"];
const mapSearchURL = searchModality[options.search] ?? searchModality["google"];

const targetURL = mapSearchURL(query, url ?? "about:blank");

// I'm not making this configurable yet, trying to stay focused.
const generatePrompt = promptModality["bori-standard"];

const prompt = await generatePrompt({
  query,
  url: targetURL,
  readURL,
  mapSearchURL,
});

let response = "";
await createCompletionStream({
  prompt,
  temperature: parseFloat(options.temperature),
  max_tokens: parseInt(options.maxTokens),
  onToken(data) {
    process.stdout.write(data);
    response += data;
  },
});

// TODO: save output to file
// await writeFile(
//   `./output/${Date.now()}-${sluggify(query)}.txt`,
//   prompt + response
// );

process.exit(0);
