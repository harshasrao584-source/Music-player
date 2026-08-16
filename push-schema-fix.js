import { execSync } from 'child_process';

try {
  console.log('Staging vercel.json schema validation fix...');
  execSync('git add .', { encoding: 'utf-8' });
  // Include deleted files (root vercel.json)
  execSync('git add -A', { encoding: 'utf-8' });
  execSync('git commit -m "Fix vercel.json schema validation by removing handle and using static assets exclusion pattern"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed Vercel schema validation fix to GitHub!');
} catch (err) {
  console.log('Git push result:', err.stdout || err.message);
}
