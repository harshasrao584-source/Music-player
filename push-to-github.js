import { execSync } from 'child_process';
import fs from 'fs';

let resultLog = '';

try {
  resultLog += '--- STAGING CHANGES ---\n';
  resultLog += execSync('git add .', { encoding: 'utf-8' }) + '\n';
  
  resultLog += '--- COMMITTING ---\n';
  try {
    resultLog += execSync('git commit -m "Update database configuration, dependencies and seed script"', { encoding: 'utf-8' }) + '\n';
  } catch (commitErr) {
    resultLog += 'Commit note: ' + (commitErr.stdout || commitErr.message) + '\n';
  }

  resultLog += '--- PUSHING TO GITHUB ---\n';
  resultLog += execSync('git push', { encoding: 'utf-8' }) + '\n';
  resultLog += 'SUCCESSFULLY PUSHED TO GITHUB!\n';
} catch (err) {
  resultLog += 'Error: ' + err.message + '\n';
  if (err.stdout) resultLog += 'Stdout: ' + err.stdout + '\n';
  if (err.stderr) resultLog += 'Stderr: ' + err.stderr + '\n';
}

fs.writeFileSync('github-push.log', resultLog);
console.log('Push process logged to github-push.log');
