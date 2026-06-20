// utils/extractJsKeywords.js
export const extractJsKeywords = (code) => {
  const keywordRegex =
    /\b(console\.log|let|const|var|if|else|try|catch|async|await|for|while|function)\b/g;
  const keywords = [];
  let match;

  while ((match = keywordRegex.exec(code)) !== null) {
    keywords.push(match[1]); // capture the actual keyword
  }

  return [...new Set(keywords)]; // remove duplicates
};
