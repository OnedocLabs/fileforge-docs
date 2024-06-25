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
      "extract",
      "split",
      "insert",
    ];

    const curlSnippets = {
      fromDocx: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/docx/'\n \
-H 'accept: application/pdf'\n \
-H 'X-API-Key: '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={"keepOriginalStyles":true,"templateLiterals":{"additionalProp1":"string","additionalProp2":"string","additionalProp3":"string"}};type=application/json'\n \
  -F 'file=@demo.docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document'`,
      generate: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/generate/'\n \
-H 'accept: application/pdf'\n \
-H 'X-API-Key: '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={"test":true,"host":false,"expiresAt":"2024-06-21T12:10:51.382Z","fileName":"document"};type=application/json'\n \
  -F 'files=@index.html;type=text/html'`,
      merge: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/merge/'\n \
-H 'accept: application/pdf'\n \
-H 'X-API-Key: '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={};type=application/json'\n \
  -F 'files=@doc.pdf;type=application/pdf'\n \
  -F 'files=@document (18).pdf;type=application/pdf'`,
      detect: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/form/detect/'\n \
-H 'accept: application/json'\n \
-H 'X-API-Key: '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={};type=application/json'\n \
  -F 'file=@document (18).pdf;type=application/pdf'\n`,
      mark: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/form/mark/'\n \
-H 'accept: application/pdf'\n \
-H 'X-API-Key: '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={};type=application/json'\n \
  -F 'file=@document (18).pdf;type=application/pdf'`,
      fill: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/form/fill/'\n \
-H 'accept: application/pdf'\n \
-H 'X-API-Key: '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={"fields":[{"name":"string","type":"PDFTextField","value":"string"},{"name":"string","type":"PDFCheckBox","checked":true},{"name":"string","type":"PDFOptionList","selected":["string"]},{"name":"string","type":"PDFRadioGroup","selected":"string"}]};type=application/json'\n \
  -F 'file=@document (18).pdf;type=application/pdf'`,
      extract: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/extract/'\n \
-H 'accept: application/json'\n \
-H 'X-API-Key
: '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={start:1,end:1};type=application/json'\n \
  -F 'file=@document (18).pdf;type=application/pdf'`,
      split: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/split/'\n \
-H 'accept: application/zip'\n \
-H 'X-API-Key : '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={splitPage:1};type=application/json'\n \
  -F 'file=@document (18).pdf;type=application/pdf'`,
      insert: `curl -X 'POST'\n \
'https://api.fileforge.com/pdf/insert/'\n \
-H 'accept: application/pdf'\n \
-H 'X-API-Key : '\n \
-H 'Content-Type: multipart/form-data'\n \
  -F 'options={insertPage:1};type=application/json'\n \
  -F 'files=@doc.pdf;type=application/pdf'\n \
  -F 'files=@document (18).pdf;type=application/pdf'`,
    };

    const keywordToSnippetsMap = {};

    const imports = `import { FileforgeClient } from "@fileforge/client";
import * as fs from "fs";\n\n(`;

    const removeExpectLinesAndInsertImports = (snippet) => {
      return (
        imports +
        snippet
          .split("\n")
          .filter((line) => !line.trim().startsWith("expect"))
          .join("\n") +
        ")();"
      );
    };

    snippets.forEach((func, index) => {
      keywords.forEach((keyword) => {
        if (func.includes(keyword)) {
          keywordToSnippetsMap[keyword] =
            removeExpectLinesAndInsertImports(func); // removes expect lines from the snippet
        }
      });
    });

    // writes snippets to openapi.yml
    const openApiDraft = path.join(__dirname, "../../openapi.yml");

    const openApiDraftFile = yaml.load(fs.readFileSync(openApiDraft, "utf8"));

    const addFernExamples = (pathObj, sdkCode, sdk_method) => {
      pathObj["x-fern-examples"] = [
        {
          response: {
            body: null,
          },
          "code-samples": [
            {
              sdk: "curl",
              code: curlSnippets[sdk_method],
            },
            {
              sdk: "typescript",
              code: sdkCode,
            },
          ],
        },
      ];
    };

    Object.keys(openApiDraftFile.paths).forEach((path) => {
      const operations = openApiDraftFile.paths[path];
      Object.keys(operations).forEach((method) => {
        const operation = operations[method];
        const sdk_method = operation["x-fern-sdk-method-name"];

        if (keywordToSnippetsMap[sdk_method]) {
          addFernExamples(
            operation,
            keywordToSnippetsMap[sdk_method],
            sdk_method
          );
        }
      });
    });

    // Convert the updated doc back to YAML
    const newYaml = yaml.dump(openApiDraftFile);

    // Write the updated YAML back to the file
    fs.writeFileSync(
      path.join(__dirname, "../../openapi.yml"),
      newYaml,
      "utf8"
    );
  } catch (error) {
    console.error(error);
  }
})();
