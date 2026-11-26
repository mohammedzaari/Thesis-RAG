/**
 * Application entry point.
 * Keeps bootstrap logic minimal: the Server class owns the whole lifecycle.
 */
import { Server } from './src/Server.js';

new Server().start().catch((error) => {
  console.error('[fatal] Unable to start the server:', error);
  process.exit(1);
});
