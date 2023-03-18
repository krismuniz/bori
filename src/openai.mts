export interface ChatCompletion {
  id: string;
  object: string;
  created: number;
  choices: ChatChoice[];
  usage: ChatUsage;
}

export interface ChatChoice {
  index: number;
  delta: ChatMessage;
  finish_reason: "stop" | null;
}

export interface ChatMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export function tryParseJSON<T = unknown>(text: string, defaultValue: T) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return defaultValue;
  }
}

export const MODELS = ["gpt-4"] as const;

export async function createCompletionStream(options: {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stop?: string[];
  onChange: (data: string) => void;
}) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_TOKEN}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: options.messages,
      temperature: options.temperature ?? 0,
      max_tokens: options.max_tokens ?? 256,
      stream: true,
      stop: options.stop ?? ["[END]"],
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

    const lines = text.split("\n").map<ChatCompletion | null>((l) => {
      try {
        return tryParseJSON<ChatCompletion | null>(
          l.replace("data: ", "").trim(),
          null
        );
      } catch (e) {
        console.log(e);
        return null;
      }
    });

    for (const data of lines.filter(Boolean)) {
      const choice = data.choices[0];
      const text = choice.delta.content ?? "";

      options.onChange(text);
    }
  } while (true);
}
