export const extractSqlKeywords = (query) => {
  //  Recreate the regex each time so it NEVER keeps old state
  const keywordRegex = new RegExp(
    "\\b(SELECT|AND|NOT|UPDATE|LIKE|BETWEEN|DELETE)\\b",
    "gi"
  );

  const keywords = [];
  let match;

  while ((match = keywordRegex.exec(query)) !== null) {
    keywords.push(match[1].toUpperCase());
  }

  return [...new Set(keywords)]; //  remove duplicates
};
