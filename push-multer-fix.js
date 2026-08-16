import { execSync } from 'child_process';

try {
  console.log('Staging package.json updates...');
  execSync('git add .', { encoding: 'utf-8' });
  execSync('git commit -m "Add missing multer dependency for Vercel Serverless Function build"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed multer fix to GitHub!');
} catch (err) {
  console.log('Git push result:', err.stdout || err.message);
}
