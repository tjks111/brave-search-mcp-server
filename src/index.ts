#!/usr/bin/env node
import { getOptions } from './config.js';
import { stdioServer, httpServer } from './protocols/index.js';

async function main() {
  const options = getOptions();

  if (!options) {
    console.error('Invalid configuration');
    process.exit(1);
  }

  // default to stdio server
  if (options.transport === 'stdio') {
    await stdioServer.start();
    return;
  }

  if (options.transport === 'http') {
    httpServer.start();
    return;
  }

  console.error('Invalid transport');
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
