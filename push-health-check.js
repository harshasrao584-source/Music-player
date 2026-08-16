import { execSync } from 'child_process';

try {
  console.log('Staging health check endpoints...');
  execSync('git add .', { encoding: 'utf-8' });
  execSync('git commit -m "Add /api/health troubleshooting endpoint to Vercel APIs"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed health check update to GitHub!');
} catch (err) {
  console.log('Git push result:', err.stdout || err.message);
}
