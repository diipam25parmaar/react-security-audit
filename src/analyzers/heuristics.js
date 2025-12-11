function makeIssue({ type, severity = 'medium', message, loc, suggestion }) {
  return { type, severity, message, loc, suggestion };
}

function checkNode(pathNode, filename) {
  const node = pathNode.node;
  const issues = [];

  if (node.type === 'JSXAttribute' && node.value && node.value.expression) {
    const expr = node.value.expression;
    if (expr.type === 'ArrowFunctionExpression' || expr.type === 'FunctionExpression') {
      issues.push(makeIssue({
        type: 'inline-prop-fn',
        severity: 'medium',
        message: 'JSX prop receives inline function — can cause re-renders for pure/memo components',
        loc: expr.loc,
        suggestion: 'Use useCallback or move function outside render to keep stable reference.'
      }));
    }
  }

  if (node.type === 'ArrayExpression' && node.elements && node.elements.length > 50) {
    issues.push(makeIssue({
      type: 'large-inline-array',
      severity: 'low',
      message: `Large inline array literal (${node.elements.length}) — consider importing or lazy loading`,
      loc: node.loc,
      suggestion: 'Move heavy arrays to separate module or fetch dynamically.'
    }));
  }

  if (node.type === 'ClassMethod' && node.key && node.key.name && /(componentWillMount|componentWillReceiveProps|componentWillUpdate)/.test(node.key.name)) {
    issues.push(makeIssue({
      type: 'deprecated-lifecycle',
      severity: 'high',
      message: `Deprecated lifecycle ${node.key.name} used — unsafe in newer React versions`,
      loc: node.loc,
      suggestion: 'Refactor to use componentDidMount/componentDidUpdate or useEffect.'
    }));
  }

  return issues.length ? issues : null;
}

function summarizeFile(ast, code, filename) {
  let usesHooks = false;
  let usesClass = false;
  traverseAst(ast, node => {
    if (node.type === 'FunctionDeclaration' || node.type === 'VariableDeclarator') {
      if (code.includes('useState(') || code.includes('useEffect(') || code.includes('useMemo(')) usesHooks = true;
    }
    if (node.type === 'ClassDeclaration') usesClass = true;
  });
  return { usesHooks, usesClass };
}

function traverseAst(ast, fn) {
  const stack = [ast.program];
  while (stack.length) {
    const node = stack.pop();
    fn(node);
    for (const key of Object.keys(node || {})) {
      const child = node[key];
      if (!child) continue;
      if (Array.isArray(child)) for (const c of child) if (c && typeof c.type === 'string') stack.push(c);
      else if (child && typeof child.type === 'string') stack.push(child);
    }
  }
}

module.exports = { checkNode, summarizeFile };
