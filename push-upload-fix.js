import { execSync } from 'child_process';

try {
  console.log('Staging Vercel uploads middleware fix...');
  execSync('git add .', { encoding: 'utf-8' });
  execSync('git commit -m "Fix Vercel serverless function startup crash caused by local uploads mkdirSync on read-only filesystem"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed Vercel upload.js fix to GitHub!');
} catch (err) {
  console.log('Git push result:', err.stdout || err.message);
}
