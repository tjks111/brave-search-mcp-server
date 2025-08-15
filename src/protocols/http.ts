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

  console.log('Starting HTTP server with config:', {
    braveApiKey: config.braveApiKey ? 'SET' : 'NOT SET',
    transport: config.transport,
    port: config.port,
    host: config.host
  });

  const app = express();

  app.use(express.json());

  app.all('/mcp', async (req: Request, res: Response) => {
    try {
      console.log('Received MCP request:', {
        method: req.method,
        headers: req.headers,
        body: req.body,
        url: req.url
      });

      const transport = new StreamableHTTPServerTransport({
        // Setting to undefined will opt-out of session-id generation
        sessionIdGenerator: undefined,
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      
      console.log('MCP request handled successfully');
    } catch (error) {
      console.error('MCP request error:', error);
      console.error('Error stack:', error.stack);
      if (!res.headersSent) {
        yieldGenericServerError(res);
      }
    }
  });

  app.all('/ping', (req: Request, res: Response) => {
    console.log('Ping request received');
    res.status(200).json({ message: 'pong' });
  });

  const httpServer = app.listen(config.port, config.host, () => {
    console.log(`Server is running on http://${config.host}:${config.port}/mcp`);
    console.log('Environment variables check:');
    console.log('BRAVE_API_KEY:', process.env.BRAVE_API_KEY ? 'SET' : 'NOT SET');
    console.log('Config braveApiKey:', config.braveApiKey ? 'SET' : 'NOT SET');
  });

  // Set server timeout to 25 seconds to work within Railway's limits
  httpServer.timeout = 25000;
  httpServer.keepAliveTimeout = 20000;
  httpServer.headersTimeout = 21000;
};

export default { start };
