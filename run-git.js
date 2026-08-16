import { execSync } from 'child_process';
import fs from 'fs';

let output = '';

try {
  output += '=== GIT STATUS ===\n';
  output += execSync('git status', { encoding: 'utf-8' }) + '\n';

  output += '=== GIT REMOTES ===\n';
  output += execSync('git remote -v', { encoding: 'utf-8' }) + '\n';

  output += '=== RECENT COMMITS ===\n';
  output += execSync('git log -n 3 --oneline', { encoding: 'utf-8' }) + '\n';

  fs.writeFileSync('git-status.txt', output);
  console.log('Saved git status successfully');
} catch (err) {
  output += 'Error: ' + err.message + '\n';
  if (err.stdout) output += 'Stdout: ' + err.stdout + '\n';
  if (err.stderr) output += 'Stderr: ' + err.stderr + '\n';
  fs.writeFileSync('git-status.txt', output);
}
