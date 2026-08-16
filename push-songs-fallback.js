import { execSync } from 'child_process';

try {
  console.log('Staging static songs fallback...');
  execSync('git add .', { encoding: 'utf-8' });
  execSync('git commit -m "Implement local static songs data fallback in songController to guarantee visibility on Vercel"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed static fallback changes to GitHub!');
} catch (err) {
  console.log('Git push result:', err.stdout || err.message);
}
