const fs = require("fs");
const acorn = require("acorn");
const { tsPlugin } = require("acorn-typescript");
const path = require("path");

// Function to check if a node contains any child function definitions
const containsChildFunction = (node) => {
  let contains = false;

  const checkNode = (n) => {
    for (const key in n) {
      if (n.hasOwnProperty(key)) {
        const child = n[key];
        if (Array.isArray(child)) {
          child.forEach((c) => {
            if (c && typeof c.type === "string") {
              if (
                c.type === "FunctionDeclaration" ||
                c.type === "FunctionExpression" ||
                c.type === "ArrowFunctionExpression"
              ) {
                contains = true;
              } else {
                checkNode(c);
              }
            }
          });
        } else if (child && typeof child.type === "string") {
          if (
            child.type === "FunctionDeclaration" ||
            child.type === "FunctionExpression" ||
            child.type === "ArrowFunctionExpression"
          ) {
            contains = true;
          } else {
            checkNode(child);
          }
        }
      }
    }
  };

  checkNode(node);
  return contains;
};

// Function to extract functions from a TypeScript file
const extractFunctions = (filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const ast = acorn.Parser.extend(tsPlugin()).parse(fileContent, {
    ecmaVersion: "latest",
    sourceType: "module",
  });

  const functions = [];

  const walk = (node) => {
    if (
      (node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression") &&
      !containsChildFunction(node)
    ) {
      const start = node.start;
      const end = node.end;
      const functionCode = fileContent.slice(start, end);
      functions.push(functionCode);
    }

    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach((n) => n && typeof n.type === "string" && walk(n));
        } else if (child && typeof child.type === "string") {
          walk(child);
        }
      }
    }
  };

  walk(ast);

  return functions;
};

// Main function
const extractSnippets = () => {
  const filePath = path.join(
    __dirname,
    "../sdk/packages/typescript/src/test/snippets.test.ts"
  ); // Change this to your TypeScript file
  const functions = extractFunctions(filePath);

  return functions;
};

module.exports = {
    extractSnippets
  };