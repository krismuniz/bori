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
