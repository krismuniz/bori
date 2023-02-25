import path from "path";

export const ROOT_PATH = path.resolve(
  path.dirname(import.meta.url.replace("file://", "")),
  ".."
);
