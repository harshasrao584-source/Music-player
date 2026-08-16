import fs from 'fs';
import app from './api/index.js';

fs.writeFileSync('test-api.log', 'Starting local API server...\n');

const PORT = 8089;
try {
  const server = app.listen(PORT, async () => {
    fs.appendFileSync('test-api.log', `Test API listening on port ${PORT}\n`);
    try {
      fs.appendFileSync('test-api.log', 'Sending request to /api/songs...\n');
      const response = await fetch(`http://127.0.0.1:${PORT}/api/songs`);
      fs.appendFileSync('test-api.log', `Response status: ${response.status}\n`);
      const data = await response.json();
      fs.appendFileSync('test-api.log', `Response data: ${JSON.stringify(data).slice(0, 500)}\n`);
    } catch (err) {
      fs.appendFileSync('test-api.log', `Fetch error: ${err.stack || err.message}\n`);
    } finally {
      server.close();
      fs.appendFileSync('test-api.log', 'Server closed.\n');
    }
  });
} catch (e) {
  fs.writeFileSync('test-api.log', `Error in starting app: ${e.stack || e.message}\n`);
}
