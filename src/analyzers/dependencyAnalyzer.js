const fs = require('fs');
const path = require('path');
const child = require('child_process');

async function analyzeDependencies(projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  const result = { reactVersion: null, audit: null };
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const reactVersion = (pkg.dependencies && (pkg.dependencies.react || pkg.dependencies['react'])) || (pkg.devDependencies && (pkg.devDependencies.react || pkg.devDependencies['react']));
    result.reactVersion = reactVersion || null;
  } catch (e) {
    result.error = 'package.json not found or unreadable';
    return result;
  }

  // try to run npm audit --json (best-effort)
  try {
    const out = child.execSync('npm audit --json', { cwd: projectPath, timeout: 20000, stdio: ['ignore','pipe','pipe'] });
    result.audit = JSON.parse(out.toString());
  } catch (e) {
    result.audit = { error: 'npm audit failed or not available in this environment', message: e.message };
  }

  return result;
}

module.exports = { analyzeDependencies };
