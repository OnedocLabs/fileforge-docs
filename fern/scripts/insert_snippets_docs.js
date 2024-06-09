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

    const imports = `import { FileforgeClient } from "@fileforge/client";
import * as fs from "fs";\n\n(`;

    const removeExpectLinesAndInsertImports = (snippet) => {
      return imports + snippet.split('\n').filter(line => !line.trim().startsWith('expect')).join('\n')+")();";
    };
    
    snippets.forEach((func, index) => {
      keywords.forEach(keyword => {
        if( func.includes(keyword) ) {
          keywordToSnippetsMap[keyword] = removeExpectLinesAndInsertImports(func); // removes expect lines from the snippet
        }
      })
    });

    // writes snippets to openapi.yml
    const openApiDraft = path.join(__dirname, "../../openapi_draft.yml");

    const openApiDraftFile = yaml.load(
      fs.readFileSync(openApiDraft, "utf8")
    );

    const addFernExamples = (pathObj, sdkCode) => {
      pathObj['x-fern-examples'] = [
        {
          response: {
            body: null
          },
          'code-samples': [
            {
              sdk: 'typescript',
              code: sdkCode
            }
          ]
        }
      ]
    };

    Object.keys(openApiDraftFile.paths).forEach((path) => {
      const operations = openApiDraftFile.paths[path];
      Object.keys(operations).forEach((method) => {
        const operation = operations[method];
        const sdk_method = operation["x-fern-sdk-method-name"];
        
        if (keywordToSnippetsMap[sdk_method]) {
          addFernExamples(operation, keywordToSnippetsMap[sdk_method]);
        }
      });
    });
  
    // Convert the updated doc back to YAML
    const newYaml = yaml.dump(openApiDraftFile);
  
    // Write the updated YAML back to the file
    fs.writeFileSync("openapi.yml", newYaml, 'utf8');


  } catch (error) {
    console.error(error);
  }
})();
