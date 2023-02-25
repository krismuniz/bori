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

[The MIT License (MIT)](https://github.com/krismuniz/minimo/blob/master/LICENSE.md)

Copyright (c) 2018 [Kristian Muñiz](https://www.krismuniz.com)
