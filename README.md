# bori

A simple CLI for sourcing OpenAI's GPT-3 API with browser automation in your terminal.

```shell
Usage: bori [options] <query>

Arguments:
  query                       the query you want to run

Options:
  -u, --url <url>             read a specific URL
  -s, --search <engine-name>  search engine name to browse the Web (when no --url is provided) (default: "google")
  -r, --reader <reader-name>  strategy to use to browse and read web pages (default: "readability")
  -t, --temperature <number>  temperature setting for Open AI completion (default: "0")
  -m, --max-tokens <number>   max tokens setting for Open AI completion (default: "250")
  -h, --help                  display help for command
```

## Requirements

- [Node.js](https://nodejs.org/en/) (v19.7.0)
  - Might work with earlier versions, but this is the one I used, so I can't guarantee it will work with earlier versions.

* [OpenAI API Key](https://platform.openai.com/docs/api-reference/authentication)
* A Chrome executable that supports the [new headless mode](https://developer.chrome.com/blog/headless-chrome/) (e.g. Chrome v59+ on macOS, Chrome v60+ on Windows)

## Setup

Your environment needs two environment variables:

- `CHROME_PATH` - the path to your Chrome executable
- `OPENAI_API_TOKEN` - your OpenAI API key

## Installation

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

# then, you can run it from anywhere!
```

```shell
# run the CLI
bori "How is the weather in Ponce?"

# or
bori "Summarize in four bullet points" --url "https://krismuniz.com/about"
```

```shell
# to uninstall
# while in the project directory
npm unlink .
```

## License

[The MIT License (MIT)](https://github.com/krismuniz/bori/blob/main/LICENSE.md)

Copyright (c) 2023 [Kristian Muñiz](https://www.krismuniz.com)
