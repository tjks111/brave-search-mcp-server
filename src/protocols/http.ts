import express, { type Request, type Response } from 'express';
import config from '../config.js';
import { server } from '../server.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const yieldGenericServerError = (res: Response) => {
  res.status(500).json({
    id: null,
    jsonrpc: '2.0',
    error: { code: -32603, message: 'Internal server error' },
  });
};

export const start = () => {
  if (!config.ready) {
    console.error('Invalid configuration');
    process.exit(1);
  }

  const app = express();

  app.use(express.json());

  app.all('/mcp', async (req: Request, res: Response) => {
    try {
      // Set longer timeout for Railway (default is 30s, we'll set 25s to be safe)
      req.timeout = 25000;
      res.timeout(25000);
      
      const transport = new StreamableHTTPServerTransport({
        // Setting to undefined will opt-out of session-id generation
        sessionIdGenerator: undefined,
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('MCP request error:', error);
      if (!res.headersSent) {
        yieldGenericServerError(res);
      }
    }
  });

  app.all('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
  });

  const httpServer = app.listen(config.port, config.host, () => {
    console.log(`Server is running on http://${config.host}:${config.port}/mcp`);
  });

  // Set server timeout to 30 seconds (Railway's limit)
  httpServer.timeout = 30000;
  httpServer.keepAliveTimeout = 25000;
  httpServer.headersTimeout = 26000;
};

export default { start };
