const path = require('path');

/**
 * PM2 ecosystem — mismo archivo en Mac (dev/local) y Linux (prod).
 * Requiere: npm run build y backend/.env + frontend/.env.local en cada máquina.
 *
 * Uso:
 *   pm2 start ecosystem.config.cjs
 *   pm2 stop all
 *   pm2 logs
 */
module.exports = {
  apps: [
    {
      name: 'valet-back',
      cwd: path.join(__dirname, 'backend'),
      script: 'dist/server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      watch: false,
    },
    {
      name: 'valet-front',
      cwd: path.join(__dirname, 'frontend'),
      script: 'node_modules/.bin/next',
      args: ['start', '-p', '3005'],
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      watch: false,
    },
  ],
};
