const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const heuristics = require('./heuristics');

function parseCode(code, file) {
  const plugins = ['jsx', 'classProperties', 'dynamicImport'];
  if (/\.tsx?$/.test(file)) plugins.push('typescript');
  return parser.parse(code, { sourceType: 'module', plugins });
}

async function analyzeFile(filepath) {
  const code = fs.readFileSync(filepath, 'utf8');
  const ast = parseCode(code, filepath);
  const issues = [];

  traverse(ast, {
    enter(pathNode) {
      try {
        const h = heuristics.checkNode(pathNode, filepath);
        if (h) issues.push(...h);
      } catch (err) {
      }
    }
  });

  const fileSummary = heuristics.summarizeFile(ast, code, filepath);
  return { file: filepath, issues, summary: fileSummary };
}

module.exports = { analyzeFile };
