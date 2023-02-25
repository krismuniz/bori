const decoder = new TextDecoder("utf-8");

export function tryParseJSON<T = unknown>(text: string, defaultValue: T) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return defaultValue;
  }
}

export const MODELS = ["text-davinci-003", "code-davinci-002"] as const;

export function createCompletion(opts: {
  token: string;
  model: (typeof MODELS)[number];
  temperature: number;
  max_tokens: number;
  content: string;
  stop: string[];
  onChange: (content: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.token}`,
      },
      body: JSON.stringify({
        model: opts.model,
        prompt: opts.content,
        temperature: opts.temperature,
        max_tokens: opts.max_tokens,
        stream: true,
        stop: opts.stop,
      }),
    })
      .then(async (response) => {
        if (!response.body) {
          opts.onError(new Error("Response doesn't have a body"));
          return;
        }

        const reader = response.body.getReader();

        do {
          const { done, value } = await reader.read();

          if (done) {
            opts.onDone();
            break;
          }

          const text = decoder.decode(value);
          const lines = text.split("\n").map((l) => {
            try {
              return tryParseJSON(l.replace("data: ", "").trim(), false);
            } catch (e) {
              return false;
            }
          });

          for (const data of lines.filter(Boolean)) {
            const choice = data.choices[0];
            const text = choice.text;

            opts.onChange(text);
          }
        } while (true);

        resolve();
      })
      .catch((e) => reject(e));
  });
}

export async function createCompletionStream(options: {
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  stop?: string[];
  onToken: (data: string) => void;
}) {
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_TOKEN}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: options.prompt,
      temperature: options.temperature ?? 0,
      max_tokens: options.max_tokens ?? 256,
      stream: true,
      stop: options.stop ?? ["\n\n"],
    }),
  });

  const decoder = new TextDecoder("utf-8");
  const reader = response.body?.getReader();

  if (!reader) {
    return;
  }

  do {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const text = decoder.decode(value);
    const lines = text.split("\n").map((l) => {
      try {
        return tryParseJSON(l.replace("data: ", "").trim(), false);
      } catch (e) {
        return false;
      }
    });

    for (const data of lines.filter(Boolean)) {
      const choice = data.choices[0];
      const text = choice.text;

      options.onToken(text);
    }
  } while (true);
}
