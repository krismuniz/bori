# bori

A simple CLI for sourcing context for GPT-3 completions with browser automation in your terminal.

```shell
Usage: bori [options] <query>

Arguments:
  query                       the query you want to run

Options:
  -u, --url <url>             read a specific URL
  -s, --search <engine-name>  search engine name to browse the Web (when no --url is provided) (default: "google")
  --follow-result             follow first search result in the page
  -r, --reader <reader-name>  strategy to use to browse and read web pages (default: "readability")
  -t, --temperature <number>  temperature setting for Open AI completion (default: "0")
  -m, --max-tokens <number>   max tokens setting for Open AI completion (default: "250")
  -h, --help                  display help for command
```

## Requirements

- [Git](https://git-scm.com/downloads)
- [Node.js & npm](https://nodejs.org/en/) (v19.7.0)
  - Might work with earlier versions, but this is the one I used, so I can't guarantee it will work with earlier versions.
- [OpenAI API Key](https://platform.openai.com/docs/api-reference/authentication)
- A Chrome executable that supports the [new headless mode](https://developer.chrome.com/blog/headless-chrome/) (e.g. Chrome v59+ on macOS, Chrome v60+ on Windows)
  - You can check your Chrome version by going to `chrome://version` in your browser.
  - You might be able to use other browsers, but I haven't tested it.

## Setup

Your environment needs two environment variables:

- `CHROME_PATH` - the path to your Chrome executable
- `OPENAI_API_TOKEN` - your OpenAI API key

> HINT: If you set these in the `.env` file in the project's root directory, the CLI will automatically load them for you! (see the `.env.example` file for an example)

## Install and Build

```shell
# clone the repo
git clone git@github.com:krismuniz/bori.git bori

# navigate into the project's new directory
cd bori

# install dependencies
npm install

# build the project
npm run build

# link the project
npm link
```

## Usage

```shell
# you can run it from anywhere (when linked)
bori "How is the weather in Ponce?"

# or
bori "Summarize in four bullet points" --url "https://krismuniz.com/about"
```

Run with `--help` to see all the options.

```shell
bori --help
```

## Update

If you want to pull the latest changes from the repo, you can do so by running the following commands.

```shell
# while in the project directory
git pull

# then, rebuild the project
npm run build

# and finally, link the project again
npm link
```

## Uninstall

Just unlink the project from your global npm modules.

```shell
# to uninstall
# while in the project directory
npm unlink .
```

Then you can delete the project directory and you're good to go!

## License

[The MIT License (MIT)](https://github.com/krismuniz/bori/blob/main/LICENSE.md)

Copyright (c) 2023 [Kristian Muñiz](https://www.krismuniz.com)
