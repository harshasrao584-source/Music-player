import { execSync } from 'child_process';

try {
  console.log('Staging Vercel Serverless Function setup...');
  execSync('git add .', { encoding: 'utf-8' });
  execSync('git commit -m "Configure native Vercel Serverless API routes and MongoDB Atlas connection"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed Vercel Serverless API configuration to GitHub!');
} catch (err) {
  console.log('Git push result:', err.stdout || err.message);
}
