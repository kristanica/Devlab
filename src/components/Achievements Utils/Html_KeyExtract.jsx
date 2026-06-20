export const extractTags = (html) => {
  const tagRegex = /<([a-zA-Z0-9]+)(\s|>)|<!--[\s\S]*?-->/g;
  const tags = [];
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    if (match[0].startsWith("<!--")) {
      tags.push("<!--");
    } else {
      tags.push(`<${match[1].toLowerCase()}>`);
    }
  }
  return [...new Set(tags)];
};
