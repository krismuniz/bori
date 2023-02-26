import { encode, decode } from "gpt-3-encoder";

export function truncateString(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

/**
 * Basically GPT-truncate!
 *
 * Allows for a string to be truncated to a certain number of tokens.
 */
export function truncateTokens(str: string, length: number): string {
  const encoded = encode(str);

  if (encoded.length <= length) {
    return str;
  } else {
    return decode(encoded.slice(0, length)) + "...";
  }
}
