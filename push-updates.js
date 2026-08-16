import { execSync } from 'child_process';

try {
  execSync('git add .', { encoding: 'utf-8' });
  execSync('git commit -m "Support VITE_API_URL environment variable in AuthContext and AudioContext"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed VITE_API_URL updates to GitHub!');
} catch (err) {
  console.log('Push note:', err.stdout || err.message);
}
