import { execSync } from 'child_process';

try {
  console.log('Staging background glow changes...');
  execSync('git add .', { encoding: 'utf-8' });
  execSync('git commit -m "Add ambient blurred violet and fuchsia background glow elements to MainLayout"', { encoding: 'utf-8' });
  execSync('git push', { encoding: 'utf-8' });
  console.log('Successfully pushed background changes to GitHub!');
} catch (err) {
  console.log('Git push result:', err.stdout || err.message);
}
