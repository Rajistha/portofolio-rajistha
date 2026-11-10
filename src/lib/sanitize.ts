import { FilterXSS, getDefaultWhiteList } from "xss";

// Pure-JS sanitizer: works on server and client without jsdom (whose ESM
// dependencies break on Vercel's serverless runtime).
const whiteList = getDefaultWhiteList();
for (const tag of ["p", "h1", "h2", "h3", "h4", "li", "ul", "ol", "blockquote", "pre", "code"]) {
  whiteList[tag] = [...(whiteList[tag] ?? []), "style", "class"];
}
whiteList.a = [...(whiteList.a ?? []), "target", "rel"];
whiteList.s = [];
whiteList.u = [];
whiteList.mark = [];
whiteList.hr = [];

const filter = new FilterXSS({
  whiteList,
  // Only allow text-align in inline styles.
  css: { whiteList: { "text-align": true } },
  stripIgnoreTagBody: ["script", "style"],
});

export function sanitizeHtml(html: string): string {
  return filter.process(html);
}
