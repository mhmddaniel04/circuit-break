import { loadEnv, type Plugin } from 'vite';
import { handleHintHttp } from './hintRoute.js';

/**
 * Serves /api/hint while running `npm run dev`, using the same code as the Vercel function.
 * Reads GEMINI_API_KEY from the .env file.
 */
export function devApiPlugin(): Plugin {
  return {
    name: 'circuit-break-dev-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');

      server.middlewares.use('/api/hint', async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);

        const request = new Request('http://localhost/api/hint', {
          method: req.method,
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': req.socket.remoteAddress ?? 'local',
          },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });

        const response = await handleHintHttp(request, env);
        res.statusCode = response.status;
        res.setHeader('content-type', 'application/json');
        res.end(await response.text());
      });
    },
  };
}
