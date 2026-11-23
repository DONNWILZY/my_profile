import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  process.exitCode = code;
}
function run(script, args = []) {
  const child = spawn(process.execPath, [script, ...args], { cwd: root, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', (code, signal) => { if (!stopping) stop(signal ? 1 : code ?? 0); });
}
run(path.join(root, 'server/schedule-server.mjs'));
run(path.join(root, 'node_modules/vite/bin/vite.js'), process.argv.slice(2));
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
