const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

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
      const node = pathNode.node;
      try {
        // detect dangerouslySetInnerHTML usage
        if (node.type === 'JSXAttribute' && node.name && node.name.name === 'dangerouslySetInnerHTML') {
          issues.push({ type: 'dangerouslySetInnerHTML', severity: 'high', message: 'dangerouslySetInnerHTML used - ensure input is sanitized', loc: node.loc, suggestion: 'Avoid using dangerouslySetInnerHTML; sanitize input or use a library like DOMPurify.' });
        }

        // detect eval or new Function
        if (node.type === 'CallExpression' && node.callee && node.callee.name === 'eval') {
          issues.push({ type: 'eval', severity: 'high', message: 'Use of eval() detected', loc: node.loc, suggestion: 'Avoid eval(); find alternative parsing or logic.' });
        }
        if (node.type === 'NewExpression' && node.callee && node.callee.name === 'Function') {
          issues.push({ type: 'new-function', severity: 'high', message: 'new Function(...) detected', loc: node.loc, suggestion: 'Avoid using new Function; it is equivalent to eval().' });
        }

        // detect string argument to setTimeout/setInterval (bad)
        if (node.type === 'CallExpression' && node.callee && (node.callee.name === 'setTimeout' || node.callee.name === 'setInterval')) {
          if (node.arguments && node.arguments[0] && node.arguments[0].type === 'StringLiteral') {
            issues.push({ type: 'timeout-string-arg', severity: 'medium', message: `${node.callee.name} called with string argument`, loc: node.loc, suggestion: 'Pass a function instead of a string.' });
          }
        }

        // detect direct assignment to innerHTML
        if (node.type === 'AssignmentExpression' && node.left && node.left.property && node.left.property.name === 'innerHTML') {
          issues.push({ type: 'innerHTML-assign', severity: 'high', message: 'Direct assignment to innerHTML detected', loc: node.loc, suggestion: 'Avoid innerHTML assignment or ensure content is sanitized.' });
        }

        // detect target="_blank" without rel="noopener noreferrer"
        if (node.type === 'JSXOpeningElement' && node.name && node.name.name === 'a') {
          let hasTargetBlank = false;
          let hasRel = false;
          for (const attr of node.attributes || []) {
            if (attr.name && attr.name.name === 'target' && attr.value && attr.value.value === '_blank') hasTargetBlank = true;
            if (attr.name && attr.name.name === 'rel') hasRel = true;
          }
          if (hasTargetBlank && !hasRel) {
            issues.push({ type: 'noopener-missing', severity: 'medium', message: '<a target="_blank"> missing rel="noopener noreferrer"', loc: node.loc, suggestion: 'Add rel="noopener noreferrer" to external links opened in new tabs.' });
          }
        }

      } catch (e) {
        // ignore per-node parse errors
      }
    }
  });

  return { file: filepath, issues };
}

module.exports = { analyzeFile };
