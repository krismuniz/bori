const pattern = /site:(\S+)/; // regular expression pattern to match "site:hostname.com" and any following non-whitespace characters
export function getSiteModifier(query: string): string | null {
  const match = query.match(pattern);
  if (!match || !match[0] || !match[1]) {
    return null;
  }

  return match[1];
}

type Search = (query: string, url?: string) => string;

export type WithSearch = {
  mapSearchURL: Search;
};

export const searchModality = {
  off: function transformURL(query, url) {
    if (url !== "about:blank") {
      return url;
    }

    return "about:blank";
  },
  google: function transformURL(query, url) {
    if (url === "about:blank") {
      return `https://google.com/search?q=${encodeURIComponent(query.trim())}`;
    }

    return url;
  },
  duckduckgo: function transformURL(query, url) {
    if (url === "about:blank") {
      return `https://duckduckgo.com/?q=${encodeURIComponent(query.trim())}`;
    }

    return url;
  },
} satisfies Record<string, Search>;

export type SearchModality = keyof typeof searchModality;
