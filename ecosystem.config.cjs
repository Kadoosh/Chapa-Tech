module.exports = {
  apps: [
    {
      name: 'lanchonete-backend',
      cwd: './backend',
      script: 'src/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'lanchonete-frontend',
      cwd: './frontend',
      script: './node_modules/vite/bin/vite.js',
      args: '--host',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
