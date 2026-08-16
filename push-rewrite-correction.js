import { execSync } from 'child_process';

try {
  console.log('Staging rewrite correction...');
  execSync('git add .', { encoding: 'utf-8' });
  execSync('git commit -m "Correct vercel.json rewrites to destination /api/index.js instead of /api to preserve request url paths"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed rewrite correction to GitHub!');
} catch (err) {
  console.log('Git push result:', err.stdout || err.message);
}
