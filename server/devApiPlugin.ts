import { loadEnv, type Plugin } from 'vite';
import { handleChatHttp } from './chatRoute.js';
import { handleHintHttp } from './hintRoute.js';

type Route = (request: Request, env: Record<string, string>) => Promise<Response>;

/** The same handlers as the Vercel functions in api/. */
const ROUTES: Record<string, Route> = {
  '/api/hint': handleHintHttp,
  '/api/chat': handleChatHttp,
};

/**
 * Serves /api/hint and /api/chat while running `npm run dev`, using the same code as Vercel.
 * Reads GEMINI_API_KEY from the .env file.
 */
export function devApiPlugin(): Plugin {
  return {
    name: 'circuit-break-dev-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');

      for (const [path, route] of Object.entries(ROUTES)) {
        server.middlewares.use(path, async (req, res) => {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);

          const request = new Request(`http://localhost${path}`, {
            method: req.method,
            headers: {
              'content-type': 'application/json',
              'x-forwarded-for': req.socket.remoteAddress ?? 'local',
            },
            body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
          });

          const response = await route(request, env);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          // Pass the answer on piece by piece, so streamed chat answers stay streamed.
          if (response.body) {
            for await (const piece of response.body) res.write(piece);
          }
          res.end();
        });
      }
    },
  };
}
