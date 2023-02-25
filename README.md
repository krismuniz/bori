# bori

A simple CLI for sourcing OpenAI's GPT-3 API with browser automation in your terminal.

```shell
Usage: main [options] <query>

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

## License

[The MIT License (MIT)](https://github.com/krismuniz/minimo/blob/master/LICENSE.md)

Copyright (c) 2018 [Kristian Muñiz](https://www.krismuniz.com)
