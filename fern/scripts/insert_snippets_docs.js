const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { extractSnippets } = require("./extract_snippets");

(async () => {
  try {
    const snippets = extractSnippets();

    const keywords = [
      "fromDocx",
      "generate",
      "merge",
      "detect",
      "mark",
      "fill",
    ];

    const keywordToSnippetsMap = {};

    const removeExpectLines = (snippet) => {
      return "("+snippet.split('\n').filter(line => !line.trim().startsWith('expect')).join('\n')+")();";
    };
    
    //maps each method to its snippet and removes expect lines
    keywords.forEach(keyword => {
      keywordToSnippetsMap[keyword] = snippets
        .filter(snippet => snippet.includes(keyword))
        .map(snippet => removeExpectLines(snippet));
    });

    console.log("Keyword to Snippets Map:", keywordToSnippetsMap);
  } catch (error) {
    console.error(error);
  }
})();
