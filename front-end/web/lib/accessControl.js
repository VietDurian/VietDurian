export const ACCESS_RULES = [
  { pattern: /^\/dashboard(?:\/.*)?$/, roles: ["admin"] },
  { pattern: /^\/chat(?:\/.*)?$/, roles: null },
  { pattern: /^\/profile\/ai(?:\/.*)?$/, roles: null },
  { pattern: /^\/profile\/details(?:\/.*)?$/, roles: null },
  { pattern: /^\/profile\/posts(?:\/.*)?$/, roles: null },
  { pattern: /^\/profile\/blogs\/create$/, roles: ["contentExpert"] },
  { pattern: /^\/profile\/blogs\/[^/]+$/, roles: ["contentExpert"] },
  { pattern: /^\/profile\/blogs$/, roles: ["contentExpert"] },
  { pattern: /^\/profile\/diaries(?:\/.*)?$/, roles: ["farmer"] },
  { pattern: /^\/profile\/harvest(?:\/.*)?$/, roles: ["farmer"] },
  { pattern: /^\/profile\/products\/create$/, roles: ["farmer"] },
  { pattern: /^\/profile\/products\/[^/]+\/edit$/, roles: ["farmer"] },
  { pattern: /^\/profile\/products\/[^/]+$/, roles: ["farmer"] },
  { pattern: /^\/profile\/products$/, roles: ["farmer"] },
  { pattern: /^\/profile\/resume\/create$/, roles: ["serviceProvider"] },
  { pattern: /^\/profile\/resume$/, roles: ["serviceProvider"] },
  { pattern: /^\/profile\/season-diaries\/create$/, roles: ["farmer"] },
  { pattern: /^\/profile\/season-diaries\/[^/]+\/diaries$/, roles: ["farmer"] },
  { pattern: /^\/profile\/season-diaries\/[^/]+\/edit$/, roles: ["farmer"] },
  {
    pattern: /^\/profile\/season-diaries\/[^/]+\/statistics$/,
    roles: ["farmer"],
  },
  { pattern: /^\/profile\/season-diaries\/[^/]+$/, roles: ["farmer"] },
  { pattern: /^\/profile\/season-diaries$/, roles: ["farmer"] },
  { pattern: /^\/profile\/statistics$/, roles: ["farmer"] },
  {
    pattern: /^\/profile\/submit-proof$/,
    roles: ["farmer", "contentExpert", "serviceProvider"],
  },
];

export const getAccessRule = (pathname) => {
  if (!pathname) return null;
  return ACCESS_RULES.find((rule) => rule.pattern.test(pathname)) || null;
};
