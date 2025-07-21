import { Command } from 'commander';

type Configuration = {
  transport: 'stdio' | 'http';
  port: number;
  host: string;
  braveApiKey: string;
};

const state: Configuration = {
  port: 8080,
  host: '0.0.0.0',
  braveApiKey: process.env.BRAVE_API_KEY ?? '',
  transport: (process.env.BRAVE_MCP_TRANSPORT as 'stdio' | 'http') ?? 'stdio',
};

export function getOptions(): Configuration | false {
  const program = new Command()
    .option('--transport <stdio|http>', 'transport type', state.transport)
    .option('--brave-api-key <string>', 'Brave API key', state.braveApiKey)
    .option(
      '--port <number>',
      'desired port for HTTP transport',
      process.env.BRAVE_MCP_PORT ?? '8080'
    )
    .option(
      '--host <string>',
      'desired host for HTTP transport',
      process.env.BRAVE_MCP_HOST ?? '0.0.0.0'
    )
    .allowUnknownOption()
    .parse(process.argv);

  const options = program.opts();

  if (!['stdio', 'http'].includes(options.transport)) {
    console.error(
      `Invalid --transport value: '${options.transport}'. Must be one of: stdio, http.`
    );
    return false;
  }

  if (options.transport === 'http') {
    if (options.port < 1 || options.port > 65535) {
      console.error(
        `Invalid --port value: '${options.port}'. Must be a valid port number between 1 and 65535.`
      );
      return false;
    }

    if (!options.host) {
      console.error('Error: --host is required');
      return false;
    }
  }

  // Update state
  state.braveApiKey = options.braveApiKey;
  state.transport = options.transport;
  state.port = options.port;
  state.host = options.host;

  return options as Configuration;
}

// Helper function to validate API key when needed
export function validateApiKey(): void {
  if (!state.braveApiKey) {
    throw new Error(
      'Brave API key is required to execute search tools. Please set the BRAVE_API_KEY environment variable or use the --brave-api-key command line option. You can get an API key at https://brave.com/search/api/'
    );
  }
}

export default state;
