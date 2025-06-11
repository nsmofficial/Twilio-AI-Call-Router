require('dotenv').config({ path: '.env.local' });
const ngrok = require('ngrok');
const { spawn } = require('child_process');
const { URL } = require('url');
const { logger } = require('./src/lib/logger'); // Import the logger

const port = 9003; // Your dev server port

(async function() {
  if (!process.env.NGROK_AUTHTOKEN) {
    console.error('Error: NGROK_AUTHTOKEN is not set in your .env.local file.');
    console.error('Please get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken');
    process.exit(1);
  }

  let url;
  try {
    url = await ngrok.connect({
      addr: port,
      authtoken_from_env: true,
      onStatusChange: (status) => {
        if (status === 'closed') {
          logger.warn('Ngrok tunnel closed.');
          process.exit();
        }
      },
    });
  } catch (error) {
    logger.error('Error starting ngrok tunnel:', error);
    process.exit(1);
  }

  // --- This is the new, centralized logging ---
  logger.info('🚀 Server starting up...');
  logger.info(`Ngrok tunnel established at: ${url}`);
  logger.info(`Forwarding to: http://localhost:${port}`);
  
  // Also log to console for immediate visibility
  console.log('--------------------------------------------------');
  console.log('Ngrok tunnel established successfully!');
  console.log(`Forwarding to: http://localhost:${port}`);
  console.log(`Public URL: ${url}`);
  console.log('See logs/app.log for detailed server logging.');
  console.log('--------------------------------------------------');

  const ngrokHost = new URL(url).hostname;

  // Start the Next.js dev server
  console.log('Starting Next.js development server...');
  const nextProcess = spawn('next', ['dev', '--turbopack', '-p', String(port)], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NGROK_HOST: ngrokHost,
    },
  });

  const shutdown = () => {
    logger.info('Shutting down server.');
    nextProcess.kill('SIGINT');
    ngrok.disconnect();
    process.exit();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  nextProcess.on('close', (code) => {
    logger.info(`Next.js process exited with code ${code}`);
    ngrok.disconnect();
    process.exit(code);
  });
})(); 